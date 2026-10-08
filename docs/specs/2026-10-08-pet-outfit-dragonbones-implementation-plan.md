# 宠物装扮实施计划

> **日期**：2026-10-08  
> **状态**：待执行  
> **关联设计**：[2026-10-08-pet-outfit-dragonbones-design.md](./2026-10-08-pet-outfit-dragonbones-design.md)

按设计说明拆成可独立验收的任务。顺序是测试框架 → 领域 → 存储 → 应用服务 → 渲染 → 页面。小鸡骨架未落地前，所有物种继续走现有 PNG，兑换、穿着、历史和备份仍可验收。

自动检查分两层：`npm test` 跑 Vitest，`npm run build` 做类型检查。Vitest 只测纯逻辑和用内存仓储替身驱动的服务。Pixi、DragonBones、页面和 PWA 不写单测，用文末手工清单验收。

不改商城、我的券、`/shop/history`。不引入 Cocos 或 Spine。不引入 Jest、React Testing Library 或端到端浏览器测试。

---

## 任务 0：引入 Vitest

**完成标准**

- 开发依赖增加 `vitest`，版本与当前 Vite 8 兼容。
- `package.json` 增加 `test` 脚本，执行 `vitest run`。
- `vite.config.ts` 增加 `test` 配置，环境为 `node`。路径别名 `@/` 在测试里可用。
- 放一个通过的示例测试后删掉，或直接由任务 1 的测试代替。`npm test` 与 `npm run build` 都能通过。
- 测试文件放在被测文件旁边，命名 `*.test.ts`。

**文件**

- `package.json`
- `vite.config.ts`

---

## 任务 1：宠物记下当前套装

**完成标准**

- `Pet` 有 `outfitSetId`。构造时缺省、空串都变成 `default`。
- `toJSON` 带上该字段。
- `DexiePetRepository` 的 `PetRecord`、`toDomain`、`toPersistence` 读写该字段。库里没有这个字段的旧记录读出来是 `default`。
- `pets` 表不升版本、不加索引。
- `Pet.test.ts` 覆盖：缺省、空串变为 `default`；`toJSON` 含该字段。
- 记录和 `Pet` 的字段转换抽成纯函数，单测覆盖「记录缺少 `outfitSetId` 时得到 `default`」。不在单测里打开 Dexie。

**文件**

- `src/domain/models/Pet.ts`
- `src/domain/models/Pet.test.ts`
- `src/infrastructure/database/repositories/petRecord.ts`
- `src/infrastructure/database/repositories/petRecord.test.ts`
- `src/infrastructure/database/repositories/DexiePetRepository.ts`

---

## 任务 2：兑换记录模型与积分回滚

**完成标准**

- 新增 `OutfitLog`。字段：`id`、`childId`、`outfitSetId`、`outfitName`、`pointsCost`、`redeemedAt`。`pointsCost` 必须为正整数。
- `PointBalance.reversePetSpend(amount)`：金额为正且不超过 `totalSpentOnPet` 时减回，否则抛错。不改 `totalSpentOnReward`。
- `PointService` 露出对应方法。
- `OutfitLog.test.ts`：`pointsCost` 为 0 或负数时创建失败。
- `PointBalance.test.ts`：`reversePetSpend` 成功时只减少 `totalSpentOnPet`；金额超过宠物消费时抛错，余额不变。

**文件**

- `src/domain/models/OutfitLog.ts`
- `src/domain/models/OutfitLog.test.ts`
- `src/domain/models/PointBalance.ts`
- `src/domain/models/PointBalance.test.ts`
- `src/application/services/PointService.ts`

---

## 任务 3：装扮目录与就绪判断

**完成标准**

- `OutfitSetDefinition` 与目录常量。本期只有 `default`：`points = 0`，`pack = null`，名称固定。
- 纯函数 `resolveOutfitSetId(id)`：空串或未知 id 返回 `default`。
- 纯函数 `isOutfitPackReady(def, files)`：`default` 恒为就绪。付费套在 `files` 同时包含该 `pack` 下的 `young_ske.json`、`young_tex.json`、`young_tex.png`、`grown_ske.json`、`grown_tex.json`、`grown_tex.png` 时才就绪。
- 领域层不读文件系统。
- `outfitCatalog.test.ts` 覆盖：空串和未知 id 解析为 `default`；`default` 在文件列表为空时就绪；付费套六文件齐才就绪，缺任意一个不就绪。

