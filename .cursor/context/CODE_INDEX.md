# CODE_INDEX.md — 代码索引

> 自动生成，请勿手动编辑
> 生成时间：2026-09-03
> 生成方式：project-context-generator Skill

---

## Home（首页）

### Pages
- `/home` → `src/presentation/pages/Home/index.tsx`

### Components
- `PetMiniCard` → `src/presentation/pages/Home/PetMiniCard.tsx`
- `TodayTaskList` → `src/presentation/pages/Home/TodayTaskList.tsx`

### Hooks
- `useTaskStore.fetchTasks()` — 加载任务列表
- `useTaskStore.fetchStats()` — 加载今日统计
- `usePetStore.fetchPet()` — 加载宠物状态
- `usePointStore.fetchBalance()` — 加载积分余额

### Services
- `TaskService.getTasksWithStatus()` — 获取带完成状态的任务列表
- `TaskService.getTodayStats()` — 今日统计（completedCount, earnedPoints, totalTasks）
- `PetService.getPetStatus()` — 宠物完整状态

---

## TaskCheckin（任务打卡）

### Pages
- `/tasks` → `src/presentation/pages/TaskCheckin/index.tsx`

### Hooks
- `useTaskStore.completeTask(taskId)` — 完成任务
- `useTaskStore.uncompleteTask(taskId)` — 取消完成

### Services
- `TaskService.completeTask(taskId)` — 完成任务 + 积分变动
- `TaskService.uncompleteTask(taskId)` — 取消完成 + 积分回退

### Domain Rules
- `TaskResetRule.isTaskCompleted()` — 判断任务是否已完成
- `TaskResetRule.getTodayCompletedCount()` — 今日完成数
- `TaskResetRule.getTodayEarnedPoints()` — 今日获得积分
- `DateUtils.getTodayStart()` — 今天 00:00 时间戳
- `DateUtils.getWeekStart()` — 本周一 00:00 时间戳

---

## TaskManage（任务管理）

### Pages
- `/tasks/manage` → `src/presentation/pages/TaskManage/index.tsx`

### Components
- `TaskEditModal` → `src/presentation/pages/TaskManage/TaskEditModal.tsx`

### Hooks
- `useTaskStore.createTask(params)` — 创建任务
- `useTaskStore.updateTask(taskId, params)` — 更新任务
- `useTaskStore.deleteTask(taskId)` — 删除任务

### Services
- `TaskService.createTask(params)` — 创建任务
- `TaskService.updateTask(taskId, params)` — 更新任务
- `TaskService.deleteTask(taskId)` — 删除（软删除）

---

## Pet（宠物系统）

### Pages
- `/pet` → `src/presentation/pages/Pet/index.tsx`

### Components
- `PetDisplay` → `src/presentation/pages/Pet/PetDisplay.tsx`
- `StatusPanel` → `src/presentation/pages/Pet/StatusPanel.tsx`
- `ActionButtons` → `src/presentation/pages/Pet/ActionButtons.tsx`
- `CreatePetForm` → `src/presentation/pages/Pet/CreatePetForm.tsx`
- `EvolutionOverlay` → `src/presentation/pages/Pet/EvolutionOverlay.tsx`

### Hooks
- `usePetStore.feed()` — 喂食（花积分 → 获经验）
- `usePetStore.petAction()` — 互动（增加心情）
- `usePetStore.createPet(name, type)` — 创建宠物

### Services
- `PetService.feed()` — 喂食编排（扣积分 → 加经验 → 检查进化）
- `PetService.pet()` — 互动（mood +5）
- `PetService.getPetStatus()` — 完整状态（含阶段、经验进度、下阶段名）
- `PetService.createPet(name, type)` — 创建宠物

### Domain Rules
- `PetGrowthRule.canEvolve(pet)` — 是否可进化
- `PetGrowthRule.getExpProgress(pet)` — 经验进度百分比
- `PetGrowthRule.getExpToNextStage(pet)` — 到下阶段需要的经验
- `PetGrowthRule.FEED_EXP_GAIN` — 喂食获得经验（10）
- `PetGrowthRule.FEED_POINT_COST` — 喂食花费积分（10）
- `Pet.applyMoodDecay()` — 结算心情衰减（-1/h），更新 moodUpdatedAt

---

## Shop（奖励商城）

### Pages
- `/shop` → `src/presentation/pages/Shop/index.tsx`

### Components
- `RewardCard` → `src/presentation/pages/Shop/RewardCard.tsx`（React.memo）
- `RewardEditModal` → `src/presentation/pages/Shop/RewardEditModal.tsx`
- `RedeemConfirm` → `src/presentation/pages/Shop/RedeemConfirm.tsx`
- `RedeemSuccess` → `src/presentation/pages/Shop/RedeemSuccess.tsx`

### Hooks
- `useRewardStore.fetchRewards()` — 加载奖励列表
- `useRewardStore.redeem(rewardId)` — 兑换奖励
- `useRewardStore.createReward(params)` — 创建奖励
- `useRewardStore.updateReward(id, params)` — 更新奖励
- `useRewardStore.deleteReward(id)` — 删除奖励

### Services
- `RewardService.redeem(rewardId)` — 兑换编排（扣积分 → 记录 log）
- `RewardService.initPresetRewards()` — 初始化预设奖励

---

## Settings（设置）

### Pages
- `/settings` → `src/presentation/pages/Settings/index.tsx`

### Components
- `SettingsSection` → `src/presentation/pages/Settings/SettingsSection.tsx`
- `SettingsRow` → `src/presentation/pages/Settings/SettingsRow.tsx`
- `PetNameEditor` → `src/presentation/pages/Settings/PetNameEditor.tsx`
- `ConfirmDialog` → `src/presentation/pages/Settings/ConfirmDialog.tsx`

### Services
- `BackupService.exportData()` — 导出数据为 JSON 文件
- `BackupService.importData(file)` — 从 JSON 文件恢复
- `BackupService.resetAllData()` — 重置全部数据
- `PetService.rename(newName)` — 宠物改名

---

## Shared（跨模块共享）

### Constants
- `DEFAULT_CHILD_ID` = `'default'` — 默认儿童 ID
- `REWARD_CATEGORIES` = `['娱乐', '美食', '玩具', '特权', '其他']` — 奖励分类
- `ROUTES` — 路由路径对象（HOME / TASKS / TASKS_MANAGE / PET / SHOP / SETTINGS）

### DI Container
- `src/shared/container.ts` — 导出 5 个 Service 单例

### Domain Models（可直接引用）
- `Task` → `src/domain/models/Task.ts`
- `TaskLog` → `src/domain/models/TaskLog.ts`
- `Pet` → `src/domain/models/Pet.ts`
- `Reward` → `src/domain/models/Reward.ts`
- `RewardLog` → `src/domain/models/RewardLog.ts`
- `PointBalance` → `src/domain/models/PointBalance.ts`

### Value Objects
- `TaskType` → `src/domain/valueObjects/TaskType.ts`（DAILY / WEEKLY / ONE_TIME / NEGATIVE）
- `PetStage` → `src/domain/valueObjects/PetStage.ts`（EGG → BABY → CHILD → TEEN → ADULT）

### Infrastructure
- `KidManageDB` → `src/infrastructure/database/DexieDatabase.ts`（Dexie schema v2）
- `JsonBackupAdapter` → `src/infrastructure/storage/JsonBackupAdapter.ts`
