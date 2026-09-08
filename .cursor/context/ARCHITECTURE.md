# ARCHITECTURE.md — 代码结构

> 最后更新：2026-09-08
> 维护方式：人工维护，架构变动时同步更新

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| UI 框架 | React | ^18.3.1 |
| 语言 | TypeScript（strict） | ^7.0.2 |
| 构建 | Vite | ^8.2.2 |
| 样式 | Tailwind CSS v4 | ^4.3.3（@tailwindcss/vite 插件） |
| 状态管理 | Zustand | ^5.0.15 |
| 持久化 | Dexie.js（IndexedDB） | ^4.4.5 |
| 路由 | React Router DOM | ^7.18.3 |
| 动画 | Framer Motion | ^13.1.1 |
| 图标 | @phosphor-icons/react | ^2.1.10 |
| PWA | vite-plugin-pwa | ^1.3.0 |
| 日期处理 | date-fns | ^4.4.0 |
| 日历组件 | react-day-picker | ^10.0.1 |

---

## 目录结构

```
src/
├── domain/                          # 领域层（纯 TS，零依赖）
│   ├── models/                      # 领域模型（8 个 class）
│   │   ├── Task.ts                  # 任务
│   │   ├── TaskLog.ts               # 任务完成记录
│   │   ├── Pet.ts                   # 宠物
│   │   ├── Reward.ts                # 奖励（categoryId 关联分类）
│   │   ├── RewardLog.ts             # 兑换记录（含 status 生命周期）
│   │   ├── PointBalance.ts          # 积分余额（含 refundReward）
│   │   ├── Category.ts              # 奖励分类
│   │   └── DailyTaskSnapshot.ts     # 每日打卡快照
│   ├── valueObjects/                # 值对象
│   │   ├── TaskType.ts              # 任务类型枚举 + getTaskTypeLabel()
│   │   └── PetStage.ts             # 宠物阶段枚举 + getStageConfig()
│   ├── repositories/                # 仓储接口（6 个）
│   │   ├── ITaskRepository.ts
│   │   ├── IRewardRepository.ts     # 含分类 + 券 log 查询
│   │   ├── IPointRepository.ts
│   │   ├── IPetRepository.ts
│   │   ├── IBackupAdapter.ts       # 备份适配器接口 + BackupData（含 categories）
│   │   └── ISnapshotRepository.ts   # 快照仓储接口
│   └── rules/                       # 业务规则（纯函数）
│       ├── TaskResetRule.ts         # 完成判定 + 统计
│       ├── PetGrowthRule.ts         # 进化 + 经验计算
│       ├── PointRule.ts             # 积分格式化
│       └── DateUtils.ts            # 日期工具（getTodayStart/getWeekStart/parseDateStrToLocal/getDayRange/getMonthRange）
│
├── infrastructure/                   # 基础设施层（Dexie 实现）
│   ├── database/
│   │   ├── DexieDatabase.ts         # DB schema（v6，8 张表）
│   │   └── repositories/            # 5 个 Dexie 实现
│   │       ├── DexieTaskRepository.ts
│   │       ├── DexieRewardRepository.ts  # 含分类 CRUD + 券查询
│   │       ├── DexiePointRepository.ts
│   │       ├── DexiePetRepository.ts
│   │       └── DexieSnapshotRepository.ts  # 快照持久化
│   ├── storage/
│   │   └── JsonBackupAdapter.ts     # JSON 文件备份/恢复（含 categories）
│   └── pwa/                          # PWA 相关（如有）
│
├── application/                      # 应用层（编排业务逻辑）
│   ├── services/                     # 5 个 Service
│   │   ├── TaskService.ts           # 含快照生成/更新/月度查询
│   │   ├── RewardService.ts         # 含分类管理 + 券核销/退还
│   │   ├── PointService.ts          # 含 refundReward
│   │   ├── PetService.ts
│   │   └── BackupService.ts
│   └── dto/                          # 数据传输对象（如有）
│
├── presentation/                     # 表现层（React）
│   ├── hooks/                        # 5 个 Zustand store
│   │   ├── useTaskStore.ts
│   │   ├── useRewardStore.ts        # 含券核销/退还/pending 查询
│   │   ├── usePointStore.ts
│   │   ├── usePetStore.ts
│   │   └── useTaskHistoryStore.ts   # 打卡历史数据管理
│   ├── layouts/
│   │   ├── AppLayout.tsx            # 根布局
│   │   └── TabBar.tsx               # 底部导航栏
│   ├── components/                   # 公共组件
│   │   ├── BaseModal.tsx            # 统一弹窗基座（ESC/focus trap/aria）
│   │   ├── GlobalToast.tsx          # 全局 Toast 渲染组件
│   │   └── MonthCalendar.tsx        # 通用月历组件（react-day-picker v10）
│   └── pages/                        # 9 个页面模块
│       ├── Home/                     # 首页（PetMiniCard + TodayTaskList + CouponMiniCard）
│       ├── TaskCheckin/              # 任务打卡（含 NegativeBalanceGuide 负分引导）
│       ├── TaskManage/               # 任务管理（TaskEditModal）
│       ├── TaskHistory/              # 打卡历史（DateView + TaskView + MonthPickerModal + MonthStats）
│       ├── Pet/                      # 宠物（PetDisplay + StatusPanel + ActionButtons + CreatePetForm + EvolutionOverlay）
│       ├── Shop/                     # 商城（RewardCard + RewardEditModal + RedeemConfirm + RedeemSuccess）
│       ├── MyCoupons/                # 我的券（券列表 + 核销/退还）
│       ├── RedeemHistory/            # 兑换历史
│       └── Settings/                 # 设置（SettingsSection + SettingsRow + PetNameEditor + ConfirmDialog）
│
└── shared/                           # 跨层共享
    ├── constants.ts                  # DEFAULT_CHILD_ID, REWARD_CATEGORIES, ROUTES（9 个路由）
    ├── container.ts                  # DI 容器（实例化 Service 并注入 Repository，含 snapshotRepo）
    ├── toast.ts                      # 全局命令式 Toast API（toast.success/error）
    ├── types/                        # 共享类型（如有）
    └── utils/                        # 工具函数（如有）
```

