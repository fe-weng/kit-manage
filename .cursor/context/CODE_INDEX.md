# CODE_INDEX.md — 代码索引

> 自动生成，请勿手动编辑
> 生成时间：2026-09-08
> 生成方式：project-context-generator Skill

---

## Home（首页）

### Pages
- `/home` → `src/presentation/pages/Home/index.tsx`

### Components
- `PetMiniCard` → `src/presentation/pages/Home/PetMiniCard.tsx`
- `TodayTaskList` → `src/presentation/pages/Home/TodayTaskList.tsx`
- `CouponMiniCard` → `src/presentation/pages/Home/CouponMiniCard.tsx` — 待使用券迷你卡

### Hooks
- `useTaskStore.fetchTasks()` — 加载任务列表
- `useTaskStore.fetchStats()` — 加载今日统计
- `usePetStore.fetchPet()` — 加载宠物状态
- `usePointStore.fetchBalance()` — 加载积分余额
- `useRewardStore.fetchPendingCoupons()` — 加载待使用券

### Services
- `TaskService.getTasksWithStatus()` — 获取带完成状态的任务列表
- `TaskService.getTodayStats()` — 今日统计（completedCount, earnedPoints, totalTasks）
- `PetService.getPetStatus()` — 宠物完整状态
- `RewardService.getPendingCoupons()` — 待使用券列表

---

## TaskCheckin（任务打卡）

### Pages
- `/tasks` → `src/presentation/pages/TaskCheckin/index.tsx`

### Components
- `NegativeBalanceGuide` → `src/presentation/pages/TaskCheckin/NegativeBalanceGuide.tsx` — 负分引导弹窗

### Hooks
- `useTaskStore.completeTask(taskId)` — 完成任务
- `useTaskStore.uncompleteTask(taskId)` — 取消完成

### Services
- `TaskService.completeTask(taskId)` — 完成任务 + 积分变动 + 更新快照
- `TaskService.uncompleteTask(taskId)` — 取消完成 + 积分回退
- `TaskService.ensureTodaySnapshot()` — 确保今日快照存在
- `TaskService.updateTodaySnapshot()` — 任务增删后同步快照

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

## TaskHistory（打卡历史）

### Pages
- `/tasks/history` → `src/presentation/pages/TaskHistory/index.tsx`

### Components
- `DateView` → `src/presentation/pages/TaskHistory/DateView.tsx` — 按日期视图（展开任务详情）
- `TaskView` → `src/presentation/pages/TaskHistory/TaskView.tsx` — 按任务视图（Chips 选择器 + 统计）
- `MonthPickerModal` → `src/presentation/pages/TaskHistory/MonthPickerModal.tsx` — 月份选择器弹窗
- `MonthStats` → `src/presentation/pages/TaskHistory/MonthStats.tsx` — 月统计摘要（完成率/全勤/积分）

### Hooks
- `useTaskHistoryStore.fetchMonth(year, month)` — 加载指定月份快照和日志
- `useTaskHistoryStore.ensureTodaySnapshot()` — 确保今日快照
- `useTaskHistoryStore.dateStatusMap` — 日期完成状态映射

### Services
- `TaskService.getMonthSnapshots(year, month)` — 月度快照查询
- `TaskService.getMonthLogs(year, month)` — 月度任务日志查询
- `TaskService.getAllTasks()` — 获取全部任务（含软删除）

### Domain Models
- `DailyTaskSnapshot` → `src/domain/models/DailyTaskSnapshot.ts` — 每日任务快照（create/addTask/removeTask/toJSON）

### Domain Rules
- `DateUtils.parseDateStrToLocal(dateStr)` — YYYY-MM-DD 本地时间解析
- `DateUtils.getDayRange(dateStr)` — 某日的起止时间戳
- `DateUtils.getMonthRange(year, month)` — 某月的起止时间戳

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
- `RewardCard` → `src/presentation/pages/Shop/RewardCard.tsx`（React.memo，含 hasPending 状态）
- `RewardEditModal` → `src/presentation/pages/Shop/RewardEditModal.tsx`（含分类 Combobox）
- `RedeemConfirm` → `src/presentation/pages/Shop/RedeemConfirm.tsx`
- `RedeemSuccess` → `src/presentation/pages/Shop/RedeemSuccess.tsx`（含「查看我的券」引导）

