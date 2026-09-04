# Kid Manage — 实施计划

> **版本**：v1.1  
> **日期**：2026-09-02  
> **关联设计文档**：[2026-09-02-kid-manage-design.md](./2026-09-02-kid-manage-design.md)  
> **状态**：Phase 0-7 已完成，Phase 8 待开始

---

## 开发顺序原则

按架构层级 **从内到外** 构建：Domain → Infrastructure → Application → Presentation

```
Phase 0: 项目搭建
Phase 1: 领域层（Domain）
Phase 2: 基础设施层（Infrastructure）
Phase 3: 应用层（Application）
Phase 4: 展示层 - 框架与布局
Phase 5: 展示层 - 任务系统页面
Phase 6: 展示层 - 宠物系统页面
Phase 7: 展示层 - 奖励商城页面
Phase 8: 展示层 - 首页与设置
Phase 9: PWA 与收尾
```

---

## Phase 0：项目搭建（~1 小时）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 0.1 | 初始化 Vite + React + TS 项目 | `npm create vite@latest` | ✅ |
| 0.2 | 安装核心依赖 | react-router-dom, tailwindcss, zustand, dexie, framer-motion, @phosphor-icons/react | ✅ |
| 0.3 | 配置 Tailwind CSS | `@tailwindcss/vite` 插件 + CSS `@theme` 配置（Tailwind v4） | ✅ |
| 0.4 | 配置 vite-plugin-pwa | manifest + Service Worker 基础配置 | ⬜ Phase 9 |
| 0.5 | 创建目录结构 | presentation/ application/ domain/ infrastructure/ shared/ | ✅ |
| 0.6 | 配置路径别名 | `@/` → `src/`，简化导入路径 | ✅ |

### 依赖清单

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "antd-mobile": "^5.x",
    "zustand": "^4.x",
    "dexie": "^3.x",
    "framer-motion": "^10.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "vite-plugin-pwa": "^0.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x"
  }
}
```

---

## Phase 1：领域层 Domain（~2 小时）

> 核心原则：Domain 层零外部依赖，纯 TypeScript 业务逻辑。

| # | 任务 | 文件路径 | 状态 |
|---|------|---------|------|
| 1.1 | 值对象 - TaskType | `domain/valueObjects/TaskType.ts` | ✅ |
| 1.2 | 值对象 - PetStage | `domain/valueObjects/PetStage.ts` | ✅ |
| 1.3 | 值对象 - Points | `domain/valueObjects/Points.ts` | ✅ |
| 1.4 | 领域模型 - Task | `domain/models/Task.ts` | ✅ |
| 1.5 | 领域模型 - Pet | `domain/models/Pet.ts` | ✅ |
| 1.6 | 领域模型 - Reward | `domain/models/Reward.ts` | ✅ |
| 1.7 | 领域模型 - PointBalance | `domain/models/PointBalance.ts` | ✅ |
| 1.8 | 业务规则 - PetGrowthRule | `domain/rules/PetGrowthRule.ts` | ✅ |
| 1.9 | 业务规则 - TaskResetRule | `domain/rules/TaskResetRule.ts` | ✅ |
| 1.10 | 业务规则 - HungerRule | `domain/rules/HungerRule.ts` | ✅ |
| 1.11 | 业务规则 - PointRule | `domain/rules/PointRule.ts` | ✅ |
| 1.12 | 接口 - ITaskRepository | `domain/repositories/ITaskRepository.ts` | ✅ |
| 1.13 | 接口 - IPetRepository | `domain/repositories/IPetRepository.ts` | ✅ |
| 1.14 | 接口 - IRewardRepository | `domain/repositories/IRewardRepository.ts` | ✅ |
| 1.15 | 接口 - IPointRepository | `domain/repositories/IPointRepository.ts` | ✅ |

### 领域模型关键设计

#### Task

```typescript
class Task {
  // 业务方法
  complete(): TaskLog           // 标记完成，生成日志
  isCompletedToday(): boolean   // 今日是否已完成
  shouldReset(): boolean        // 是否需要刷新
  deactivate(): void            // 停用任务
}
```

#### Pet

```typescript
class Pet {
  // 业务方法
  feed(foodExp: number): void   // 喂食 → 增加 EXP，降低饥饿度
  pet(): void                   // 抚摸 → 增加心情
  updateHunger(): void          // 根据时间更新饥饿度
  checkEvolution(): boolean     // 检查是否可进化
}
```

#### PointBalance

```typescript
class PointBalance {
  earn(amount: number): void    // 获得积分
  spendOnPet(amount: number): boolean    // 喂宠物消费
  spendOnReward(amount: number): boolean // 兑换奖励消费
  canAfford(amount: number): boolean     // 是否够花
}
```

---

## Phase 2：基础设施层 Infrastructure（~2 小时）

| # | 任务 | 文件路径 | 状态 |
|---|------|---------|------|
| 2.1 | Dexie 数据库定义 | `infrastructure/database/DexieDatabase.ts` | ✅ |
| 2.2 | TaskRepository 实现 | `infrastructure/database/repositories/DexieTaskRepository.ts` | ✅ |
| 2.3 | PetRepository 实现 | `infrastructure/database/repositories/DexiePetRepository.ts` | ✅ |
| 2.4 | RewardRepository 实现 | `infrastructure/database/repositories/DexieRewardRepository.ts` | ✅ |
| 2.5 | PointRepository 实现 | `infrastructure/database/repositories/DexiePointRepository.ts` | ✅ |
| 2.6 | JSON 备份适配器 | `infrastructure/storage/JsonBackupAdapter.ts` | ✅ |

### 数据映射

每个 Repository 实现包含两个映射方法：

```typescript
// 数据库记录 → 领域模型
private toDomain(record: TaskRecord): Task