**文件**

- `src/domain/outfits/outfitCatalog.ts`
- `src/domain/outfits/outfitCatalog.test.ts`

---

## 任务 4：IndexedDB v8 与兑换记录仓储

**完成标准**

- `DexieDatabase` 升到 v8，新表 `outfitLogs`，索引为 `id, childId, outfitSetId, redeemedAt, [childId+outfitSetId], [childId+redeemedAt]`。已有表的索引声明保持与 v7 一致。
- `IOutfitLogRepository` / `DexieOutfitLogRepository`：按孩子列出（`redeemedAt` 倒序）、按 `childId + outfitSetId` 查找、插入。
- 不写迁移脚本去改旧宠物行。

**文件**

- `src/domain/repositories/IOutfitLogRepository.ts`
- `src/infrastructure/database/DexieDatabase.ts`
- `src/infrastructure/database/repositories/DexieOutfitLogRepository.ts`

---

## 任务 5：备份兼容

**完成标准**

- `BackupData` 增加可选 `outfitLogs`。`version` 仍为 1。
- 导出包含该数组。导入时缺失当作 `[]`；不是数组则拒绝。
- 导入宠物时缺 `outfitSetId` 或指向未知套装，写成 `default`。`isDisplayed` 补齐逻辑不变。
- 重置数据时清空 `outfitLogs`。
- 把「缺 `outfitSetId` / 未知套装写成 `default`」和「`outfitLogs` 缺失当空数组、非数组则拒绝」抽成可单测的纯函数，由适配器调用。测试不打开 IndexedDB。

**文件**

- `src/domain/repositories/IBackupAdapter.ts`
- `src/infrastructure/storage/JsonBackupAdapter.ts`
- `src/infrastructure/storage/backupNormalize.ts`
- `src/infrastructure/storage/backupNormalize.test.ts`

---

## 任务 6：购买、穿着与互斥

**完成标准**

- `OutfitService.buy(outfitSetId)` 按设计说明第 7.1 节返回 `unknown` / `already_owned` / `insufficient_points`。成功时 `spendOnPet`，并插入一条日志，`outfitName` 用目录里的名称。不修改任何宠物的 `outfitSetId`。
- 插入日志失败时调用 `reversePetSpend` 回滚本次金额。
- `equip(petId, outfitSetId)` 按第 7.2 节。成功只改该宠物的 `outfitSetId`。
- `listLogs()` 返回倒序记录。已拥有 = 存在该 `outfitSetId` 的日志。`default` 始终视为已拥有，且没有日志。
- 与喂食、领养互斥：抽出一把异步互斥，`OutfitService` 与 `PetService` 的喂食、领养、切换展示共用。喂食和领养在锁已被占用时保持现在的行为：直接失败，不排队执行第二次。装扮连点也不得扣两次；第二次要么在第一次提交后得到 `already_owned`，要么在锁占用时直接失败且不扣分。
- `container.ts` 注册 `outfitService`。
- `OutfitService.test.ts` 使用内存版宠物仓储、兑换记录仓储和积分服务，覆盖：兑换成功写一条日志且不改穿着；再次兑换得到 `already_owned` 且积分不变；积分不足不写日志；未知 id 与未就绪套装得到 `unknown`；插入失败时宠物消费被回滚；未拥有不能穿上；穿上 `default` 不要求日志；穿上不新增日志。
- `asyncMutex.test.ts` 覆盖：锁占用时第二次立即失败，不排队执行。

**文件**

- `src/shared/asyncMutex.ts`
- `src/shared/asyncMutex.test.ts`
- `src/application/services/OutfitService.ts`
- `src/application/services/OutfitService.test.ts`
- `src/application/services/PetService.ts`
- `src/shared/container.ts`

---

## 任务 7：骨骼播放器与形象组件

