# Grill Me: 商城系统功能设计

> 日期: 2026-09-04
> 参与者: 用户 + AI

---

## 决策汇总

| # | 决策项 | 结论 |
|---|---|---|
| Q1 | 管理角色 | 不区分角色，保持简单（家长和孩子共用） |
| Q2 | 兑换追踪 | **兑换 + 核销机制**：兑换后生成「待使用」券，确认后才算核销 |
| Q3 | 核销流程 | 简单确认：「待使用」→「已使用」 |
| Q4 | 券展示位置 | **独立「我的券」页面**，商城页顶部设入口跳转 |
| Q5 | 兑换次数限制 | **同一奖励同时只能有一张待使用券** |
| Q6 | 兑换成功交互 | 弹窗 + 「查看我的券」引导按钮 |
| Q7 | 核销操作 | 卡片上直接显示「已使用」按钮（一步操作） |
| Q8 | 已使用券处理 | **当天**已使用的券灰色展示在列表底部 + **全部兑换记录**功能 |
| Q9 | 兑换记录入口 | 「我的券」页面底部「查看全部记录」 |
| Q10 | 奖励分类 | **允许自定义分类** |
| Q11 | 自定义分类实现 | **自由输入 + 预设选项**；已创建的自定义分类自动出现在选项列表中 |
| Q12 | 商品排序 | 组内按积分从低到高排序 |
| Q13 | 商品图标 | 保持 emoji |
| Q14 | 首页展示 | **首页加待使用券卡片**（类似宠物迷你卡） |

---

## 核心功能拆解

### 1. 核销机制

**RewardLog 状态扩展:**
```
兑换 → 待使用(pending) → 已使用(used)
```

- `RewardLog` 新增 `status` 字段: `'pending' | 'used'`
- `RewardLog` 新增 `usedAt?: number` 字段
- 兑换时: 创建 log, status='pending'
- 核销时: log.status='used', usedAt=Date.now()

### 2. 页面结构

```
商城页 (Shop/index.tsx)
├── 顶部入口: "我的券 (N)" → 跳转 MyCoupons
├── 按分类展示奖励
│   └── 组内按积分从低到高排序
├── 编辑弹窗 (RewardEditModal)
├── 兑换确认 (RedeemConfirm)
└── 兑换成功 (RedeemSuccess) — 带「查看我的券」按钮

我的券页 (MyCoupons/index.tsx) — 新增
├── 待使用券列表 — 每张卡片带「已使用」按钮
├── 今日已使用券 — 灰色展示
└── 底部: "查看全部兑换记录" → 跳转 RedeemHistory

兑换记录页 (RedeemHistory/index.tsx) — 新增
└── 全部已兑换的 RewardLog 列表（按时间倒序）

首页 (Home/index.tsx)
└── 待使用券迷你卡 — 新增
```

### 3. 分类自定义

- `RewardEditModal` 分类字段改为 Combobox（下拉选择 + 自由输入）
- 预设分类: `['娱乐', '美食', '玩具', '特权', '其他']`
- 已有奖励的分类自动加入选项列表（去重）
- 新输入的分类值直接保存，下次创建奖励时自动出现

### 4. 兑换限制

- 兑换前检查: 该 rewardId 是否有 status='pending' 的 log
- 有 → 拒绝兑换，提示「还有一张未使用的券」
- 无 → 正常兑换

---

## 涉及文件预估

| 操作 | 文件 |
|---|---|
| 修改 | `RewardLog.ts` (status/usedAt), `RewardService.ts`, `useRewardStore.ts`, `Shop/index.tsx`, `RedeemSuccess.tsx`, `RewardEditModal.tsx`, `Home/index.tsx`, `TabBar.tsx` |
| 新增 | `MyCoupons/index.tsx`, `RedeemHistory/index.tsx`, `Home/CouponMiniCard.tsx` |
| 修改 | `IRewardRepository.ts`, `DexieRewardRepository.ts` (新查询方法), `constants.ts` (路由), `App.tsx` (路由注册) |

---

## 实施优先级

| 优先级 | 功能 |
|---|---|
| P1 | RewardLog 状态扩展 + 核销 Service |
| P1 | 「我的券」页面（待使用 + 核销按钮 + 今日已用） |
| P1 | 兑换限制（同一奖励只能一张待使用） |
| P1 | 商城顶部「我的券」入口 |
| P2 | 兑换成功弹窗引导 |
| P2 | 首页待使用券迷你卡 |
| P2 | 兑换记录页 |
| P2 | 分类自定义 |
| P2 | 商品排序（按积分低→高） |