### Hooks
- `useRewardStore.fetchRewards()` — 加载奖励列表（按积分低→高排序）
- `useRewardStore.redeem(rewardId)` — 兑换奖励（产生 pending 券）
- `useRewardStore.createReward(params)` — 创建奖励
- `useRewardStore.updateReward(id, params)` — 更新奖励
- `useRewardStore.deleteReward(id)` — 删除奖励
- `useRewardStore.fetchPendingCoupons()` — 加载待使用券
- `useRewardStore.fetchAllLogs()` — 加载全量兑换记录
- `useRewardStore.returnCoupon(logId)` — 退还券

### Services
- `RewardService.redeem(rewardId)` — 兑换编排（扣积分 → 产生 pending 券，限一张）
- `RewardService.markUsed(logId)` — 券核销
- `RewardService.returnCoupon(logId)` — 券退还（积分返还）
- `RewardService.getPendingCoupons()` — 待使用券列表
- `RewardService.getAllLogs()` — 全部兑换记录
- `RewardService.initPresetRewards()` — 初始化预设奖励
- `RewardService.initPresetCategories()` — 初始化预设分类

### Domain Models
- `Category` → `src/domain/models/Category.ts` — 奖励分类 class（create/toJSON）

---

## MyCoupons（我的券）

### Pages
- `/shop/coupons` → `src/presentation/pages/MyCoupons/index.tsx`

### Hooks
- `useRewardStore.allLogs` — 全量券日志（全局 store）
- `useRewardStore.fetchAllLogs()` — 加载全量日志
- `useRewardStore.markUsed(logId)` — 券核销
- `useRewardStore.returnCoupon(logId)` — 退还券

### Services
- `RewardService.getAllLogs()` — 全部兑换记录
- `RewardService.markUsed(logId)` — 券核销
- `RewardService.returnCoupon(logId)` — 券退还

---

## RedeemHistory（兑换历史）

### Pages
- `/shop/history` → `src/presentation/pages/RedeemHistory/index.tsx`

### Hooks
- `useRewardStore.allLogs` — 全量日志（全局 store，按 redeemedAt 倒序）
- `useRewardStore.fetchAllLogs()` — 加载全量日志

### Services
- `RewardService.getAllLogs()` — 全部兑换记录

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
- `REWARD_CATEGORIES` = `['娱乐', '美食', '玩具', '特权', '其他']` — 奖励分类（预设）
- `ROUTES` — 路由路径对象（HOME / TASKS / TASKS_MANAGE / TASK_HISTORY / PET / SHOP / MY_COUPONS / REDEEM_HISTORY / SETTINGS）

### DI Container
- `src/shared/container.ts` — 导出 5 个 Service 单例（含 snapshotRepo 注入）

### Toast
- `src/shared/toast.ts` — 全局命令式 Toast API（`toast.success()` / `toast.error()`）

### Components
- `BaseModal` → `src/presentation/components/BaseModal.tsx` — 统一弹窗基座（ESC/focus trap/aria-labelledby/焦点恢复）
- `GlobalToast` → `src/presentation/components/GlobalToast.tsx` — 全局 Toast 渲染组件
- `MonthCalendar` → `src/presentation/components/MonthCalendar.tsx` — 通用月历组件（react-day-picker v10）

### Domain Models（可直接引用）
- `Task` → `src/domain/models/Task.ts`
- `TaskLog` → `src/domain/models/TaskLog.ts`
- `Pet` → `src/domain/models/Pet.ts`
- `Reward` → `src/domain/models/Reward.ts`（categoryId 关联分类）
- `RewardLog` → `src/domain/models/RewardLog.ts`（含 status: pending/used/returned）
- `PointBalance` → `src/domain/models/PointBalance.ts`（含 refundReward）
- `Category` → `src/domain/models/Category.ts`（奖励分类 class，含 create/toJSON）
- `DailyTaskSnapshot` → `src/domain/models/DailyTaskSnapshot.ts`（每日打卡快照）

### Value Objects
- `TaskType` → `src/domain/valueObjects/TaskType.ts`（DAILY / WEEKLY / ONE_TIME / NEGATIVE）
- `PetStage` → `src/domain/valueObjects/PetStage.ts`（EGG → BABY → CHILD → TEEN → ADULT）

### Infrastructure
- `KidManageDB` → `src/infrastructure/database/DexieDatabase.ts`（Dexie schema v6，8 张表）
- `DexieSnapshotRepository` → `src/infrastructure/database/repositories/DexieSnapshotRepository.ts`
- `JsonBackupAdapter` → `src/infrastructure/storage/JsonBackupAdapter.ts`（含 categories 表备份）
