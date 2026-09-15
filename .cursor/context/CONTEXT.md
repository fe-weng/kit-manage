# CONTEXT.md — 业务知识

> 最后更新：2026-09-14
> 维护方式：人工维护，业务变动时同步更新

## 项目概述

**Kid Manage** 是一款面向 5 岁儿童的行为管理 PWA 应用。核心闭环：**任务打卡 → 赚积分 → 养宠物 + 兑换奖励**。

路由前缀：`/`（单页应用，无嵌套前缀）

---

## 业务模块划分

| 模块 | 业务域 | 关键页面路径 |
|------|--------|-------------|
| 首页 | 总览面板（今日任务 + 宠物卡 + 待使用券） | `/home` |
| 任务打卡 | 每日/每周/一次性/扣分任务的完成与取消 | `/tasks` |
| 任务管理 | 任务的增删改查 | `/tasks/manage` |
| 打卡历史 | 月历视图查看历史打卡记录（按日期/按任务） | `/tasks/history` |
| 宠物系统 | 宠物养成、喂食、互动、进化、图鉴领养与展示切换 | `/pet`、`/pet/collection` |
| 奖励商城 | 奖励的浏览、兑换、管理（含分类体系） | `/shop` |
| 我的券 | 已兑换券的查看、核销、退还 | `/shop/coupons` |
| 兑换历史 | 全部兑换记录（含已使用、已退还） | `/shop/history` |
| 设置 | 数据备份/恢复/重置、入口进入宠物图鉴 | `/settings` |

---

## 领域映射（Domain Mapping）

> 业务实体 → 代码中的稳定命名

| 业务概念 | 代码命名 | 说明 |
|---------|---------|------|
| 任务 | `Task` | Domain Model，含 title/type/points/icon |
| 任务类型 | `TaskType` | Value Object：DAILY / WEEKLY / ONE_TIME / NEGATIVE |
| 任务打卡记录 | `TaskLog` | 每次完成/扣分产生一条 log |
| 每日打卡快照 | `DailyTaskSnapshot` | Domain Model，记录某天的任务快照及完成状态 |
| 积分余额 | `PointBalance` | 单例模型，childId='default' |
| 赚取积分 | `earn` | PointBalance.earn(amount) |
| 扣除积分 | `deduct` | PointBalance.deduct(amount)，允许负值 |
| 退还积分 | `refundReward` | PointBalance.refundReward(amount)，券退还时返还积分 |
| 宠物 | `Pet` | Domain Model，含 name/type/exp/mood/stage/`isDisplayed`；每只独立落库 |
| 展示宠物 | `isDisplayed` / `findDisplayedByChildId` | 首页与宠物页展示对象，用户可切换，需持久化 |
| 养成宠物 | `findRaisingByChildId` | 当前唯一未满级宠物；满级后为空，可领养下一只 |
| 宠物图鉴 | `PetCollection` / `getCollection` | 已领养 + 未领养种类列表；后续领养唯一入口 |
| 宠物种类 | `ADOPTABLE_PET_TYPES` | 小鸡 `chicken`、小兔 `rabbit`，每种限一只 |
| 宠物阶段 | `PetStage` | Value Object：EGG → HATCHED → GROWING → MATURE → MAX |
| 阶段经验门槛 | `PET_STAGE_CONFIGS.requiredExp` | 累计 EXP：0 / 50 / 200 / **700** / **1500** |
| 宠物进化 | `evolve` | Pet.evolve()，喂食达标后自动升一档 |
| 进化演出 | `EvolutionKind` | hatch / glow / ascend / legend，由 prevStage→新 stage 推导 |
| 壳碎片名册 | `SHELL_SHARD_IMAGES` | 有登记用 PNG；无登记跳过壳片，只播闪光与粒子；小兔、小鸡均已接入 |
| 宠物喂食 | `feed` | PetService.feed()，只喂养成宠；满级不加 EXP |
| 后续领养 | `adoptPet` / `PET_ADOPTION_COST` | 养成宠满级后花费 100 积分领养下一只，计入宠物消费 |
| 宠物互动 | `pet` / `petAction` | PetService.pet()，对展示宠增加心情 |
| 心情 | `mood` | 0-100，越高越好；满级不自然衰减 |
| 奖励 | `Reward` | Domain Model，含 title/points/categoryId/icon |
| 奖励兑换 | `redeem` | RewardService.redeem(rewardId)，产生 pending 券 |
| 兑换记录 | `RewardLog` | 每次兑换产生一条 log，含状态生命周期 |
| 券状态 | `RewardLogStatus` | 'pending'(待使用) / 'used'(已核销) / 'returned'(已退还) |
| 券核销 | `markUsed` | RewardService.markUsed(logId)，更新 status + usedAt |
| 券退还 | `returnCoupon` | RewardService.returnCoupon(logId)，退还积分 + 更新状态 |
| 奖励分类 | `Category` | Domain class（含 create/toJSON），持久化到 categories 表 |
| 预设分类 | `REWARD_CATEGORIES` | ['娱乐', '美食', '玩具', '特权', '其他'] |
| 儿童 ID | `DEFAULT_CHILD_ID` | 固定 'default'，单用户设计 |
| 数据备份 | `BackupService` | 导出/导入/重置 IndexedDB 数据（含 categories 表） |
| 任务完成判定 | `TaskResetRule` | 按类型判断是否已完成（日/周/一次性） |
| 宠物成长规则 | `PetGrowthRule` | 进化条件、经验计算 |
| 心情衰减 | `Pet.applyMoodDecay()` | 心情自然衰减（-1/h），写穿持久化 |
| 积分显示 | `formatPoints` | +5 / -3 格式化 |
| 日期工具 | `DateUtils` | getTodayStart/getWeekStart/parseDateStrToLocal/getDayRange/getMonthRange |
| 全局 Toast | `toast` | 命令式调用 toast.success/error，全局单例 |