// 领域模型 → 数据库记录
private toPersistence(task: Task): TaskRecord
```

---

## Phase 3：应用层 Application（~2 小时）

| # | 任务 | 文件路径 | 状态 |
|---|------|---------|------|
| 3.1 | PointService | `application/services/PointService.ts` | ✅ |
| 3.2 | TaskService | `application/services/TaskService.ts` | ✅ |
| 3.3 | PetService | `application/services/PetService.ts` | ✅ |
| 3.4 | RewardService | `application/services/RewardService.ts` | ✅ |
| 3.5 | BackupService | `application/services/BackupService.ts` | ✅ |
| 3.6 | DTO 定义 | `application/dto/TaskDTO.ts`, `PetStatusDTO.ts` | ✅ |
| 3.7 | 依赖注入容器 | `shared/container.ts` | ✅ |

### Service 职责说明

| Service | 核心职责 |
|---------|---------|
| **PointService** | 积分查询、增加、消费、余额计算 |
| **TaskService** | 任务 CRUD、完成确认、每日/每周刷新、积分联动 |
| **PetService** | 喂食（联动扣积分）、抚摸、状态查询、饥饿度更新 |
| **RewardService** | 奖励 CRUD、兑换（联动扣积分）、预设奖励初始化 |
| **BackupService** | 全量导出 JSON、导入 JSON（校验 + 覆盖写入） |

---

## Phase 4：展示层 - 框架与布局（~1 小时）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 4.1 | 路由配置 | BrowserRouter + 6 个页面路由（含任务管理子页面） | ✅ |
| 4.2 | TabBar 布局组件 | 底部 5 Tab 导航（Phosphor Icons） | ✅ |
| 4.3 | 全局样式 | Claymorphism 风格、圆角、Tailwind v4 @theme | ✅ |
| 4.4 | UI Hooks | `useTaskStore`, `usePetStore`, `useRewardStore`, `usePointStore` (Zustand) | ✅ |

### 配色方案

```css
--color-primary: #FF9BB0;      /* 柔粉色 */
--color-secondary: #C4A8E0;    /* 薰衣草紫 */
--color-accent: #7ECFC0;       /* 薄荷绿 */
--color-warning: #FFB74D;      /* 柔橙色 */
--color-background: #FFF8F0;   /* 奶白色 */
--color-card: #FFFFFF;         /* 纯白 */
--color-text: #4A4A4A;         /* 深灰 */
```

---

## Phase 5：任务系统页面（~4 小时）

任务系统分为两个视图：「今日打卡」（日常使用）和「任务管理」（配置用）。

### Phase 5A：今日打卡页面（任务 Tab 默认视图）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 5.1 | 今日打卡页面 | 进度卡片（已完成/已获积分/待完成）+ 按类型分组的任务列表 | ✅ |
| 5.2 | 完成任务交互 | 点击任务勾选完成 → 积分 +N 动画 → 进度卡片实时更新 | ✅ |
| 5.3 | 扣分快捷按钮 | 底部扣分按钮区域，点击即记录一次扣分 → 积分 -N | ✅ |
| 5.4 | 任务刷新逻辑 | 打开 App 时检查并刷新每日/每周任务完成状态 | ✅ |
| 5.5 | 导航到管理页 | 右上角「⚙️ 管理」按钮 → 跳转任务管理页 | ✅ |

### Phase 5B：任务管理页面（子页面）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 5.6 | 任务管理列表页 | 按类型分组展示所有任务，每行带「>」箭头暗示可点击 | ✅ |
| 5.7 | 返回导航 | 左上角「← 返回」按钮 → 返回今日打卡页 | ✅ |
| 5.8 | 编辑任务弹窗 | 居中 Modal：任务名称/积分/类型 Chip + 保存按钮 + 底部删除 | ✅ |
| 5.9 | 新增任务弹窗 | 复用编辑弹窗组件，标题改为「新增任务」，无删除按钮 | ✅ |
| 5.10 | 删除任务 | 编辑弹窗底部「🗑️ 删除任务」→ 二次确认 → 删除 | ✅ |

---

## Phase 6：宠物系统页面（~3 小时）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 6.1 | 宠物展示区域 | PetDisplay 组件：Phosphor Icons 占位 + 浮动动画 + 爱心特效 | ✅ |
| 6.2 | 状态面板 | StatusPanel：饥饿度/心情/成长进度条 + Claymorphism 卡片 | ✅ |
| 6.3 | 喂食交互 | ActionButtons：积分检查 → 扣积分 → spinner → EXP 增加 | ✅ |
| 6.4 | 抚摸交互 | 点击宠物区域 → 弹出爱心动画 + 心情增加 | ✅ |
| 6.5 | 进化动画 | EvolutionOverlay：全屏庆祝特效（星星旋转 + 文字） | ✅ |
| 6.6 | 创建宠物表单 | CreatePetForm：输入名字 + 选择类型（小鸡/小兔） | ✅ |

---

## Phase 7：奖励商城页面（~2 小时）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 7.1 | 奖励列表页 | 分类分组展示 + 顶部积分余额 + FAB 添加按钮 | ✅ |
| 7.2 | 预设奖励初始化 | 首次启动写入 6 个预设奖励（娱乐/美食/玩具/特权） | ✅ |
| 7.3 | 添加自定义奖励 | RewardEditModal：名称+分类 Chip+积分+图标选择 | ✅ |
| 7.4 | 兑换交互 | RedeemConfirm 确认 → 扣积分 → RedeemSuccess 庆祝动画 | ✅ |
| 7.5 | 编辑/删除奖励 | RewardEditModal 复用：修改内容 + 二次确认删除 | ✅ |

---

## Phase 8：首页与设置（~2 小时）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 8.1 | 首页 - 宠物状态卡片 | 迷你宠物形象 + 饥饿/心情状态 | ⬜ |
| 8.2 | 首页 - 今日任务列表 | 展示今日任务 + 快捷点击完成 | ⬜ |
| 8.3 | 首页 - 积分余额 | 顶部显示当前积分 | ⬜ |
| 8.4 | 设置 - 孩子信息 | 修改孩子名字、宠物名字（点击行进入编辑） | ⬜ |
| 8.5 | 设置 - 导出数据 | 点击导出 → 生成 JSON → 下载文件（文件名含日期） | ⬜ |
| 8.6 | 设置 - 导入数据 | 上传 JSON → 校验格式 → 确认覆盖弹窗 → 导入 | ⬜ |
| 8.7 | 设置 - 关于 | 版本号（静态显示）、使用说明页面 | ⬜ |
| 8.8 | 设置 - 重置数据 | 红色按钮 → 二次确认弹窗 → 清除全部 IndexedDB 数据 | ⬜ |

---

## Phase 9：PWA 与收尾（~1 小时）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 9.1 | PWA 图标制作 | 多尺寸 App 图标（192x192, 512x512） | ⬜ |
| 9.2 | PWA manifest 完善 | name, theme_color, background_color, display: standalone | ⬜ |
| 9.3 | Service Worker 缓存策略 | 静态资源 precache + runtime cache | ⬜ |
| 9.4 | 持久化存储 | 启动时调用 `navigator.storage.persist()` | ⬜ |
| 9.5 | iPad 响应式适配 | 适配 iPad 宽屏布局 | ⬜ |
| 9.6 | 首次启动引导 | 输入孩子名字 → 选择第一只宠物蛋 → 进入首页 | ⬜ |

---

## 预估总工时

| 阶段 | 内容 | 预估时间 |
|------|------|---------|
| Phase 0 | 项目搭建 | ~1 小时 |
| Phase 1 | 领域层 | ~2 小时 |
| Phase 2 | 基础设施层 | ~2 小时 |
| Phase 3 | 应用层 | ~2 小时 |
| Phase 4 | 展示层框架 | ~1 小时 |
| Phase 5 | 任务系统 UI | ~3 小时 |
| Phase 6 | 宠物系统 UI | ~3 小时 |
| Phase 7 | 奖励商城 UI | ~2 小时 |
| Phase 8 | 首页与设置 | ~2 小时 |
| Phase 9 | PWA 收尾 | ~1 小时 |
| **总计** | | **~19 小时** |

---

## 风险与注意事项

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 宠物素材制作 | 影响视觉效果 | MVP 先用占位图，后续用 AI 生成正式素材 |
| iOS PWA 数据丢失 | 积分和宠物进度丢失 | persist API + 导出备份提醒 |
| 动画性能 | iPad 上可能卡顿 | Framer Motion 硬件加速，避免过复杂动画 |
| IndexedDB 兼容性 | 老旧浏览器不支持 | iPad Safari 完全支持，风险极低 |

---

## 开发日志

### 2026-09-02 — Day 1

#### 完成内容

| Phase | 内容 | 关键文件 |
|-------|------|---------|
| **Phase 0** | 项目搭建 | `vite.config.ts`, `index.html`, `package.json`, `tsconfig.json` |
| **Phase 1** | 领域层 15 个文件 | `domain/models/`, `domain/valueObjects/`, `domain/rules/`, `domain/repositories/` |
| **Phase 2** | 基础设施层 6 个文件 | `infrastructure/database/`, `infrastructure/storage/` |
| **Phase 3** | 应用层 7 个文件 | `application/services/`, `application/dto/`, `shared/container.ts` |
| **Phase 4** | 展示层框架 | `AppLayout.tsx`, `TabBar.tsx`, `App.tsx`, 4 个 Zustand store |
| **Phase 5** | 任务系统页面 | `TaskCheckin/index.tsx`, `TaskManage/index.tsx`, `TaskManage/TaskEditModal.tsx` |
| **Phase 6** | 宠物系统页面 | `Pet/index.tsx`, `CreatePetForm.tsx`, `PetDisplay.tsx`, `StatusPanel.tsx`, `ActionButtons.tsx`, `EvolutionOverlay.tsx` |
| **Phase 7** | 奖励商城页面 | `Shop/index.tsx`, `RewardCard.tsx`, `RewardEditModal.tsx`, `RedeemConfirm.tsx`, `RedeemSuccess.tsx` |

#### 技术决策与变更

| 决策 | 原方案 | 实际方案 | 原因 |
|------|--------|---------|------|
| CSS 框架 | Tailwind v3 + PostCSS | **Tailwind v4** + `@tailwindcss/vite` 插件 | v4 无需 config 文件，直接用 CSS `@theme` |
| 路由 | HashRouter | **BrowserRouter** | 用户要求，将部署到 Vercel |
| 图标 | Emoji | **Phosphor Icons** (SVG) | UI/UX Review 发现 emoji 跨平台不一致 |
| 任务类型选择 | 原生 `<select>` | **自定义 Chip 按钮组** | 原生下拉在 transform 容器中定位异常 |
| 组件库 | Ant Design Mobile | **无（纯自定义组件）** | Claymorphism 风格自定义度高 |
| 表单 padding | Tailwind `px-*/py-*` | **inline `style`** | Tailwind v4 CSS Cascade Layers 优先级问题 |

#### 已知问题 & 待办

| 优先级 | 问题 | 状态 |
|--------|------|------|
| P1 | Figma 宠物进化设计稿（卡通 Q 版小鸡/小兔）待重新生成 | ⏳ 等 Figma 限额恢复 |
| P2 | iPad 响应式布局仍有优化空间（未完全铺满屏幕） | ⏳ Phase 9 |
| P2 | 宠物素材目前为 Phosphor Icons 占位，需替换正式卡通素材 | ⏳ 后续 |
| P2 | Vite HMR 在 macOS sandbox 下需 usePolling，开发体验略慢 | ✅ 已配置 |

#### 明天继续

- **Phase 8**：首页与设置页面（宠物状态卡片、今日任务速览、数据导入导出、重置）
- **Phase 9**：PWA 配置、持久化存储、iPad 适配收尾、首次引导流程
