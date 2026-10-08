# 宠物装扮（DragonBones）设计规范

> **日期**：2026-10-08  
> **状态**：已确认，实施计划见 [2026-10-08-pet-outfit-dragonbones-implementation-plan.md](./2026-10-08-pet-outfit-dragonbones-implementation-plan.md)  
> **关联**：[多宠物养成设计规范](./2026-09-14-multi-pet-design-spec.md) · [进化动画设计规范](./2026-09-14-evolution-animation-spec.md)

## 1. 背景

宠物外观目前由 `IPetTypeStrategy.stageImage(stage)` 决定，一张 PNG 同时包含身体、衣服、翅膀和光环。按「每套衣服 × 每种宠物 × 每个阶段」重画全身，张数会随衣服线性上涨。

衣服是数字道具：买下即拥有，可反复穿，卸下不退积分。现有商城奖励是家长兑现的券（`pending` / `used` / `returned`），不能承载装扮。

本规范把外观改成二维骨骼换装。运行时使用免费的 DragonBones 5.6，留在现有 React 应用中，不引入 Cocos，不使用 Spine。

## 2. 目标

- 一套衣服只制作一份附件，四种宠物、多个阶段和多个动作共用。
- 装扮独立成页，从宠物页进入，展示目录中的全部套装。用积分兑换，不进入商城，不产生奖励券。
- 每次成功兑换写一条装扮兑换记录。记录只追加，不核销、不退还。
- 每只宠物各自穿着。首页、宠物页、图鉴、养成卡展示同一套穿着。
- 喂食、抚摸由骨骼动作播放。进化闪光和蛋壳粒子仍叠在角色之上。
- 旧备份缺少装扮字段时导入为默认套，不报错。

## 3. 非目标

- 不做三维蒙皮，不把应用迁到 Cocos 或 Spine。
- 不把装扮做成 `Reward` / `RewardLog`，家长不能自建装扮。
- 不支持单件混搭。装扮页按套兑换，一次换掉该套的全部槽位。
- 不把装扮兑换写进 `rewardLogs`，也不在 `/shop/history` 展示。
- 兑换记录不包含「穿上 / 卸下」。只有扣了积分的兑换才记一条。
- 蛋不进骨架。兜帽等会挡住耳朵的头饰不做。
- 不退款、不转卖、不放生宠物时单独清算衣服。衣服属于孩子，宠物删除不在本期范围。
- 不在本期用骨骼重做进化时间轴。进化揭幕时刻切换骨架或阶段附件，演出仍用现有 `EvolutionFx`。

## 4. 绘制契约

两套骨架，槽位名在两套骨架之间保持一致。

| 骨架 | 阶段 | 身体 |
|------|------|------|
| `young` | 刚孵化 `HATCHED` | 坐着的圆身体 |
| `grown` | 成长期、成熟期、满级 | 同一套站立骨骼 |

神秘蛋 `EGG` 继续使用现有 `stage-1-egg.png`，不加载 DragonBones。

固定槽位，从后往前绘制：

| 槽位 | 内容 | 谁来换 |
|------|------|--------|
| `bodyBack` | 腿、尾巴、翅膀、云 | 物种 + 阶段 |
| `outfitBody` | 幼年领饰或成年躯干装 | 装扮套 |
| `bodyFront` | 头、耳朵、手臂、脚 | 物种 + 阶段 |
| `outfitHead` | 头饰，画在两耳之间 | 装扮套 |

物种差异是这些槽位上的显示对象，不是第四套骨架。成长期到满级的翅膀变大、满级光环和云，做在 `bodyBack` / `bodyFront` 的阶段显示对象上，不放进衣服套。耳朵留在 `bodyFront`，头饰附件不得把耳朵画进去。

每套骨架必须提供同名动作：

| 动作 | 播放 |
|------|------|
| `idle` | 循环 |
| `eat` | 一次，结束后回到 `idle` |
| `pet` | 一次，结束后回到 `idle` |

缺少某个动作时播放 `idle`。

画布规范先于第一套付费装扮：角色在正方形透明画布中居中，`young` 与 `grown` 各自固定头和躯干的绑定位。四种宠物都绑在这两套骨架上。现有黏土整图不作为换装底图；默认外观要重做成 `default` 套的附件。

