# CODE_INDEX.md — 代码索引

> 自动生成，请勿手动编辑
> 生成时间：2026-09-14
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
- `usePetStore.fetchPet()` — 加载当前展示宠物 + 养成宠物状态
- `usePointStore.fetchBalance()` — 加载积分余额
- `useRewardStore.fetchPendingCoupons()` — 加载待使用券

### Services
- `TaskService.getTasksWithStatus()` — 获取带完成状态的任务列表
- `TaskService.getTodayStats()` — 今日统计（completedCount, earnedPoints, totalTasks）
- `PetService.getPetStatus()` — 当前展示宠物完整状态
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
- `PetDisplay` → `src/presentation/pages/Pet/PetDisplay.tsx` — 按 `EvolutionKind` 换图（抖动/弹出/旋转/爆发）
- `EvolutionFx` → `src/presentation/pages/Pet/EvolutionFx.tsx` — 四段附加层（碎片、光柱、彩虹、粒子）；`SHELL_SHARD_IMAGES` 登记壳图
- `evolutionTransition.ts` → `src/presentation/pages/Pet/evolutionTransition.ts` — kind / 时长 / 揭晓延迟 / 遮罩色 / 粒子色
- `StatusPanel` → `src/presentation/pages/Pet/StatusPanel.tsx`
- `ActionButtons` → `src/presentation/pages/Pet/ActionButtons.tsx` — 满级隐藏喂食
- `CreatePetForm` → `src/presentation/pages/Pet/CreatePetForm.tsx` — 仅第一只免费领养
- `EvolutionOverlay` → `src/presentation/pages/Pet/EvolutionOverlay.tsx` — 按段 vignette；点击不跳过，按时长 `onDone`
- `PetToolbar` → `src/presentation/pages/Pet/PetToolbar.tsx` — 图鉴 X/Y + 可领养提示 + 积分
- `RaisingShortcutCard` → `src/presentation/pages/Pet/RaisingShortcutCard.tsx` — 展示满级时切回养成宠

### Hooks
- `usePetStore.fetchPet()` — 加载展示宠 + 养成宠
- `usePetStore.feed()` — 只喂养成宠（花积分 → 获经验）
- `usePetStore.petAction()` — 对展示宠互动（增加心情）
- `usePetStore.createPet(name, type)` — 免费创建第一只
- `usePetStore.setDisplayed(petId)` — 切换展示宠物

### Services
- `PetService.getPetStatus()` — 展示宠物状态
- `PetService.getRaisingStatus()` — 养成中宠物状态
- `PetService.feed()` — 只对养成宠扣积分加 EXP，满级不加 EXP
- `PetService.pet()` — 对展示宠互动（mood +5）
- `PetService.createPet(name, type)` — 免费首养；已有宠物时拒绝

### Domain Rules
- `PetGrowthRule.canEvolve(pet)` — 是否可进化
- `PetGrowthRule.getExpProgress(pet)` — 经验进度百分比
- `PetGrowthRule.getExpToNextStage(pet)` — 到下阶段需要的经验
- `PetGrowthRule.FEED_EXP_GAIN` — 喂食获得经验（10）
- `PetGrowthRule.FEED_POINT_COST` — 喂食花费积分（10）
- `PetGrowthRule.PET_ADOPTION_COST` — 后续领养花费积分（100）
- `PET_STAGE_CONFIGS` — 累计 EXP：0 / 50 / 200 / 700 / 1500
- `getEvolutionKind(prev, next)` — 推导 hatch / glow / ascend / legend
- `SHELL_SHARD_IMAGES` — 壳图名册（小兔已接入；未登记不播假壳片）
- `Pet.isMaxLevel()` / `Pet.canContinueRaising()` — 满级与可养成判定
- `Pet.applyMoodDecay()` — 心情自然衰减（-1/h）；满级不执行
- `Pet.isDisplayed` / `Pet.setDisplayed()` — 展示状态

### Repository
- `IPetRepository.findDisplayedByChildId` — 当前展示宠物
- `IPetRepository.findRaisingByChildId` — 当前养成宠物（唯一未满级）
- `IPetRepository.findAllByChildId` — 全部宠物
- `IPetRepository.switchDisplayed` — 原子切换展示

### Assets
- `src/assets/pets/rabbit/evo-shell-{left,right,top}.png` — 小兔孵化壳碎片（import 进动画）
- 小鸡壳图未到：`public/pets/chicken/evo-shell-*.png` + `SHELL_SHARD_IMAGES.chicken`