---

## 搜索别名（Search Alias）

> 同一概念在代码中的多种命名变体

| 业务词 | 代码中可能的命名 |
|--------|----------------|
| 任务 | task, tasks, taskId |
| 打卡/完成 | complete, completeTask, toggle, handleToggle |
| 取消完成 | uncomplete, uncompleteTask |
| 积分 | point, points, balance, earn, deduct, spend, refund |
| 宠物 | pet, petAction, feed, evolve, mood, adopt, collection, isDisplayed, raising |
| 进化/破壳 | evolve, EvolutionKind, hatch, glow, ascend, legend, EvolutionFx, EvolutionOverlay |
| 蛋壳碎片 | SHELL_SHARD_IMAGES, evo-shell-left, evo-shell-right, evo-shell-top |
| 图鉴 | collection, PetCollection, adoptPet, setDisplayed, renamePet |
| 奖励 | reward, redeem, shop |
| 券/优惠券 | coupon, coupons, pending, used, returned, markUsed, returnCoupon |
| 日志/记录 | log, taskLog, rewardLog |
| 列表 | list, tasks, rewards, grouped |
| 新增 | create, createTask, createReward, createPet |
| 编辑 | edit, update, updateTask, updateReward |
| 删除 | delete, deleteTask, deleteReward, deactivate |
| 配置/设置 | settings, config |
| 备份 | backup, export, import, reset |
| 统计 | stats, completedCount, earnedPoints, totalTasks |
| 分类 | category, categoryId, categories, REWARD_CATEGORIES |
| 阶段/等级 | stage, PetStage, level |
| 历史/快照 | history, snapshot, dailySnapshot, dateStatus, monthLogs |
| 日历 | calendar, MonthCalendar, dayPicker, getCellStatus |
| 提示/通知 | toast, success, error, GlobalToast |

---

## 业务关系说明