---

## 路由组织

使用 React Router v7，所有路由定义在 `src/App.tsx`。
6 个页面均通过 `React.lazy()` 懒加载，外层 `<Suspense>` + `<AppLayout>` 包裹。

| Path | 页面 | 说明 |
|------|------|------|
| `/` | `<Navigate to="/home">` | 根路径重定向 |
| `/home` | `HomePage` | 首页 |
| `/tasks` | `TaskCheckinPage` | 任务打卡 |
| `/tasks/manage` | `TaskManagePage` | 任务管理 |
| `/tasks/history` | `TaskHistoryPage` | 打卡历史 |
| `/pet` | `PetPage` | 宠物 |
| `/shop` | `ShopPage` | 奖励商城 |
| `/shop/coupons` | `MyCouponsPage` | 我的券 |
| `/shop/history` | `RedeemHistoryPage` | 兑换历史 |
| `/settings` | `SettingsPage` | 设置 |

路由常量定义在 `src/shared/constants.ts` 的 `ROUTES` 对象中。
全局 `GlobalToast` 组件挂载于 Router 内，提供命令式 Toast 能力。

---

## 状态管理

Zustand v5 store，5 个业务 store + 1 个基础设施 store：

| Store | 职责 | 核心 State |
|-------|------|-----------|
| `useTaskStore` | 任务 CRUD + 打卡 + 统计 | `tasks`, `stats`, `loading` |
| `usePetStore` | 宠物养成 + 喂食 + 互动 | `status`, `loading` |
| `usePointStore` | 积分余额查询 | `balance`, `loading` |
| `useRewardStore` | 奖励 CRUD + 兑换 + 券管理 + 全量日志 | `rewards`, `loading`, `pendingCoupons`, `allLogs` |
| `useTaskHistoryStore` | 打卡历史（月度快照 + 日志） | `snapshots`, `logs`, `loading` |
| `useToastStore`（`shared/toast.ts`） | 全局 Toast 状态 | `message`, `type`, `visible` |

Store 内部调用 Application Service，Service 再操作 Repository。

---

## 依赖注入

`src/shared/container.ts` 作为 DI 容器：

```
KidManageDB (Dexie 实例)
  ↓
DexieXxxRepository (实现接口，共 5 个)
  ↓
XxxService (注入 Repository)
  ↓
导出 5 个 Service 单例：taskService / rewardService / pointService / petService / backupService
```

关键注入关系：
- `taskService = new TaskService(taskRepo, pointService, snapshotRepo)` — 注入快照仓储
- `rewardService = new RewardService(rewardRepo, pointService)` — 含分类 + 券管理

Zustand Store 内部通过 `import { xxxService } from '@/shared/container'` 获取 Service。

---

## 数据持久化

Dexie.js v4 操作 IndexedDB，数据库名 `kid-manage`（class 名 `KidManageDB`），当前 schema 版本 v6。

| 表名 | 主键 | 索引 | 版本 |
|------|------|------|------|
| `tasks` | `id` | `childId`, `type`, `isActive`, `[childId+isActive]`, `[childId+type]` | v1 (v2 加复合索引) |
| `taskLogs` | `id` | `taskId`, `childId`, `completedAt` | v1 |
| `pets` | `id` | `childId` | v1 |
| `rewards` | `id` | `isPreset`, `isActive`, `categoryId` | v1 (v5 加 categoryId) |
| `rewardLogs` | `id` | `rewardId`, `childId`, `redeemedAt`, `status`, `[childId+status]`, `[rewardId+childId+status]` | v1 (v3 加 status) |
| `pointBalances` | `childId` | — | v1 |
| `categories` | `id` | `&name`（唯一） | **v4 新增** |
| `dailySnapshots` | `id` | `[childId+date]` | **v6 新增** |

Schema 版本迁移历史：v1(初始 6 表) → v2(复合索引) → v3(rewardLogs status) → v4(+categories) → v5(rewards categoryId) → v6(+dailySnapshots)

> 修改 schema 须在 `DexieDatabase.ts` 中升级版本号。v3/v5 已配置 `.upgrade()` 迁移函数。

---

## 路径别名

| 别名 | 映射 |
|------|------|
| `@/*` | `./src/*` |

同时在 `tsconfig.json` 和 `vite.config.ts` 中配置。

---

## 公共组件清单

| 组件 | 路径 | 用途 |
|------|------|------|
| `BaseModal` | `src/presentation/components/BaseModal.tsx` | 统一弹窗基座（ESC/focus trap/aria） |
| `GlobalToast` | `src/presentation/components/GlobalToast.tsx` | 全局命令式 Toast 渲染 |
| `MonthCalendar` | `src/presentation/components/MonthCalendar.tsx` | 通用月历组件（react-day-picker v10） |
| `AppLayout` | `src/presentation/layouts/AppLayout.tsx` | 根布局 |
| `TabBar` | `src/presentation/layouts/TabBar.tsx` | 底部导航栏 |
