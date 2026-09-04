# ARCHITECTURE.md — 代码结构

> 最后更新：2026-09-03
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

---

## 目录结构

```
src/
├── domain/                          # 领域层（纯 TS，零依赖）
│   ├── models/                      # 领域模型（6 个 class）
│   │   ├── Task.ts                  # 任务
│   │   ├── TaskLog.ts               # 任务完成记录
│   │   ├── Pet.ts                   # 宠物
│   │   ├── Reward.ts                # 奖励
│   │   ├── RewardLog.ts             # 兑换记录
│   │   └── PointBalance.ts          # 积分余额
│   ├── valueObjects/                # 值对象
│   │   ├── TaskType.ts              # 任务类型枚举 + getTaskTypeLabel()
│   │   └── PetStage.ts             # 宠物阶段枚举 + getStageConfig()
│   ├── repositories/                # 仓储接口
│   │   ├── ITaskRepository.ts
│   │   ├── IRewardRepository.ts
│   │   ├── IPointRepository.ts
│   │   ├── IPetRepository.ts
│   │   └── IBackupAdapter.ts       # 备份适配器接口 + BackupData 类型
│   └── rules/                       # 业务规则（纯函数）
│       ├── TaskResetRule.ts         # 完成判定 + 统计
│       ├── PetGrowthRule.ts         # 进化 + 经验计算
│       ├── (已删除 HungerRule.ts — 心情衰减逻辑移入 Pet 模型)
│       ├── PointRule.ts             # 积分格式化
│       └── DateUtils.ts            # 日期边界（getTodayStart/getWeekStart）
│
├── infrastructure/                   # 基础设施层（Dexie 实现）
│   ├── database/
│   │   ├── DexieDatabase.ts         # DB schema（v2，6 张表）
│   │   └── repositories/            # 4 个 Dexie 实现
│   │       ├── DexieTaskRepository.ts
│   │       ├── DexieRewardRepository.ts
│   │       ├── DexiePointRepository.ts
│   │       └── DexiePetRepository.ts
│   ├── storage/
│   │   └── JsonBackupAdapter.ts     # JSON 文件备份/恢复
│   └── pwa/                          # PWA 相关（如有）
│
├── application/                      # 应用层（编排业务逻辑）
│   ├── services/                     # 5 个 Service
│   │   ├── TaskService.ts
│   │   ├── RewardService.ts
│   │   ├── PointService.ts
│   │   ├── PetService.ts
│   │   └── BackupService.ts
│   └── dto/                          # 数据传输对象（如有）
│
├── presentation/                     # 表现层（React）
│   ├── hooks/                        # 4 个 Zustand store
│   │   ├── useTaskStore.ts
│   │   ├── useRewardStore.ts
│   │   ├── usePointStore.ts
│   │   └── usePetStore.ts
│   ├── layouts/
│   │   ├── AppLayout.tsx            # 根布局
│   │   └── TabBar.tsx               # 底部导航栏
│   ├── components/                   # 公共组件（目前为空）
│   │   └── LoadingFallback.tsx      # 懒加载 fallback
│   └── pages/                        # 6 个页面模块
│       ├── Home/                     # 首页（PetMiniCard + TodayTaskList）
│       ├── TaskCheckin/              # 任务打卡
│       ├── TaskManage/               # 任务管理（TaskEditModal）
│       ├── Pet/                      # 宠物（PetDisplay + StatusPanel + ActionButtons + CreatePetForm + EvolutionOverlay）
│       ├── Shop/                     # 商城（RewardCard + RewardEditModal + RedeemConfirm + RedeemSuccess）
│       └── Settings/                 # 设置（SettingsSection + SettingsRow + PetNameEditor + ConfirmDialog）
│
└── shared/                           # 跨层共享
    ├── constants.ts                  # DEFAULT_CHILD_ID, REWARD_CATEGORIES, ROUTES
    ├── container.ts                  # DI 容器（实例化 Service 并注入 Repository）
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
| `/pet` | `PetPage` | 宠物 |
| `/shop` | `ShopPage` | 奖励商城 |
| `/settings` | `SettingsPage` | 设置 |

路由常量定义在 `src/shared/constants.ts` 的 `ROUTES` 对象中。

---

## 状态管理

Zustand v5 store，4 个独立 store 对应 4 个业务域：

| Store | 职责 | 核心 State |
|-------|------|-----------|
| `useTaskStore` | 任务 CRUD + 打卡 + 统计 | `tasks`, `stats`, `loading` |
| `usePetStore` | 宠物养成 + 喂食 + 互动 | `status`, `loading` |
| `usePointStore` | 积分余额查询 | `balance`, `loading` |
| `useRewardStore` | 奖励 CRUD + 兑换 | `rewards`, `loading` |

Store 内部调用 Application Service，Service 再操作 Repository。

---

## 依赖注入

`src/shared/container.ts` 作为 DI 容器：

```
KidManageDB (Dexie 实例)
  ↓
DexieXxxRepository (实现接口)
  ↓
XxxService (注入 Repository)
  ↓
导出 5 个 Service 单例：taskService / rewardService / pointService / petService / backupService
```

Zustand Store 内部通过 `import { xxxService } from '@/shared/container'` 获取 Service。

---

## 数据持久化

Dexie.js v4 操作 IndexedDB，数据库名 `KidManageDB`，当前 schema 版本 v2。

| 表名 | 主键 | 索引 |
|------|------|------|
| `tasks` | `id` | `childId`, `type`, `isActive`, `[childId+isActive]`, `[childId+type]` |
| `taskLogs` | `id` | `taskId`, `childId`, `completedAt` |
| `pets` | `id` | `childId` |
| `rewards` | `id` | `isPreset`, `isActive` |
| `rewardLogs` | `id` | `rewardId`, `childId`, `redeemedAt` |
| `pointBalances` | `childId` | — |

> 修改 schema 须在 `DexieDatabase.ts` 中升级版本号。

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
| `LoadingFallback` | `src/presentation/components/LoadingFallback.tsx` | React.lazy 懒加载 fallback |
| `AppLayout` | `src/presentation/layouts/AppLayout.tsx` | 根布局 |
| `TabBar` | `src/presentation/layouts/TabBar.tsx` | 底部导航栏 |