资源未就绪的物种继续显示现有阶段 PNG。该物种的 `young` 与 `grown` 数据包都存在后，才改走骨骼。蛋始终走 PNG。

## 5. 装扮目录

目录是代码中的静态数据，不进家长可编辑的奖励表。

```ts
interface OutfitSetDefinition {
  id: string
  name: string
  points: number
  /**
   * 相对 public 的目录。
   * default 为 null，附件画在 young/grown 身体包里。
   * 付费套目录内同时有 young_* 与 grown_* 各一套 ske/tex/png，
   * 每套只含 outfitBody、outfitHead。
   */
  pack: string | null
}
```

规则：

- `default` 的 `points` 为 0，`pack` 为 null，不出现在可购买列表，每个孩子始终拥有。
- 付费套 `points` 为正整数，`pack` 指向 `public/pets/outfits/{id}/`。
- 该目录必须同时有 `young` 与 `grown` 两套文件，且都含 `outfitBody`、`outfitHead`。缺任一文件时，该套不出现在装扮页。
- 卸下 = 穿上 `default`。宠物身上始终有一套衣服。
- 本期目录在资源落地前只有 `default`。第一套付费装扮按上面的结构追加，不改槽位、购买和穿着流程。

## 6. 数据

### 6.1 宠物

`Pet` 增加 `outfitSetId: string`。缺省、空串或目录中不存在的 id 都视为 `default`。

IndexedDB 的 `pets` 表不新增索引。Dexie 会保存多余字段，因此这个字段本身不升 schema 版本。

### 6.2 兑换记录

新表 `outfitLogs`，schema 版本升到 **v8**。拥有与历史都由这张表表达，不再另建拥有表。

```
id, childId, outfitSetId, redeemedAt, [childId+outfitSetId], [childId+redeemedAt]
```

| 字段 | 含义 |
|------|------|
| `id` | 主键 |
| `childId` | 固定 `default` |
| `outfitSetId` | 目录 id |
| `outfitName` | 兑换当时的套装名称，目录以后改名不影响旧记录 |
| `pointsCost` | 本次扣除的积分 |
| `redeemedAt` | 兑换时间 |

`default` 不写记录。同一 `childId + outfitSetId` 只保留一行。有这条记录即已拥有。历史列表按 `redeemedAt` 倒序。

### 6.3 积分

购买调用已有的 `PointBalance.spendOnPet`。装扮计入宠物消费，不计入 `totalSpentOnReward`，因此不能走 `refundReward`。不新增积分字段。

### 6.4 备份

备份 `version` 保持 `1`。新增可选数组 `outfitLogs`，与 `categories` 一样：缺失则当空数组，类型不对则拒绝导入。

导入宠物时，缺 `outfitSetId` 或指向未知套装时写成 `default`。已有 `isDisplayed` 补齐逻辑不变。

## 7. 行为

### 7.1 购买

`OutfitService.buy(outfitSetId)`：

1. 目录中无此 id，或该套资源未就绪：失败，原因 `unknown`。
2. `default` 或已经拥有：失败，原因 `already_owned`，不扣分。
3. 积分不足：失败，原因 `insufficient_points`，不写兑换记录。
4. 成功：`spendOnPet(points)`，插入一条 `outfitLogs`（含当时的 `outfitName` 与 `pointsCost`）。不自动穿到任何宠物身上。

购买与穿着共用一把异步互斥锁（从 `PetService` 抽出，由 container 注入 `OutfitService` 和 `PetService`），避免连点扣两次，也避免与喂食、领养交错。

### 7.2 穿着

`OutfitService.equip(petId, outfitSetId)`：

- 宠物不存在：`not_found`。
- 套装不是 `default` 且未拥有：`not_owned`。
- 成功：只更新该宠物的 `outfitSetId`。不改变 `isDisplayed`。
- 蛋阶段也可以记下穿着。孵化后的 `young` 骨架直接显示这套。蛋画面本身不变。

### 7.3 展示

唯一渲染入口是 `PetAvatar`。以下位置改为使用它，不再直接用阶段 PNG 表示可换装的身体：

