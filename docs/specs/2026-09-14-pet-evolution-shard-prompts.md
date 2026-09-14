# 进化壳碎片出图 Prompt

> **日期**：2026-09-14  
> **用途**：ChatGPT 出图，供「蛋 → 刚孵化」碎壳动画  
> **接入**：图放进对应路径后，还要在 `src/presentation/pages/Pet/EvolutionFx.tsx` 的 `SHELL_SHARD_IMAGES` 里登记，动画才会用 PNG（不会自动探测文件）。  
> **进度**：小兔 3 张已接入；小鸡 3 张未出。  
> **参考图**：先上传现有蛋图，再贴对应 Prompt  
> - 小鸡：`public/pets/chicken/stage-1-egg.png`  
> - 小兔：`public/pets/rabbit/stage-1-egg.png`

每种宠物 **3 片**（左 / 右 / 顶），共 6 张。只要蛋壳碎片，不要鸟巢、草地、花瓣垫、整颗蛋、动物。

---

## 固定指令（每条都带上）

```
Use the uploaded egg image as the exact texture and color reference.
3D kawaii clay/plush style, same gloss, same pastel colors, same pattern scale.
Output ONE single eggshell shard only, isolated, slightly thick clay edge with a soft inner white-gold break surface (like a candy shell).
No nest, no grass, no flowers, no full egg, no animal, no face, no text, no watermark.
Square 1:1, shard centered, clean transparent background (or pure white if transparency is not possible).
```

---

## 小鸡 🐔

> **未接入**。出图后按路径保存，并登记到 `SHELL_SHARD_IMAGES.chicken`。

花纹：粉白底 + 金色圆点 + 粉色爱心。断面：浅金/奶白，像糖果壳。

**左片** → `public/pets/chicken/evo-shell-left.png`

```
A LEFT eggshell shard from that pink-gold polka-dot egg. Roughly 1/3 of the shell, curved like the left side of an oval, broken jagged inner edge on the right. Gold dots and a partial pink heart on the outer surface. Soft clay thickness.
```

**右片** → `public/pets/chicken/evo-shell-right.png`

```
A RIGHT eggshell shard from that pink-gold polka-dot egg. Roughly 1/3 of the shell, curved like the right side of an oval, broken jagged inner edge on the left. Gold dots on the outer surface. Soft clay thickness. Do not copy the left shard; this is a different piece.
```

**顶片** → `public/pets/chicken/evo-shell-top.png`

```
A TOP eggshell cap from that pink-gold polka-dot egg. Smaller than the side pieces, like a hat-shaped fragment, broken rim facing downward. Gold dots and a bit of pink heart near the top. Soft clay thickness.
```

---

## 小兔 🐰

> **已接入**，不必重出。路径如下，供对照。

花纹：薰衣草底 + 白星星 + 月亮 + 粉点。顶片带紫色蝴蝶结。

**左片** → `public/pets/rabbit/evo-shell-left.png`

```
A LEFT eggshell shard from that lavender star-and-moon egg. Roughly 1/3 of the shell, curved left side of an oval, broken jagged inner edge on the right. White stars and pink dots on the outer surface. Soft clay thickness.
```

**右片** → `public/pets/rabbit/evo-shell-right.png`

```
A RIGHT eggshell shard from that lavender star-and-moon egg. Roughly 1/3 of the shell, curved right side of an oval, broken jagged inner edge on the left. Crescent moon or stars on the outer surface. Soft clay thickness. Do not copy the left shard.
```

**顶片** → `public/pets/rabbit/evo-shell-top.png`

```
A TOP eggshell cap from that lavender egg, including the small purple bow with the gold heart (the bow sits on this cap). Smaller hat-shaped fragment, broken rim facing downward. Stars on the shell. Soft clay thickness.
```

---

## 导出

- 透明 PNG，正方形，碎片居中
- 单片大约占画面 40%–60%，不要太小
- 2x 即可（512–1024）
- 若 ChatGPT 给了白底，自己抠透明后再放进上述路径
- 小鸡图齐后：把三张放进 `public/pets/chicken/`，并在 `SHELL_SHARD_IMAGES` 增加 `chicken`（left / right / top）。只放文件、不改名册，孵化仍走占位。