**完成标准**

- 依赖只增加 `pixi.js@7`。DragonBonesJS 5.6 的 Pixi 工厂放在 `src/infrastructure/dragonbones/`，版本固定在仓库里。除此之外的文件不允许 import `pixi.js` 或 DragonBones。
- `PetCharacterPlayer` 挂在调用方提供的容器上。能加载 `public/pets/armatures/young` 与 `grown`，按物种和阶段替换 `bodyBack` / `bodyFront`，按套装替换 `outfitBody` / `outfitHead`。`motion` 为 `paused` 时停在 setup pose；`idle` 循环；`eat` / `pet` 播一次后回到 `idle`。动作缺失时播 `idle`。
- `destroy()` 释放 Pixi 应用和纹理。
- `PetAvatar` 接收 `type`、`stage`、`outfitSetId`、`motion`。蛋，或该物种两套身体包未同时存在，或加载失败：渲染现有 `getPetImage`。加载失败时 toast 一次。未知 `outfitSetId` 按 `default` 显示。
- 物种是否改走骨骼，由身体包文件是否存在决定，不写死「只有小鸡」。

**文件**

- `package.json`
- `src/infrastructure/dragonbones/`
- `src/presentation/pet/PetCharacterPlayer.ts`
- `src/presentation/pet/PetAvatar.tsx`

**说明**

没有真实骨架文件时，本任务以 PNG 兜底路径验收。骨骼替换留到任务 12。

---

## 任务 8：现有宠物画面改走 PetAvatar

**完成标准**

- 以下位置改用 `PetAvatar`，并传入该宠物自己的 `outfitSetId`：
  - `src/presentation/pages/Pet/PetDisplay.tsx`（或由宠物页把形象交给 `PetAvatar`，进化闪光和壳碎片仍留在原演出里）
  - `src/presentation/pages/Home/PetMiniCard.tsx`
  - `src/presentation/pages/PetCollection/CollectionCard.tsx`（仅已领养）
  - `src/presentation/pages/Pet/RaisingShortcutCard.tsx`
- 未领养图鉴卡仍用静态代表图。
- 宠物页：`idle`；喂食触发 `eat`；抚摸触发 `pet`。首页、图鉴、养成卡为 `paused`。
- 进化揭开前显示 `prevStage`，揭开后切到新阶段。`EvolutionFx` 不放进骨架。
- 仍走 PNG 的物种保留现有喂食点头。已走骨架的物种不再用这套 Framer 旋转。
- 离开这些页面后不留下仍在播放的 canvas。

**文件**

- 上列四个展示组件
- `src/presentation/pages/Pet/index.tsx`

---

## 任务 9：路由、入口与装扮状态

**完成标准**

- `ROUTES` 增加 `PET_OUTFITS = '/pet/outfits'`、`PET_OUTFIT_HISTORY = '/pet/outfits/history'`。
- `App.tsx` 懒加载两页。`TabBar` 的宠物 Tab `matchPaths` 包含这两条。
- 宠物页工具栏在已有展示宠时，图鉴按钮旁增加「装扮」，进入装扮页。创建宠物表单上没有这个按钮。
- `useOutfitStore`：拉取目录中已就绪套装、当前展示宠、积分、日志；提供 `buy`、`equip`。成功后刷新宠物状态和积分。

**文件**

- `src/shared/constants.ts`
- `src/App.tsx`
- `src/presentation/layouts/TabBar.tsx`
- `src/presentation/pages/Pet/PetToolbar.tsx`
- `src/presentation/pages/Pet/index.tsx`
- `src/presentation/hooks/useOutfitStore.ts`

**说明**

就绪文件列表由构建期能访问的 `public/pets` 清单判断。实现时用一份与 `public/pets/armatures`、`public/pets/outfits` 对应的清单模块，避免在浏览器里探测任意路径。本期清单为空付费套、身体包未放入清单，因此装扮页只会列出 `default`。

---

## 任务 10：装扮页

**完成标准**

