# CODE_INDEX.md — 代码索引

> 自动生成，请勿手动编辑
> 生成时间：2026-09-16
> 生成方式：project-context-generator Skill

---

## Home（首页）

### Pages
- `/home` → `src/presentation/pages/Home/index.tsx`

### Components
- `CouponMiniCard` → `src/presentation/pages/Home/CouponMiniCard.tsx`
- `PetMiniCard` → `src/presentation/pages/Home/PetMiniCard.tsx`
- `TodayTaskList` → `src/presentation/pages/Home/TodayTaskList.tsx`

---

## TaskCheckin（任务打卡）

### Pages
- `/tasks` → `src/presentation/pages/TaskCheckin/index.tsx`

### Components
- `NegativeBalanceGuide` → `src/presentation/pages/TaskCheckin/NegativeBalanceGuide.tsx`

---

## TaskManage（任务管理）

### Pages
- `/tasks/manage` → `src/presentation/pages/TaskManage/index.tsx`

### Components
- `TaskEditModal` → `src/presentation/pages/TaskManage/TaskEditModal.tsx`

---

## TaskHistory（打卡历史）

### Pages
- `/tasks/history` → `src/presentation/pages/TaskHistory/index.tsx`

### Components
- `DateView` → `src/presentation/pages/TaskHistory/DateView.tsx`
- `MonthPickerModal` → `src/presentation/pages/TaskHistory/MonthPickerModal.tsx`
- `MonthStats` → `src/presentation/pages/TaskHistory/MonthStats.tsx`
- `TaskView` → `src/presentation/pages/TaskHistory/TaskView.tsx`

---

## Pet（宠物系统）

### Pages
- `/pet` → `src/presentation/pages/Pet/index.tsx`

### Components
- `ActionButtons` → `src/presentation/pages/Pet/ActionButtons.tsx`
- `CreatePetForm` → `src/presentation/pages/Pet/CreatePetForm.tsx`
- `EvolutionFx` → `src/presentation/pages/Pet/EvolutionFx.tsx`
- `EvolutionOverlay` → `src/presentation/pages/Pet/EvolutionOverlay.tsx`
- `PetDisplay` → `src/presentation/pages/Pet/PetDisplay.tsx`
- `PetToolbar` → `src/presentation/pages/Pet/PetToolbar.tsx`
- `RaisingShortcutCard` → `src/presentation/pages/Pet/RaisingShortcutCard.tsx`
- `StatusPanel` → `src/presentation/pages/Pet/StatusPanel.tsx`
- `evolutionTransition.ts` → `src/presentation/pages/Pet/evolutionTransition.ts`

---

## PetCollection（宠物图鉴）

### Pages
- `/pet/collection` → `src/presentation/pages/PetCollection/index.tsx`

### Components
- `CollectionCard` → `src/presentation/pages/PetCollection/CollectionCard.tsx`
- `PetNameModal` → `src/presentation/pages/PetCollection/PetNameModal.tsx`

---

## Shop（奖励商城）

### Pages
- `/shop` → `src/presentation/pages/Shop/index.tsx`

### Components
- `RedeemConfirm` → `src/presentation/pages/Shop/RedeemConfirm.tsx`
- `RedeemSuccess` → `src/presentation/pages/Shop/RedeemSuccess.tsx`
- `RewardCard` → `src/presentation/pages/Shop/RewardCard.tsx`
- `RewardEditModal` → `src/presentation/pages/Shop/RewardEditModal.tsx`

---

## MyCoupons（我的券）

### Pages
- `/shop/coupons` → `src/presentation/pages/MyCoupons/index.tsx`

---

## RedeemHistory（兑换历史）

### Pages
- `/shop/history` → `src/presentation/pages/RedeemHistory/index.tsx`

---

## Settings（设置）

### Pages
- `/settings` → `src/presentation/pages/Settings/index.tsx`

### Components
- `ConfirmDialog` → `src/presentation/pages/Settings/ConfirmDialog.tsx`
- `SettingsRow` → `src/presentation/pages/Settings/SettingsRow.tsx`
- `SettingsSection` → `src/presentation/pages/Settings/SettingsSection.tsx`

---

## Hooks（Zustand Store）