```
用户完成任务 → 产生 TaskLog → 积分增加（earn）或扣除（deduct）
              → 自动更新当日 DailyTaskSnapshot
                ↓
积分 → 喂食当前养成宠物（spend 10分 → 获得 10 经验）
    → 满级后领养下一只（spendOnPet 100分，种类不重复）
    → 兑换奖励（spend N分 → 产生 RewardLog[pending]）
                ↓
宠物经验累积 → 满足条件触发进化（stage 晋升）→ 宠物页按段播动画
满级宠物保留抚摸，不再喂食/加 EXP/心情自然衰减
首页与宠物页展示 `isDisplayed` 宠物；可在图鉴切换

券生命周期：pending（待使用）→ used（已核销）
                           → returned（已退还，积分返还）
```

### 任务类型与完成规则

| 类型 | 重置周期 | 完成判定 | 取消逻辑 |
|------|---------|---------|---------|
| DAILY | 每天 | 当天是否有 log | 删除当天 log |
| WEEKLY | 每周 | 本周是否有 log | 删除本周 log |
| ONE_TIME | 永久 | 是否有任何 log | 删除最后一条 log |

| NEGATIVE | 每天 | 当天是否有 log | 删除当天所有 log |

> ONE_TIME 任务完成后，已通过 `isOneTimeTaskVisible()` 在次日从打卡页和首页过滤。

### 积分流向

- **赚取**：完成正分任务 → `earn(task.points)`
- **扣除**：完成扣分行为 → `deduct(|task.points|)`，允许余额为负
- **消费**：喂食养成宠 → `spendOnPet(10)` / 后续领养 → `spendOnPet(100)` / 兑换奖励 → `spendOnReward(reward.points)`
- **退还**：退还已兑换券 → `refundReward(reward.points)`，积分返还

### 券核销流程

- **兑换**：积分足够 + 无同奖励 pending 券 → 产生 RewardLog(status=pending)
- **核销**：在「我的券」页点击「点击使用」→ markUsed() → status=used
- **退还**：在「我的券」页点击「退还」→ returnCoupon() → status=returned + 积分返还
- **限制**：同一奖励只能有一张 pending 券

### 多宠物

- 每只宠物独立持久化（名字、种类、阶段、EXP、心情）；不覆盖旧宠
- 展示角色落库 `isDisplayed`；养成角色由「唯一未满级宠物」推导
- 第一只免费创建；后续从图鉴付费领养，同种类不可重复
- 本期最多两只（小鸡、小兔）；两只都满级即集齐
- 改名只在图鉴；设置页「宠物管理」进入图鉴
- 规范：[docs/specs/2026-09-14-multi-pet-design-spec.md](../../docs/specs/2026-09-14-multi-pet-design-spec.md)

### 宠物成长与进化

- **经验门槛**（累计 EXP）：神秘蛋 0 → 刚孵化 50 → 成长期 200 → 成熟期 **700** → 满级 **1500**
- **喂食**：10 积分 = 10 EXP，无冷却；只喂当前养成宠
- **进化**：达标后自动 `evolve()`，每次升一档；宠物页按段演出，不能跳过、无音效、无庆祝文案
- **演出 kind**：蛋→孵化 `hatch`（1.8s）/ 孵化→成长 `glow`（2.0s）/ 成长→成熟 `ascend`（2.5s）/ 成熟→满级 `legend`（3.0s）
- **壳碎片**：`SHELL_SHARD_IMAGES` 名册登记。有图才在闪光遮切时飞出；无图跳过壳片但保留闪光与粒子。小兔、小鸡 left/right/top 均已接入
- **规范**：[进化动画](../../docs/specs/2026-09-14-evolution-animation-spec.md) · [壳图 Prompt](../../docs/specs/2026-09-14-pet-evolution-shard-prompts.md) · [grill-me](../../docs/grill-me-2026-09-14-evolution-animation.md)

### 打卡历史

- **快照机制**：每日首次访问打卡页自动生成 `DailyTaskSnapshot`，任务增删自动同步
- **查看方式**：月历视图，支持按日期和按任务两种维度
- **月统计**：任务完成率 / 全勤天数 / 总积分
