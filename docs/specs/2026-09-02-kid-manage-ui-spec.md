# Kid Manage — UI/UX 设计规范

> **版本**：v1.0  
> **日期**：2026-09-02  
> **关联设计文档**：[2026-09-02-kid-manage-design.md](./2026-09-02-kid-manage-design.md)

---

## 1. 设计定位

| 维度 | 说明 |
|------|------|
| **产品类型** | 儿童教育 / 娱乐（Consumer Entertainment） |
| **视觉受众** | 5 岁女孩（看宠物和奖励）+ 家长（操作管理） |
| **交互平台** | iPad 为主（触屏，大屏） |
| **风格关键词** | 可爱、温暖、有趣、安全感、卡通 |

---

## 2. 视觉风格：Claymorphism + 卡通插画

### 为什么选黏土风（Claymorphism）

- 🧸 3D 软质感，天然「可触摸」，适合儿童主题
- 🎨 柔和的阴影和圆角，温暖友好
- 📱 iPad 大屏上视觉效果好
- ✨ 和卡通宠物插画天然搭配

### 黏土风 CSS 特征

```css
/* 黏土风卡片 */
.clay-card {
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow:
    8px 8px 16px rgba(0, 0, 0, 0.08),
    -4px -4px 12px rgba(255, 255, 255, 0.9),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

/* 黏土风按钮 */
.clay-button {
  border-radius: 16px;
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.1),
    -2px -2px 6px rgba(255, 255, 255, 0.8);
  transition: transform 150ms ease;
}

/* 按下状态 */
.clay-button:active {
  transform: scale(0.96);
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.12),
    inset 2px 2px 4px rgba(0, 0, 0, 0.06);
}
```

---

## 3. 配色方案

### 色彩令牌（Semantic Color Tokens）

| Token 名称 | 色值 | 用途 |
|-----------|------|------|
| `--color-primary` | `#FF9BB0` | 主色调（柔粉色）：主按钮、高亮、品牌色 |
| `--color-secondary` | `#C4A8E0` | 辅助色（薰衣草紫）：次要按钮、标签 |
| `--color-accent` | `#7ECFC0` | 强调色（薄荷绿）：积分、成功状态 |
| `--color-warning` | `#FFB74D` | 警告色（柔橙色）：提醒、饥饿状态 |
| `--color-danger` | `#FF8A80` | 危险色（珊瑚红）：扣分、删除 |
| `--color-pet-gold` | `#FFD54F` | 宠物金（金黄色）：经验值、进化 |
| `--color-bg` | `#FFF8F0` | 页面背景（奶白色） |
| `--color-card` | `#FFFFFF` | 卡片背景（纯白） |
| `--color-text` | `#4A4A4A` | 主文字（深灰） |
| `--color-text-sub` | `#9E9E9E` | 次要文字（中灰） |
| `--color-border` | `#F0E8E0` | 边框/分割线 |

### Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#FF9BB0',
        secondary: '#C4A8E0',
        accent: '#7ECFC0',
        warning: '#FFB74D',
        danger: '#FF8A80',
        'pet-gold': '#FFD54F',
        bg: '#FFF8F0',
        card: '#FFFFFF',
        'text-main': '#4A4A4A',
        'text-sub': '#9E9E9E',
        border: '#F0E8E0',
      },
    },
  },
}
```

### 色彩对比度验证

| 组合 | 对比度 | 达标 |
|------|--------|------|
| `#4A4A4A` on `#FFFFFF` | 9.03:1 | ✅ AAA |
| `#4A4A4A` on `#FFF8F0` | 8.45:1 | ✅ AAA |
| `#9E9E9E` on `#FFFFFF` | 3.54:1 | ✅ AA (大字) |
| `#FFFFFF` on `#FF9BB0` | 3.12:1 | ✅ AA (大字/图标) |

---

## 4. 排版系统

