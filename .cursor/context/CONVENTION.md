# CONVENTION.md — 编码约定

> 最后更新：2026-09-08
> 维护方式：人工维护

## 文件组织约定

| 类型 | 位置 | 命名风格 |
|------|------|---------|
| 页面目录 | `src/presentation/pages/<PageName>/` | **PascalCase** 目录 |
| 页面入口 | `<PageName>/index.tsx` | `index.tsx` |
| 页面子组件 | `<PageName>/XxxComponent.tsx` | **PascalCase** |
| 布局组件 | `src/presentation/layouts/` | **PascalCase** |
| Zustand Store | `src/presentation/hooks/use<Name>Store.ts` | `use` 前缀 + **camelCase** |
| Domain Model | `src/domain/models/<Name>.ts` | **PascalCase** |
| Domain Rule | `src/domain/rules/<Name>Rule.ts` | **PascalCase** + `Rule` 后缀 |
| Value Object | `src/domain/valueObjects/<Name>.ts` | **PascalCase** |
| Repository 接口 | `src/domain/repositories/I<Name>Repository.ts` | `I` 前缀 + **PascalCase** |
| Repository 实现 | `src/infrastructure/database/repositories/Dexie<Name>Repository.ts` | `Dexie` 前缀 |
| Service | `src/application/services/<Name>Service.ts` | **PascalCase** + `Service` 后缀 |
| 共享常量 | `src/shared/constants.ts` | 小写文件名 |
| DI 容器 | `src/shared/container.ts` | 小写文件名 |

> 未使用 kebab-case 文件命名。

---

## 命名约定

### 变量 / 函数

| 场景 | 风格 | 示例 |
|------|------|------|
| 局部变量 | camelCase | `todayStart`, `redeemTarget` |
| React 状态 | camelCase | `loading`, `editVisible` |
| 事件处理 | `handle` 前缀 | `handleToggle`, `handleSave`, `handleRedeemClick` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_CHILD_ID`, `REWARD_CATEGORIES`, `ROUTES` |
| Domain Model 常量 | UPPER_SNAKE_CASE | `INITIAL_MOOD`, `FEED_POINT_COST` |

### 类型 / 接口

| 场景 | 风格 | 示例 |
|------|------|------|
| 组件 Props | `<Component>Props` | `RewardCardProps`, `SettingsRowProps` |
| Repository 接口 | `I<Name>Repository` | `ITaskRepository` |
| Dexie Record | `<Name>Record` | `TaskRecord`, `PetRecord` |

---

## 组件编写约定

### 声明方式

```tsx
// ✅ 标准：函数声明 + default export
export default function HomePage() {
  return <div>...</div>
}

// ✅ 性能优化：memo 包裹
export default memo(function RewardCard({ reward, canAfford, onRedeem, onEdit }: RewardCardProps) {
  return <div>...</div>
})
```

> **禁止**箭头函数组件 `const X = () => ...`

### 导出方式

| 层级 | 导出方式 |
|------|---------|
| React 组件 / 页面 | `export default` |
| Zustand Store | `export const useXxxStore` |
| Domain class | `export class Xxx` |
| Domain 函数 / 常量 | `export function xxx` / `export const XXX` |
| Props 接口 | **不导出**（仅组件内部使用） |

---

## Service 编写约定

```typescript
export class XxxService {
  constructor(
    private xxxRepo: IXxxRepository,
    private pointService: PointService,  // 可注入其他 Service
  ) {}

  async methodName(): Promise<ReturnType> {
    // 业务编排逻辑
  }
}
```

- Service class 通过构造函数接收 Repository 接口（DI）
- Service 方法均为 `async`
- 不直接操作 Infrastructure 层实现

---

## Store 编写约定

```typescript
export const useXxxStore = create<XxxState>((set) => ({
  // state
  items: [],
  loading: false,

  // actions
  fetchItems: async () => {
    set({ loading: true })
    const items = await xxxService.getAll()
    set({ items, loading: false })
  },
}))
```

- 一个 Store 对应一个业务域
- Store 内部直接 import Service 单例
- `set()` 更新状态

---

## 样式约定

### 当前模式（三种并存）

| 优先级 | 方式 | 用途 |
|--------|------|------|
| 1 | Tailwind utility class | 布局（flex/grid）、颜色（text-text-main）、字体（font-bold） |
| 2 | inline `style` 属性 | 精确数值（padding、gap、marginBottom）、Safe Area |
| 3 | CSS 变量 | 响应式容器宽度（--app-max-width）、Safe Area（--safe-top） |

### 表单元素

Tailwind v4 Preflight 会重置表单样式。**表单元素必须使用 inline style**：

```tsx
// ✅ 正确：inline style 防止 Preflight 重置
<input style={{ padding: '10px 14px', fontSize: '15px', border: '1.5px solid #E8E0D8' }} />

// ❌ 错误：Tailwind class 会被 Preflight 覆盖
<input className="p-2 text-sm border" />
```

### 颜色 Token

统一使用 `@theme` 定义的 token（见 `src/index.css`）：

| Token Class | 用途 |
|------------|------|
| `text-text-main` | 主文字 #4A4A4A |
| `text-text-sub` | 次文字 #757575 |
| `text-accent` | 强调色 #7ECFC0 |
| `bg-card` | 卡片背景 #FFFFFF |
| `bg-bg` | 页面背景 #FFF8F0 |
| `shadow-clay` | Claymorphism 阴影 |

---

## Import 约定

### 分组顺序

```typescript
// ① React / react-router-dom
import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// ② 第三方库
import { Star, Plus } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

// ③ 内部模块（@/ 别名，按层级排列）
import { useTaskStore } from '@/presentation/hooks/useTaskStore'    // hooks
import { TaskType } from '@/domain/valueObjects/TaskType'           // domain
import { ROUTES } from '@/shared/constants'                         // shared

// ④ 相对路径（同级子组件）
import TaskEditModal from './TaskEditModal'
```

### 其他

| 约定 | 说明 |
|------|------|
| 类型导入 | `import type { X }` |
| 引号 | 单引号 `'` |
| 分号 | 无分号 |
| 缩进 | 2 空格 |

---

## 错误反馈约定

### Toast 使用

使用全局命令式 Toast API（`@/shared/toast`），禁止页面内自建 Toast 状态：

```typescript
import { toast } from '@/shared/toast'

// ✅ 正确：命令式调用
toast.success('操作成功')
toast.error('操作失败，请重试')

// ❌ 错误：页面内自建 toast state
const [showToast, setShowToast] = useState(false)
```

### 并发竞态防护

mutation 操作（打卡/喂食/兑换等）须使用 `useRef` 同步锁 + `useState` UI 双重机制：

```typescript
const processingRef = useRef(false)
const [processing, setProcessing] = useState(false)

const handleAction = async () => {
  if (processingRef.current) return
  processingRef.current = true
  setProcessing(true)
  try {
    await service.doAction()
  } finally {
    processingRef.current = false
    setProcessing(false)
  }
}
```

---

## Git 约定

- 未配置 ESLint / Prettier / EditorConfig
- 代码风格依赖 TypeScript strict 模式
- **禁止 AI 自行提交代码**，须用户明确指令后才可提交
