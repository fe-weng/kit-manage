# CONTEXT.md — 业务知识

> 最后更新：2026-09-08
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
| 宠物系统 | 宠物养成、喂食、互动、进化 | `/pet` |
| 奖励商城 | 奖励的浏览、兑换、管理（含分类体系） | `/shop` |
| 我的券 | 已兑换券的查看、核销、退还 | `/shop/coupons` |
| 兑换历史 | 全部兑换记录（含已使用、已退还） | `/shop/history` |
| 设置 | 数据备份/恢复/重置、宠物改名 | `/settings` |

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
| 宠物 | `Pet` | Domain Model，含 name/type/exp/mood/hunger/stage |
| 宠物阶段 | `PetStage` | Value Object：EGG → BABY → CHILD → TEEN → ADULT |
| 宠物进化 | `evolve` | Pet.evolve()，阶段晋升 |
| 宠物喂食 | `feed` | PetService.feed()，花积分喂食获得经验 |
| 宠物互动 | `pet` / `petAction` | PetService.pet()，增加心情 |
| 饥饿度 | `hunger` | 0-100，越高越饿 |
| 心情 | `mood` | 0-100，越高越好 |
| 奖励 | `Reward` | Domain Model，含 title/points/categoryId/icon |
| 奖励兑换 | `redeem` | RewardService.redeem(rewardId)，产生 pending 券 |
| 兑换记录 | `RewardLog` | 每次兑换产生一条 log，含状态生命周期 |
| 券状态 | `RewardLogStatus` | 'pending'(待使用) / 'used'(已核销) / 'returned'(已退还) |
| 券核销 | `markUsed` | RewardService.markUsed(logId)，更新 status + usedAt |
| 券退还 | `returnCoupon` | RewardService.returnCoupon(logId)，退还积分 + 更新状态 |
| 奖励分类 | `Category` | Domain Model，持久化到 categories 表，支持自定义 |
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
| 宠物 | pet, petAction, feed, evolve, mood, hunger |
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
积分 → 喂食宠物（spend 10分 → 获得 10 经验）
    → 兑换奖励（spend N分 → 产生 RewardLog[pending]）
                ↓
宠物经验累积 → 满足条件触发进化（stage 晋升）

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
- **消费**：喂食宠物 → `spendOnPet(10)` / 兑换奖励 → `spendOnReward(reward.points)`
- **退还**：退还已兑换券 → `refundReward(reward.points)`，积分返还

### 券核销流程

- **兑换**：积分足够 + 无同奖励 pending 券 → 产生 RewardLog(status=pending)
- **核销**：在「我的券」页点击「点击使用」→ markUsed() → status=used
- **退还**：在「我的券」页点击「退还」→ returnCoupon() → status=returned + 积分返还
- **限制**：同一奖励只能有一张 pending 券

### 打卡历史

- **快照机制**：每日首次访问打卡页自动生成 `DailyTaskSnapshot`，任务增删自动同步
- **查看方式**：月历视图，支持按日期和按任务两种维度
- **月统计**：任务完成率 / 全勤天数 / 总积分