- 宠物页 `PetDisplay`
- 首页 `PetMiniCard`
- 图鉴 `CollectionCard`（已领养）
- 宠物页 `RaisingShortcutCard`

未领养图鉴卡仍用该物种的代表性静态图。

`PetAvatar` 输入：`type`、`stage`、`outfitSetId`、`motion`（`idle` | `eat` | `pet` | `paused`）。

- 蛋，或该物种骨架未就绪：渲染现有 PNG。
- 刚孵化：加载 `young`。
- 成长期、成熟期、满级：加载 `grown`，并换上该阶段的 `bodyBack` / `bodyFront`。
- 然后把该套的 `outfitBody`、`outfitHead` 换上。未知套装回退 `default`。
- 宠物页播放 `idle`，喂食播 `eat`，抚摸播 `pet`。
- 首页小卡、图鉴、养成卡使用 `paused`（setup pose，不循环），避免多只骨骼同时播放。

进化揭开前，`PetAvatar` 仍显示 `prevStage` 与当时的 `outfitSetId`。揭开时切到新阶段。`EvolutionFx` 的闪光、粒子、壳碎片不放进骨架。

喂食点头的 Framer 旋转只保留给仍在走 PNG 兜底的物种。已经走骨架的物种由 `eat` 动作负责。

### 7.4 运行时边界

页面和 store 不调用 DragonBones 或 Pixi API。

```
PetAvatar
  → PetCharacterPlayer   # 唯一知道 Pixi 与 DragonBones 的模块
      → 读取 public/pets/armatures/{young|grown}/
      → 读取该套 pack，replaceSlotDisplay
```

- DragonBones 数据格式锁定 5.6（`*_ske.json`、`*_tex.json`、`*_tex.png`）。
- 渲染宿主锁定 PixiJS 7。DragonBonesJS 5.6 的 Pixi 工厂随仓库固定版本引入，不升级到 Pixi 8。
- 两个库只允许被 `PetCharacterPlayer` 引用。
- 资源随构建产物发布，不在运行时从网络拉骨架。PWA 预缓存这些文件。
- 播放器销毁时释放 Pixi 应用和纹理，路由离开宠物页不得残留 canvas。

身体数据包路径：

```
public/pets/armatures/young/   # young_ske.json、young_tex.json、young_tex.png
public/pets/armatures/grown/
```

四种宠物的 `bodyBack` / `bodyFront` 阶段显示对象，以及 `default` 的 `outfitBody` / `outfitHead`，都打在这两份身体包里。付费套路径为 `public/pets/outfits/{id}/`，其中 `young_*` 与 `grown_*` 只含衣服槽位，由 `replaceSlotDisplay` 换到当前身体骨架上。

### 7.5 装扮页

商城、我的券、商城兑换历史都不改，也不增加装扮入口。

路由：

| 路径 | 页面 |
|------|------|
| `/pet/outfits` | 装扮目录 |
| `/pet/outfits/history` | 装扮兑换记录 |

`ROUTES` 增加 `PET_OUTFITS`、`PET_OUTFIT_HISTORY`。底部宠物 Tab 的 `matchPaths` 包含这两条，停留在装扮页时宠物 Tab 保持选中。

入口只放在宠物页工具栏，图鉴按钮旁边，文案为「装扮」。还没有宠物、停在创建表单时不显示该入口。

装扮页：

- 标题下标明当前展示宠的名字。兑换和穿着都作用于这只宠物，不在此页切换展示宠。
- 上方一个预览，用展示宠的物种和阶段，穿着当前选中的套（`paused`，只保留一个骨骼播放器）。
- 列表展示目录里全部已就绪套装，包含 `default`。每行有名称、积分、状态。
- 未拥有且积分足够：按钮「兑换」。成功后 toast，该行变为已拥有，并多一条历史。不自动穿上。
- 未拥有且积分不足：按钮不可点，沿用现有积分不足提示。
- 已拥有且不是当前穿着：按钮「穿上」，调用 `equip(展示宠 id, outfitSetId)`。
- 当前穿着：显示「穿着中」。`default` 同样可穿回。
- 页内入口进入兑换记录。记录页展示全部 `outfitLogs`：名称、花费、日期。空态文案为「还没有兑换记录」。没有退还、没有核销。返回装扮页。