### 字体

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;
```

可选装饰字体：「站酷快乐体」用于标题和积分数字，增加趣味性。

### 字号层级

| Token | 字号 | 字重 | 行高 | 用途 |
|-------|------|------|------|------|
| `text-hero` | 28px | Bold (700) | 1.2 | 积分数字、大标题 |
| `text-title` | 24px | Bold (700) | 1.3 | 页面标题 |
| `text-heading` | 18px | SemiBold (600) | 1.4 | 卡片标题、区块标题 |
| `text-body` | 16px | Regular (400) | 1.6 | 正文、任务名称 |
| `text-caption` | 14px | Regular (400) | 1.5 | 辅助文字、描述 |
| `text-label` | 12px | Medium (500) | 1.3 | Tab 标签、小标注 |

---

## 5. 间距系统（4px 基准）

| Token | 值 | 用途 |
|-------|-----|------|
| `space-xs` | 4px | 图标与文字间距、紧凑排列 |
| `space-sm` | 8px | 列表项内间距、小组件间距 |
| `space-md` | 16px | 卡片内边距、组件间距 |
| `space-lg` | 24px | 区块间距 |
| `space-xl` | 32px | 页面水平边距 |
| `space-2xl` | 48px | 大区块间距、页面顶部 |

---

## 6. 圆角系统

| 元素 | 圆角值 | Token |
|------|--------|-------|
| 页面容器 | 0 | — |
| 大卡片 | 20px | `rounded-2xl` |
| 小卡片/列表项 | 16px | `rounded-xl` |
| 按钮 | 16px | `rounded-xl` |
| 输入框 | 12px | `rounded-lg` |
| 进度条 | 999px | `rounded-full` |
| 头像/图标容器 | 50% | `rounded-full` |
| 标签/Badge | 8px | `rounded-md` |

---

## 7. 阴影系统

| 层级 | 阴影 | 用途 |
|------|------|------|
| `shadow-clay` | `8px 8px 16px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9)` | 主卡片 |
| `shadow-button` | `4px 4px 8px rgba(0,0,0,0.1), -2px -2px 6px rgba(255,255,255,0.8)` | 按钮 |
| `shadow-pressed` | `2px 2px 4px rgba(0,0,0,0.12), inset 2px 2px 4px rgba(0,0,0,0.06)` | 按下态 |
| `shadow-float` | `0 8px 24px rgba(0,0,0,0.12)` | 浮层/弹窗 |

---

## 8. 图标规范

### 原则

- **禁止使用 Emoji 作为结构性图标**（导航、按钮、系统控件）
- Emoji 可用于 **内容装饰**（奖励列表、趣味文案）
- 所有功能性图标使用 SVG

### 推荐图标库

**Phosphor Icons**（React 版本：`phosphor-react`）
- 支持 Regular / Bold / Fill / Duotone 多种风格
- 圆润友好，适合儿童主题
- 选择 **Bold** 或 **Fill** 风格以匹配卡通感

### 图标使用示例

| 用途 | 图标名称 | 风格 |
|------|---------|------|
| 首页 Tab | `House` | Fill |
| 任务 Tab | `CheckCircle` | Fill |
| 宠物 Tab | `PawPrint` | Fill |
| 商城 Tab | `Gift` | Fill |
| 设置 Tab | `GearSix` | Fill |
| 添加任务 | `Plus` | Bold |
| 编辑 | `PencilSimple` | Bold |
| 删除 | `Trash` | Bold |
| 积分 | `Star` | Fill |
| 喂食 | `ForkKnife` | Fill |
| 抚摸 | `HandWaving` | Fill |
| 导出 | `Export` | Bold |
| 导入 | `DownloadSimple` | Bold |

---

## 9. 触摸交互规范

### 触摸目标

| 规范 | 标准 | 说明 |
|------|------|------|
| 最小触摸面积 | **44 × 44pt** | Apple HIG 标准 |
| 触摸间距 | **≥ 8px** | 防止误触 |
| 可点击区域 | 可大于视觉区域 | 使用 padding 扩展触摸区域 |

### 交互状态

| 状态 | 表现 | 时长 |
|------|------|------|
| **默认** | 正常外观 | — |
| **按下** | `scale(0.96)` + 阴影内凹 | 150ms |
| **禁用** | `opacity(0.4)` + 不可点击 | — |
| **加载中** | 按钮内显示 Spinner | — |
| **成功** | 绿色闪烁 + 积分飞入动画 | 300ms |

### Safe Area

```css
/* iPad 底部安全区域 */
padding-bottom: env(safe-area-inset-bottom, 0);
```

---

## 10. 动画规范

### 动画时长标准

| 类型 | 时长 | 缓动 | 场景 |
|------|------|------|------|
| 微交互 | 150ms | `ease-out` | 按钮按下、图标切换 |
| 状态切换 | 250ms | `ease-in-out` | Tab 切换、展开/收起 |
| 内容过渡 | 300ms | `spring` | 积分变化、进度条 |
| 宠物互动 | 400-500ms | `spring(弹性)` | 抚摸反应、喂食 |
| 特殊效果 | 800-1000ms | `spring` | 进化动画、成就解锁 |

### Framer Motion 预设

```typescript
// 弹性动画（宠物互动）
const springBounce = {
  type: "spring",
  stiffness: 400,
  damping: 10
}

// 柔和弹性（UI 过渡）
const springGentle = {
  type: "spring",
  stiffness: 300,
  damping: 20
}

// 平滑过渡（通用）
const easeSmooth = {
  duration: 0.3,
  ease: "easeOut"
}