---

## PetCollection（宠物图鉴）

### Pages
- `/pet/collection` → `src/presentation/pages/PetCollection/index.tsx`

### Components
- `CollectionCard` → `src/presentation/pages/PetCollection/CollectionCard.tsx` — 已领养 / 未领养卡片
- `PetNameModal` → `src/presentation/pages/PetCollection/PetNameModal.tsx` — 改名与领养命名（BaseModal）

### Hooks
- `usePetStore.fetchCollection()` — 加载图鉴列表
- `usePetStore.checkAdoption(type)` — 领养前校验（含积分差额文案）
- `usePetStore.adoptPet(name, type)` — 付费领养并切为展示
- `usePetStore.renamePet(petId, name)` — 按 ID 改名
- `usePetStore.setDisplayed(petId)` — 设为展示后返回宠物页

### Services
- `PetService.getCollection()` — 图鉴列表（含未领养种类）
- `PetService.checkAdoption(type)` — 领养资格与余额
- `PetService.adoptPet(name, type)` — 二次校验 + 并发锁 + `spendOnPet(100)`
- `PetService.renamePet(petId, name)` — 按 ID 改名
- `PetService.setDisplayed(petId)` — 切换展示宠物

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
- `ConfirmDialog` → `src/presentation/pages/Settings/ConfirmDialog.tsx`

### Hooks
- 设置页「宠物管理」跳转 `ROUTES.PET_COLLECTION`，不在设置内改名

### Services
- `BackupService.exportData()` — 导出数据为 JSON 文件（含全部宠物与 isDisplayed）
- `BackupService.importData(file)` — 从 JSON 文件恢复（旧备份自动补齐展示字段）
- `BackupService.resetAllData()` — 重置全部数据

---

## Shared（跨模块共享）

### Constants
- `DEFAULT_CHILD_ID` = `'default'` — 默认儿童 ID
- `REWARD_CATEGORIES` = `['娱乐', '美食', '玩具', '特权', '其他']` — 奖励分类（预设）
- `ROUTES` — 路由路径对象（含 `PET_COLLECTION: '/pet/collection'`）

### DI Container
- `src/shared/container.ts` — 导出 5 个 Service 单例（含 snapshotRepo 注入）

### Toast
- `src/shared/toast.ts` — 全局命令式 Toast API（`toast.success()` / `toast.error()`）
- `GlobalToast` 固定页面顶部展示

### Components
- `BaseModal` → `src/presentation/components/BaseModal.tsx` — 统一弹窗基座（ESC/focus trap/aria-labelledby/焦点恢复）
- `GlobalToast` → `src/presentation/components/GlobalToast.tsx` — 全局 Toast 渲染组件
- `MonthCalendar` → `src/presentation/components/MonthCalendar.tsx` — 通用月历组件（react-day-picker v10）

### Domain Models（可直接引用）
- `Task` → `src/domain/models/Task.ts`
- `TaskLog` → `src/domain/models/TaskLog.ts`
- `Pet` → `src/domain/models/Pet.ts`（含 `isDisplayed`）
- `Reward` → `src/domain/models/Reward.ts`（categoryId 关联分类）
- `RewardLog` → `src/domain/models/RewardLog.ts`（含 status: pending/used/returned）
- `PointBalance` → `src/domain/models/PointBalance.ts`（含 refundReward）
- `Category` → `src/domain/models/Category.ts`（奖励分类 class，含 create/toJSON）
- `DailyTaskSnapshot` → `src/domain/models/DailyTaskSnapshot.ts`（每日打卡快照）

### Value Objects
- `TaskType` → `src/domain/valueObjects/TaskType.ts`（DAILY / WEEKLY / ONE_TIME / NEGATIVE）
- `PetStage` → `src/domain/valueObjects/PetStage.ts`（EGG → HATCHED → GROWING → MATURE → MAX；门槛 0/50/200/700/1500）

### Infrastructure
- `KidManageDB` → `src/infrastructure/database/DexieDatabase.ts`（Dexie schema v7，8 张表）
- `DexiePetRepository` → `src/infrastructure/database/repositories/DexiePetRepository.ts`
- `DexieSnapshotRepository` → `src/infrastructure/database/repositories/DexieSnapshotRepository.ts`
- `JsonBackupAdapter` → `src/infrastructure/storage/JsonBackupAdapter.ts`（导入时补齐 `pets.isDisplayed`）
