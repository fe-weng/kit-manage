# Grill-Me 设计文档：任务打卡历史

> 日期: 2026-09-07  
> 状态: 设计已确认，待实现

## 功能概述

在任务打卡页增加"历史"入口，展示任务的历史完成情况，分"按日期"和"按任务"两个维度。

## 页面结构

```
┌──────────────────────────────────┐
│  ← 返回        打卡历史          │  Header
├──────────────────────────────────┤
│  [ 按日期 ]  [ 按任务 ]          │  Segmented Control
├──────────────────────────────────┤
│  ◀  2026年9月  ▶  (可点击月份)  │  月份导航
├──────────────────────────────────┤
│  一  二  三  四  五  六  日      │
│  🟢  🟡  🔴  ⚪  🟢  🟢  [7]   │  月历
│  ...                              │
├──────────────────────────────────┤
│  📊 完成率 78%  |  ⭐ +320 分   │  统计摘要
├──────────────────────────────────┤
│  ── 正分任务 (3/5 完成) ──       │  详情（点击日期展开）
│  ✅ 早起打卡 +10                 │
│  ❌ 练琴30分钟 +25               │
│  ── 扣分记录 ──                   │
│  ⚠️ 拖延作业 -5                  │
└──────────────────────────────────┘
```

## 设计决策

| # | 决策项 | 结果 |
|---|--------|------|
| Q1 | 入口位置 | 任务打卡页（`/tasks`）头部加"历史"按钮 |
| Q2 | 默认视图 | 按日期 |
| Q3 | 时间范围 | 月历视图（自然月） |
| Q4 | 日期详情展示 | 月历下方内联展开（不跳转不弹窗） |
| Q5 | 按任务视图 | 同样使用月历展示 |
| Q6 | 任务选择方式 | 顶部选择器 → 点击后底部半弹窗选择任务 |
| Q7 | 状态颜色 | 按日期 4 色 / 按任务 2 色 |
| Q8 | 视图切换 | Segmented Control 分段控制器 |
| Q9 | 月份切换 | 左右箭头 + 点击月份标题弹出月份选择器 |
| Q10 | 未完成任务来源 | DailyTaskSnapshot 每日快照 |
| Q10+ | 快照策略 | 动态快照（当天增删任务同步更新，历史日期冻结） |
| Q11 | 快照任务类型 | DAILY/WEEKLY/ONE_TIME + NEGATIVE 独立维度 |
| Q12 | 扣分影响颜色 | 不影响日历颜色，只看正分任务完成比例 |
| Q13 | 统计摘要 | 当月完成率 + 当月获得积分 |

## 按日期视图 - 日历颜色规则

| 颜色 | 条件 | 说明 |
|------|------|------|
| 🟢 绿色 | 正分任务完成率 = 100% | 全部完成 |
| 🟠 橙色 | 正分任务完成率 ≥ 50% | 过半完成 |
| 🔴 红色 | 正分任务完成率 > 0% 且 < 50% | 少数完成 |
| ⚪ 灰色 | 正分任务完成率 = 0% | 全部未完成 |

## 按任务视图 - 日历颜色规则

| 颜色 | 条件 |
|------|------|
| 🟢 绿色 | 当天该任务已完成 |
| ⚪ 灰色 | 当天该任务未完成 |

## 按日期 - 详情区域

点击某天后，在月历下方展开，分两组展示：

### 正分任务

```
── 正分任务 (x/y 完成) ──
✅ 任务A +10
✅ 任务B +15
❌ 任务C +25 (未完成)
```

### 扣分记录

```
── 扣分记录 ──
⚠️ 扣分任务A -5
```

如果当天无扣分记录，不显示此区域。

## 按任务 - 半弹窗选择

```
┌──────────────────────────────────┐
│  选择任务                         │
├──────────────────────────────────┤
│  🟢 早起打卡       每日 +10     │
│  🟢 阅读30分钟     每日 +15     │
│  🟡 每周大扫除     每周 +50     │
│  🔴 拖延作业       扣分 -5      │
│  ...                              │
└──────────────────────────────────┘
```

按任务类型分组，NEGATIVE 单独一组。

## 数据模型

### DailyTaskSnapshot（新建）

```typescript
interface DailyTaskSnapshotProps {
  id: string            // 如 "default_2026-09-07"
  childId: string
  date: string          // "2026-09-07" (YYYY-MM-DD)
  taskIds: string[]     // 当天应完成的正分任务 ID 列表
  negativeTaskIds: string[] // 当天的扣分任务 ID 列表
  createdAt: number
  updatedAt: number
}
```

### Dexie Schema 变更

```
dailySnapshots: 'id, childId, date, [childId+date]'
```

### 快照生成逻辑

1. **首次打开任务打卡页**：检查今天是否有快照，没有则生成
2. **生成规则**：
   - DAILY 任务且 isActive → 加入 taskIds
   - WEEKLY 任务且 isActive → 加入 taskIds（本周内）
   - ONE_TIME 任务且 isActive 且未完成 → 加入 taskIds
   - NEGATIVE 任务且 isActive → 加入 negativeTaskIds
3. **动态更新**：当天任务增删时同步更新今天快照
4. **历史冻结**：只更新今天的快照，历史日期不变

## 统计摘要计算

- **完成率** = 当月所有快照日的已完成正分任务数 / 当月所有快照日的应完成正分任务总数
- **获得积分** = 当月所有 TaskLog 的 pointsEarned 之和

## 路由

```
TASKS_HISTORY: '/tasks/history'
```

## 技术实现分解

| 任务 | 内容 | 层 | 依赖 | 产出文件 | 状态 |
|------|------|---|------|---------|------|
| T1 | DailyTaskSnapshot 模型 + Repository 接口 | Domain | 无 | `domain/models/DailyTaskSnapshot.ts`, `domain/repositories/ISnapshotRepository.ts` | ⬜ |
| T2 | Dexie 新增 dailySnapshots 表 + Repository | Infrastructure | T1 | `DexieDatabase.ts` v6, `DexieSnapshotRepository.ts`, `container.ts` | ⬜ |
| T3 | TaskService 快照生成/更新/查询 | Application | T1,T2 | `TaskService.ts` 新增方法 | ⬜ |
| T4 | MonthCalendar 通用月历组件 | Presentation | 无 | `components/MonthCalendar.tsx` | ⬜ |
| T5 | TaskHistoryPage 主页面 + 路由 + 入口 | Presentation | T3 | `pages/TaskHistory/index.tsx`, 路由, 入口按钮 | ⬜ |
| T6 | DateView 按日期视图 + 详情展开 | Presentation | T3,T4 | `pages/TaskHistory/DateView.tsx` | ⬜ |
| T7 | TaskView 按任务视图 + 半弹窗选择 | Presentation | T3,T4 | `pages/TaskHistory/TaskView.tsx`, `TaskPickerSheet.tsx` | ⬜ |
| T8 | 月份选择器弹窗 | Presentation | T4 | `components/MonthPicker.tsx` | ⬜ |
| T9 | 统计摘要（完成率 + 积分） | Presentation | T3 | `pages/TaskHistory/StatsSummary.tsx` | ⬜ |

### 执行顺序

```
T1 → T2 → T3 (数据层)
T4 (月历组件，可与 T1-T3 并行)
T5 → T6 → T7 (页面)
T8, T9 (小组件，随时插入)
```