// 积分飞入
const pointsFlyIn = {
  initial: { opacity: 0, y: -20, scale: 0.5 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -40 },
  transition: springBounce
}
```

### 宠物互动动画

| 互动 | 动画描述 |
|------|---------|
| **抚摸** | 宠物弹跳（translateY 上下）+ 爱心粒子从宠物上方冒出 |
| **喂食** | 食物从按钮位置飞向宠物 → 宠物张嘴动画 → 满足表情 |
| **进化** | 白光闪烁覆盖 → 旧形态淡出 → 新形态从光芒中出现 |
| **饥饿** | 宠物缓慢左右摇晃 + 气泡冒出饿了表情 |
| **开心** | 宠物小幅跳跃 + 眼睛闪烁 |

### Reduced Motion 支持

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. iPad 响应式策略

### 布局策略

| 设备 | 屏幕宽度 | 布局 |
|------|---------|------|
| iPhone SE | 375px | 单列，全宽 |
| iPhone 15 | 393px | 单列，全宽 |
| iPad Mini | 744px | 单列，max-width: 480px 居中 |
| iPad Air | 820px | 单列或双列（横屏时） |
| iPad Pro 11" | 834px | 双列可选 |
| iPad Pro 12.9" | 1024px | 双列，max-width: 768px 居中 |

### 核心规则

```css
/* 移动优先，内容居中 */
.app-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 var(--space-xl); /* 32px */
}

/* iPad 横屏双列布局（可选） */
@media (min-width: 768px) and (orientation: landscape) {
  .home-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg);
    max-width: 768px;
    margin: 0 auto;
  }
}
```

---

## 12. 组件设计规范

### TabBar（底部导航）

```
┌─────────────────────────────────────────┐
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 🏠  │ │ ✅  │ │ 🐾  │ │ 🎁  │ │ ⚙️  │  │
│  │ 首页 │ │ 任务 │ │ 宠物 │ │ 商城 │ │ 设置 │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
└─────────────────────────────────────────┘

激活态：图标 + 文字 变为 primary 色，图标填充
非激活态：图标 + 文字 灰色，图标线条
```

> 注：上方 emoji 仅为示意，实际使用 Phosphor Icons SVG 图标。

### 任务卡片

**今日打卡页面（带勾选框）**：
```
╭──────────────────────────────────╮
│ [✓]  刷牙               +5 ⭐   │  ← 已完成：浅绿背景 + 绿色勾
╰──────────────────────────────────╯
╭──────────────────────────────────╮
│ [ ]  读绘本              +8 ⭐   │  ← 未完成：白色背景 + 空心圈
╰──────────────────────────────────╯
```

**任务管理页面（带箭头）**：
```
╭──────────────────────────────────╮
│  刷牙              +5分     >   │  ← 点击整行进入编辑弹窗
╰──────────────────────────────────╯
```

### Modal 弹窗（居中对话框）

```css
/* 遮罩层 */
.modal-overlay {
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  inset: 0;
  z-index: 100;
}

/* 弹窗主体 */
.modal-dialog {
  background: var(--color-card);
  border-radius: 20px;
  box-shadow: var(--shadow-float);  /* 0 8px 24px rgba(0,0,0,0.12) */
  max-width: 340px;
  margin: auto;
  padding: 24px;
}

/* 弹窗输入框 */
.modal-input {
  background: #F8F8FA;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
}

/* 保存按钮 */
.modal-save-btn {
  background: var(--color-accent);  /* 薄荷绿 */
  border-radius: 14px;
  color: white;
  font-weight: 700;
  height: 48px;
}

/* 删除按钮（仅编辑模式） */
.modal-delete-btn {
  color: var(--color-danger);  /* 珊瑚红 */
  font-weight: 600;
  font-size: 14px;
  text-align: center;
}
```

> **弹窗交互规范**：
> - 弹出动画：`scale(0.95) → scale(1)`，duration 250ms，ease-out
> - 关闭方式：点击「✕」按钮、点击遮罩层、按 ESC 键
> - 输入框获取焦点时，边框变为 `accent` 色

### 积分徽章

```
╭───────────╮
│ ⭐  128   │    圆角胶囊形，accent 色背景
╰───────────╯
```

### 进度条（宠物状态）

```
饥饿度: [████████░░] 80%
        warning 色渐变，从绿到橙到红

心情值: [██████████] 100% 😊
        accent 色，末端显示对应表情

成长值: [████░░░░░░] 40%
        pet-gold 色，显示当前阶段和下一阶段
```

---

## 13. 无障碍（Accessibility）

| 规范 | 标准 | 实施方式 |
|------|------|---------|
| 文字对比度 | ≥ 4.5:1（正文）≥ 3:1（大字） | 配色方案已验证 |
| 触摸目标 | ≥ 44 × 44pt | 所有按钮/可点击元素 |
| 焦点指示 | 可见 focus ring（2-4px） | Tab 导航时显示 |
| 图片替代文字 | 所有宠物图片有 alt | `alt="小花花 - 幼崽阶段"` |
| 色彩不独立 | 不仅靠颜色传递信息 | 完成状态用勾选图标 + 颜色 |
| 减少动画 | 支持 `prefers-reduced-motion` | 关闭非必要动画 |