- 标题下显示当前展示宠名字。没有展示宠时回到 `/pet`。
- 上方只有一个预览，物种和阶段取自展示宠，套装取自当前选中行，`motion` 为 `paused`。
- 列表包含全部已就绪套装和 `default`。每行有名称、积分、状态。
- 未拥有且积分足够：按钮「兑换」。成功 toast，该行变为已拥有，不自动穿上。
- 积分不足：按钮不可点，并给出现有风格的不足提示。
- 已拥有且不是当前穿着：「穿上」。当前穿着显示「穿着中」。可穿回 `default`。
- 有进入兑换记录的入口。
- 商城页面无装扮入口，兑换不产生 `rewardLogs`。

**文件**

- `src/presentation/pages/PetOutfits/index.tsx`

---

## 任务 11：装扮兑换记录页

**完成标准**

- 展示全部 `outfitLogs`：`outfitName`、`pointsCost`、`redeemedAt` 的中文日期。新的在前。
- 没有记录时显示「还没有兑换记录」。
- 没有退还、没有核销。返回 `/pet/outfits`。
- 目录中已删除的套装，历史仍显示日志上的名称。

**文件**

- `src/presentation/pages/PetOutfitHistory/index.tsx`

---

## 任务 12：小鸡默认骨架

**完成标准**

- `public/pets/armatures/young/` 与 `grown/` 放入 DragonBones 5.6 文件，槽位和动作名符合设计说明第 4 节。
- 小鸡的 `bodyBack`、`bodyFront`、`default` 的 `outfitBody`、`outfitHead` 能在刚孵化与成长期两个阶段显示。
- 清单模块把小鸡标记为骨架就绪。小兔、小猫、小狗仍走 PNG。
- 宠物页小鸡播放 `idle`，喂食、抚摸切动作。蛋仍是 `stage-1-egg.png`。
- `vite.config.ts` 的 `workbox.globPatterns` 纳入 `json`，使 `*_ske.json` 与 `*_tex.json` 进入 PWA 预缓存。

**文件**

- `public/pets/armatures/young/`
- `public/pets/armatures/grown/`
- 任务 9 的资源清单模块
- `vite.config.ts`

**说明**

这是美术任务。代码任务 1–11 不依赖它。

---

## 任务 13：其余物种与第一套付费装扮

**完成标准**

- 小兔、小猫、小狗的身体显示对象补进两套身体包后，清单改为就绪，三只离开 PNG 兜底。
- 第一套付费装扮按设计说明第 5 节追加目录项和 `public/pets/outfits/{id}/` 的六文件。六文件未齐时，装扮页不出现该套。
- 兑换该套后历史多一条；再兑不扣分、不增加第二行；穿上后展示宠在 `young` 与 `grown` 都是这套衣服。

**文件**

- `src/domain/outfits/outfitCatalog.ts`
- `public/pets/outfits/{id}/`
- 身体包与资源清单

**说明**

在任务 12 的小鸡闭环验收通过后再做。

---

## 手工验收

`npm test` 与 `npm run build` 通过后，任务 11 用 `default` 再手工走通：

1. 有宠物时，宠物页能进入装扮页；创建表单上没有入口。底部仍是宠物 Tab。
2. 装扮页只有默认套，状态为穿着中。商城和 `/shop/history` 无变化。
3. 导出备份再导入，宠物仍是 `default`。一份没有 `outfitLogs` 和 `outfitSetId` 的旧备份可以导入。
4. 离开宠物页和装扮页后，页面上没有残留 canvas。

任务 12 完成后补：

5. 小鸡刚孵化走 `young`，喂到成长期后走 `grown`。蛋画面没有骨架。喂食、抚摸有动作，进化揭开时切阶段，壳碎片仍在骨架外面。
6. 其他物种仍是原来的阶段 PNG，喂食和进化数值正常。

任务 13 完成后补：

7. 兑换付费套后，`outfitLogs` 多一条，记录页能看到名称、积分、日期。`totalSpentOnPet` 增加，`totalSpentOnReward` 不变，奖励券列表没有新记录。
8. 再兑同一套不扣分，历史仍是一行。
9. 穿上后首页和宠物页都是这套。另一只宠物的穿着不变。
10. 积分不足时不能兑换。
