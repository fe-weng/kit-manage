# CODE_INDEX.md — 代码索引

> 自动生成，请勿手动编辑
> 生成时间：2026-10-30
> 生成方式：project-context-generator Skill（适配 App.tsx + presentation/pages）

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
- `FeedingFx` → `src/presentation/pages/Pet/FeedingFx.tsx`
- `PetDisplay` → `src/presentation/pages/Pet/PetDisplay.tsx`
- `PetToolbar` → `src/presentation/pages/Pet/PetToolbar.tsx`
- `RaisingShortcutCard` → `src/presentation/pages/Pet/RaisingShortcutCard.tsx`
- `StatusPanel` → `src/presentation/pages/Pet/StatusPanel.tsx`
- `evolutionTransition` → `src/presentation/pages/Pet/evolutionTransition.ts`
- `feedingTransition` → `src/presentation/pages/Pet/feedingTransition.ts`

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

## Coloring（涂色）

### Pages
- `/coloring` → `src/presentation/pages/Coloring/AlbumPage.tsx`
- `/coloring/paint/:templateId` → `src/presentation/pages/Coloring/PaintPage.tsx`
- `/coloring/drafts` → `src/presentation/pages/Coloring/DraftListPage.tsx`
- `/coloring/drafts/:draftId` → `src/presentation/pages/Coloring/PaintPage.tsx`
- `/coloring/finished` → `src/presentation/pages/Coloring/FinishedListPage.tsx`
- `/coloring/finished/:finishedId` → `src/presentation/pages/Coloring/FinishedViewPage.tsx`

### Components
- `ColorBar` → `src/presentation/pages/Coloring/ColorBar.tsx`
- `CustomColorSheet` → `src/presentation/pages/Coloring/CustomColorSheet.tsx`
- `PaintStage` → `src/presentation/pages/Coloring/PaintStage.tsx`
- `StackedPreview` → `src/presentation/pages/Coloring/StackedPreview.tsx`
- `StrokeSizeControls` → `src/presentation/pages/Coloring/StrokeSizeControls.tsx`
- `coloringAssets` → `src/presentation/pages/Coloring/coloringAssets.ts`
- `customColor` → `src/presentation/pages/Coloring/customColor.ts`
- `downloadFinishedImage` → `src/presentation/pages/Coloring/downloadFinishedImage.ts`
- `paintRecovery` → `src/presentation/pages/Coloring/paintRecovery.ts`
- `paintSession` → `src/presentation/pages/Coloring/paintSession.ts`
- `useColoringAlbum` → `src/presentation/pages/Coloring/useColoringAlbum.ts`

---

## Hooks

- `usePetStore.ts` — `usePetStore`
- `usePointStore.ts` — `usePointStore`
- `useRewardStore.ts` — `useRewardStore`
- `useSnapshotLifecycle.ts` — `useSnapshotLifecycle`
- `useTaskHistoryStore.ts` — `useTaskHistoryStore`
- `useTaskStore.ts` — `useTaskStore`

---

## Services

- `BackupService.ts` — `exportData`, `importData`, `resetAllData`
- `ColoringService.ts` — `ensureBuiltinTemplates`, `listTemplates`, `getTemplate`, `importImage`, `deleteImportedTemplate`, `listResumeTemplateIds`, `getResumeBlob`, `saveResume`, `deleteResume`, `listDrafts`, `getDraft`, `createDraft`, `copyDraft`, `updateDraft`, `deleteDraft`, `archiveResumeAsDraft`, `listFinished`, `getFinished`, `saveFinished`, `saveFinishedFromTemplate`, `deleteFinished`, `readLabelCache`, `writeLabelCache`, `deleteLabelCache`
- `PetService.ts` — `getPet`, `getRaisingPet`, `getPetStatus`, `getRaisingStatus`, `getCollection`, `createPet`, `checkAdoption`, `adoptPet`, `feed`, `pet`, `rename`, `renamePet`, `setDisplayed`
- `PointService.ts` — `getBalance`, `earn`, `deduct`, `spendOnPet`, `spendOnReward`, `refundReward`
- `RewardService.ts` — `getAllRewards`, `getAllCategories`, `createReward`, `updateReward`, `addCustomCategory`, `deleteReward`, `redeem`, `getPendingCoupons`, `getAllLogs`, `markUsed`, `returnCoupon`, `initPresetRewards`
- `TaskService.ts` — `ensureSnapshotsUpToToday`, `ensureTodaySnapshot`, `getMonthSnapshots`, `getMonthLogs`, `getAllTasks`, `createTask`, `updateTask`, `deleteTask`, `completeTask`, `uncompleteTask`, `getTasksWithStatus`, `getTodayStats`

本应用没有 HTTP API。数据经 Dexie 写入 IndexedDB `kid-manage`。

---

## Shared

### Pet type strategies
- `IPetTypeStrategy` → `src/shared/petTypes/IPetTypeStrategy.ts`
- `BasePetTypeStrategy` → `src/shared/petTypes/BasePetTypeStrategy.ts`
- `DefaultPetTypeStrategy` → `src/shared/petTypes/DefaultPetTypeStrategy.ts`
- `ChickenPetTypeStrategy` / `RabbitPetTypeStrategy` / `CatPetTypeStrategy` / `DogPetTypeStrategy`
- `resolvePetTypeStrategy` / `getAdoptablePetStrategies` / `ADOPTABLE_PET_TYPES` → `src/shared/petTypes/petTypeRegistry.ts`

### Constants / DI / Toast
- `src/shared/constants.ts` — `DEFAULT_CHILD_ID` / `REWARD_CATEGORIES` / `ROUTES` / `coloringPaintPath` / `coloringDraftPath` / `coloringFinishedPath`
- `src/shared/appVersion.ts` — `APP_VERSION`（package.json 的 version）
- `src/shared/container.ts` — `taskService` / `rewardService` / `pointService` / `petService` / `backupService` / `coloringService`
- `src/shared/toast.ts` — `toast.success()` / `toast.error()`
- `src/shared/preventIpadUndoGesture.ts` — `installIpadUndoGestureGuard`

### Components
- `BaseModal` → `src/presentation/components/BaseModal.tsx`
- `GlobalToast` → `src/presentation/components/GlobalToast.tsx`
- `MonthCalendar` → `src/presentation/components/MonthCalendar.tsx`
- `AppLayout` → `src/presentation/layouts/AppLayout.tsx`
- `TabBar` → `src/presentation/layouts/TabBar.tsx`

---

## Domain

### Coloring
- `builtinTemplates` → `src/domain/coloring/builtinTemplates.ts`
- `labelRegions` → `src/domain/coloring/labelRegions.ts`
- `palette` → `src/domain/coloring/palette.ts`
- `scaleImage` → `src/domain/coloring/scaleImage.ts`
- `types` → `src/domain/coloring/types.ts`
- `IColoringRepository` → `src/domain/repositories/IColoringRepository.ts`
- `DexieColoringRepository` → `src/infrastructure/database/repositories/DexieColoringRepository.ts`

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
- `public/pets/draw-assets/` — 涂色内置线稿 SVG（`builtinTemplates.ts` 列出文件名）
