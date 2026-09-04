# CONTEXT.md — 业务知识

> 最后更新：2026-09-03
> 维护方式：人工维护，业务变动时同步更新

## 项目概述

**Kid Manage** 是一款面向 5 岁儿童的行为管理 PWA 应用。核心闭环：**任务打卡 → 赚积分 → 养宠物 + 兑换奖励**。

路由前缀：`/`（单页应用，无嵌套前缀）

---

## 业务模块划分

| 模块 | 业务域 | 关键页面路径 |
|------|--------|-------------|
| 首页 | 总览面板 | `/home` |
| 任务打卡 | 每日/每周/一次性/扣分任务的完成与取消 | `/tasks` |
| 任务管理 | 任务的增删改查 | `/tasks/manage` |
| 宠物系统 | 宠物养成、喂食、互动、进化 | `/pet` |
| 奖励商城 | 奖励的浏览、兑换、管理 | `/shop` |
| 设置 | 数据备份/恢复/重置、宠物改名 | `/settings` |

---

## 领域映射（Domain Mapping）

> 业务实体 → 代码中的稳定命名

| 业务概念 | 代码命名 | 说明 |
|---------|---------|------|
| 任务 | `Task` | Domain Model，含 title/type/points/icon |
| 任务类型 | `TaskType` | Value Object：DAILY / WEEKLY / ONE_TIME / NEGATIVE |
| 任务打卡记录 | `TaskLog` | 每次完成/扣分产生一条 log |
| 积分余额 | `PointBalance` | 单例模型，childId='default' |
| 赚取积分 | `earn` | PointBalance.earn(amount) |
| 扣除积分 | `deduct` | PointBalance.deduct(amount) |
| 宠物 | `Pet` | Domain Model，含 name/type/exp/mood/hunger/stage |
| 宠物阶段 | `PetStage` | Value Object：EGG → BABY → CHILD → TEEN → ADULT |
| 宠物进化 | `evolve` | Pet.evolve()，阶段晋升 |
| 宠物喂食 | `feed` | PetService.feed()，花积分喂食获得经验 |
| 宠物互动 | `pet` / `petAction` | PetService.pet()，增加心情 |
| 饥饿度 | `hunger` | 0-100，越高越饿 |
| 心情 | `mood` | 0-100，越高越好 |
| 奖励 | `Reward` | Domain Model，含 title/points/category/icon |
| 奖励兑换 | `redeem` | RewardService.redeem(rewardId) |
| 兑换记录 | `RewardLog` | 每次兑换产生一条 log |
| 奖励分类 | `REWARD_CATEGORIES` | ['娱乐', '美食', '玩具', '特权', '其他'] |
| 儿童 ID | `DEFAULT_CHILD_ID` | 固定 'default'，单用户设计 |
| 数据备份 | `BackupService` | 导出/导入/重置 IndexedDB 数据 |
| 任务完成判定 | `TaskResetRule` | 按类型判断是否已完成（日/周/一次性） |
| 宠物成长规则 | `PetGrowthRule` | 进化条件、经验计算 |
| 心情衰减 | `Pet.applyMoodDecay()` | 心情自然衰减（-1/h），写穿持久化 |
| 积分显示 | `formatPoints` | +5 / -3 格式化 |
| 日期边界 | `DateUtils` | getTodayStart() / getWeekStart() |

---

## 搜索别名（Search Alias）

> 同一概念在代码中的多种命名变体

| 业务词 | 代码中可能的命名 |
|--------|----------------|
| 任务 | task, tasks, taskId |
| 打卡/完成 | complete, completeTask, toggle, handleToggle |
| 取消完成 | uncomplete, uncompleteTask |
| 积分 | point, points, balance, earn, deduct, spend |
| 宠物 | pet, petAction, feed, evolve, mood, hunger |
| 奖励 | reward, redeem, shop |
| 日志/记录 | log, taskLog, rewardLog |
| 列表 | list, tasks, rewards, grouped |
| 新增 | create, createTask, createReward, createPet |
| 编辑 | edit, update, updateTask, updateReward |
| 删除 | delete, deleteTask, deleteReward, deactivate |
| 配置/设置 | settings, config |
| 备份 | backup, export, import, reset |
| 统计 | stats, completedCount, earnedPoints, totalTasks |
| 分类 | category, REWARD_CATEGORIES |
| 阶段/等级 | stage, PetStage, level |

---

## 业务关系说明

```
用户完成任务 → 产生 TaskLog → 积分增加（earn）或扣除（deduct）
                ↓
积分 → 喂食宠物（spend 10分 → 获得 10 经验）
    → 兑换奖励（spend N分 → 产生 RewardLog）
                ↓
宠物经验累积 → 满足条件触发进化（stage 晋升）
```

### 任务类型与完成规则

| 类型 | 重置周期 | 完成判定 | 取消逻辑 |
|------|---------|---------|---------|
| DAILY | 每天 | 当天是否有 log | 删除当天 log |
| WEEKLY | 每周 | 本周是否有 log | 删除本周 log |
| ONE_TIME | 永久 | 是否有任何 log | 删除最后一条 log |

> ⚠️ ONE_TIME 任务完成后，应在次日从打卡页和首页消失（当前代码未实现，为已知 Bug G1）
| NEGATIVE | 每天 | 当天是否有 log | 删除当天所有 log |

### 积分流向

- **赚取**：完成正分任务 → `earn(task.points)`
- **扣除**：完成扣分行为 → `deduct(|task.points|)`
- **消费**：喂食宠物 → `spendOnPet(10)` / 兑换奖励 → `spendOnReward(reward.points)`