- `usePetStore.ts` — `usePetStore`
- `usePointStore.ts` — `usePointStore`
- `useRewardStore.ts` — `useRewardStore`
- `useTaskHistoryStore.ts` — `useTaskHistoryStore`
- `useTaskStore.ts` — `useTaskStore`

---

## Services

- `BackupService.ts` — `exportData`, `importData`, `resetAllData`
- `PetService.ts` — `getPet`, `getRaisingPet`, `getPetStatus`, `getRaisingStatus`, `getCollection`, `createPet`, `checkAdoption`, `adoptPet`, `feed`, `pet`, `rename`, `renamePet`, `setDisplayed`, `getAdoptionBlocker`, `persistDecay`, `toStatus`, `assertValidName`, `assertValidType`
- `PointService.ts` — `getBalance`, `earn`, `deduct`, `spendOnPet`, `spendOnReward`, `refundReward`
- `RewardService.ts` — `getAllRewards`, `getAllCategories`, `createReward`, `updateReward`, `addCustomCategory`, `deleteReward`, `redeem`, `getPendingCoupons`, `getAllLogs`, `markUsed`, `returnCoupon`, `initPresetRewards`
- `TaskService.ts` — `ensureTodaySnapshot`, `updateTodaySnapshot`, `addNegativeTask`, `addTask`, `getMonthLogs`, `getAllTasks`, `createTask`, `updateTask`, `deleteTask`, `completeTask`, `uncompleteTask`, `findAllRelevantLogs`, `getTasksWithStatus`, `getTodayStats`

---

## Shared

### Pet type strategies
- `IPetTypeStrategy` → `src/shared/petTypes/IPetTypeStrategy.ts`
- `BasePetTypeStrategy` → `src/shared/petTypes/BasePetTypeStrategy.ts`
- `DefaultPetTypeStrategy` → `src/shared/petTypes/DefaultPetTypeStrategy.ts` — 未知种类兜底
- `ChickenPetTypeStrategy` / `RabbitPetTypeStrategy` / `CatPetTypeStrategy` / `DogPetTypeStrategy`
- `resolvePetTypeStrategy` / `getAdoptablePetStrategies` / `ADOPTABLE_PET_TYPES` → `src/shared/petTypes/petTypeRegistry.ts`

### Constants / DI / Toast
- `src/shared/constants.ts` — `DEFAULT_CHILD_ID` / `REWARD_CATEGORIES` / `ROUTES`
- `src/shared/container.ts` — 5 个 Service 单例
- `src/shared/toast.ts` — `toast.success()` / `toast.error()`

### Components
- `BaseModal` → `src/presentation/components/BaseModal.tsx`
- `GlobalToast` → `src/presentation/components/GlobalToast.tsx`
- `MonthCalendar` → `src/presentation/components/MonthCalendar.tsx`

---

## Domain

### Models
- `Category` → `src/domain/models/Category.ts`
- `DailyTaskSnapshot` → `src/domain/models/DailyTaskSnapshot.ts`
- `Pet` → `src/domain/models/Pet.ts`
- `PointBalance` → `src/domain/models/PointBalance.ts`
- `Reward` → `src/domain/models/Reward.ts`
- `RewardLog` → `src/domain/models/RewardLog.ts`
- `Task` → `src/domain/models/Task.ts`
- `TaskLog` → `src/domain/models/TaskLog.ts`

### Value Objects
- `PetStage` → `src/domain/valueObjects/PetStage.ts`
- `TaskType` → `src/domain/valueObjects/TaskType.ts`

### Rules
- `DateUtils` → `src/domain/rules/DateUtils.ts`
- `PetGrowthRule` → `src/domain/rules/PetGrowthRule.ts`
- `PointRule` → `src/domain/rules/PointRule.ts`
- `TaskResetRule` → `src/domain/rules/TaskResetRule.ts`

---

## Assets

- `public/pets/cat/` — 五阶段主图 + `evo-shell-{left,right,top}.png`
- `public/pets/chicken/` — 五阶段主图 + `evo-shell-{left,right,top}.png`
- `public/pets/dog/` — 五阶段主图 + `evo-shell-{left,right,top}.png`
- `public/pets/rabbit/` — 五阶段主图 + `evo-shell-{left,right,top}.png`
