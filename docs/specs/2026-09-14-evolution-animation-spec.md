# 分阶段进化动画实施规范

> **版本**：v1.1  
> **日期**：2026-09-14  
> **状态**：已实施  
> **决策记录**：[grill-me-2026-09-14-evolution-animation.md](../grill-me-2026-09-14-evolution-animation.md)  
> **壳图 Prompt**：[2026-09-14-pet-evolution-shard-prompts.md](./2026-09-14-pet-evolution-shard-prompts.md)

---

## 1. 范围

只改宠物页进化演出。不改喂食/进化判定、不改首页迷你卡、不加音效、不加文案。

触发仍是：养成宠喂食达标 → `evolve()` → 宠物页播放对应段动画。

---

## 2. 四段合约

| kind | 阶段 | 时长 | 遮罩色 | 揭晓新形态 |
|------|------|------|--------|------------|
| `hatch` | 蛋 → 刚孵化 | 2500ms | 暖白 | 0.85s |
| `glow` | 刚孵化 → 成长期 | 2000ms | 白 | 0.70s |
| `ascend` | 成长期 → 成熟期 | 2500ms | 金 | 0.90s |
| `legend` | 成熟期 → 满级 | 3000ms | 金紫 | 0.70s |

由 `prevStage` + 新 `stage` 推导 kind。小鸡 / 小兔时间轴相同。

粒子色：小鸡金粉（✨⭐🌟💛），小兔薰衣草（💜✨🌸💫）。

---

## 3. 分镜

## 3. 分镜

**hatch**：旧图抖动 → 裂纹 → 三片壳飞出 + 彩色碎纸 → 新形态从小弹出。

**glow**：白光从中心扩开裹住旧形态 → 光散 → 交叉淡入新形态 + 星星。

**ascend**：光柱升起 + 旧形态旋转 → 新形态淡入 → 头顶皇冠（鸡）/ 花（兔）放大后淡出（角色 PNG 已含配饰，图标只做节拍）。

**legend**：金色爆发 → 脚下彩虹弧 → 新形态放大落下 + 更密星星。

动画期间禁止抚摸；遮罩拦截整屏点击（含 Tab），**点击不提前结束**。

### 3.1 孵化壳图

`EvolutionFx.tsx` 里的 `SHELL_SHARD_IMAGES` 写明每种宠物用哪三张图。名册里有的宠物走 PNG，没有的走几何色块，时间轴不变。

| 宠物 | 状态 | 文件 |
|------|------|------|
| 小兔 | 已接入 | `public/pets/rabbit/evo-shell-left.png` / `right` / `top` |
| 小鸡 | 未到，几何占位 | 出图后放到 `public/pets/chicken/evo-shell-{left,right,top}.png`，并在 `SHELL_SHARD_IMAGES` 增加 `chicken` 三条路径 |

小兔图带透明边，显示边长约 `168 × sizeScale`，避免碎片显得过小。

小鸡素材 Prompt 仍见壳碎片文档。不要改回「先加载 left 图成不成功再决定用不用图」：漏一张时不会整套误开或误关，接入时必须三张一起登记。

---

## 4. 文件

| 文件 | 职责 |
|------|------|
| `evolutionTransition.ts` | kind / 时长 / 揭晓延迟 / 遮罩色 / 粒子色 |
| `EvolutionFx.tsx` | 四段附加层；`SHELL_SHARD_IMAGES` 登记壳图 |
| `PetDisplay.tsx` | 按 kind 换图（抖动 / 弹出 / 旋转 / 爆发） |
| `EvolutionOverlay.tsx` | 按段 vignette + 按时长 `onDone` |