资源未就绪的付费套不出现在列表里。历史里已有的记录照常显示，名称用日志上的 `outfitName`。

## 8. 代码落点

| 层 | 改动 |
|----|------|
| `src/domain/models/Pet.ts` | `outfitSetId`，缺省 `default` |
| `src/domain` 装扮目录 | `OutfitSetDefinition` 与就绪判断 |
| `src/domain/models` | `OutfitLog` |
| `src/domain/repositories` | `IOutfitLogRepository` |
| `src/infrastructure/database/DexieDatabase.ts` | v8 表 `outfitLogs` |
| `src/infrastructure/storage/JsonBackupAdapter.ts` | 可选 `outfitLogs`，宠物字段补齐 |
| `src/application/services/OutfitService.ts` | `buy`、`equip`、`listLogs` |
| `src/shared/container.ts` | 注册 `outfitService` |
| `src/shared/constants.ts` | `PET_OUTFITS`、`PET_OUTFIT_HISTORY` |
| `src/presentation` | `PetAvatar`、`PetCharacterPlayer`、装扮页、兑换记录页、宠物页入口 |
| `src/presentation/layouts/TabBar.tsx` | 宠物 Tab 覆盖装扮路由 |
| `src/shared/petTypes` | 物种策略继续提供蛋图、壳图、粒子；可换装阶段的身体改由骨架槽位提供 |

`IPetTypeStrategy.stageImage` 在该物种骨架就绪后，只服务蛋和进化揭开前的 PNG 兜底，不再表示衣服。

## 9. 失败与兼容

| 情况 | 结果 |
|------|------|
| 连点购买 | 变更锁内第二次看到已拥有，不扣分 |
| 购买过程中扣分成功但写表失败 | 先检查再扣分、再插入。插入失败时调用 `PointBalance.reversePetSpend(amount)`：从 `totalSpentOnPet` 减回本次金额，金额必须为正且不超过当前宠物消费。不使用 `refundReward` |
| 骨架 JSON 加载失败 | 该次显示回退阶段 PNG，toast 一次失败，不阻塞喂食和抚摸的数值逻辑 |
| 旧备份无装扮 | `outfitLogs` 为空，全部宠物穿 `default` |
| 目录删掉某套已兑换 id | 穿着显示回退 `default`；历史仍显示该条 `outfitName`；装扮列表不再出现这套 |

喂食、加经验、进化判定不依赖骨架是否加载成功。

## 10. 验收

- 从宠物页进入装扮页，能看到目录中全部已就绪套装。商城和 `/shop/history` 没有装扮入口，也没有新券记录。
- 兑换成功后 `outfitLogs` 多一条，装扮兑换记录页能看到名称、积分和日期。`totalSpentOnPet` 增加，`totalSpentOnReward` 不变。
- 再次兑换同一套不扣分，历史不增加第二行。
- 在装扮页给当前展示宠穿上后，首页和宠物页都是这套。另一只宠物的 `outfitSetId` 不变；要给她穿，先在图鉴把她设为展示宠再进装扮页。
- 刚孵化用 `young`，进入成长期后换成 `grown` 且仍是同一套衣服。蛋阶段画面无衣服层，孵化揭开后出现已记录的套装。
- 导出再导入，穿着和 `outfitLogs` 还在。一份没有这些字段的旧备份可以导入。
- 骨架未就绪的物种仍显示原来的阶段 PNG，喂食和进化数值正常。
- 离开宠物页后不残留播放中的 canvas。

## 11. 制作顺序

1. 定稿两套骨架的槽位、动作名和绑定位，并让小鸡的 `default` 在 `young` / `grown` 上可播放 `idle`。
2. 接入 `PetAvatar` 与数据、购买、穿着、备份。小鸡走骨架，其余物种走 PNG 兜底。
3. 补齐小兔、小猫、小狗的身体显示对象。
4. 按第 5 节追加第一套付费装扮。未齐附件前不出现在装扮页。
