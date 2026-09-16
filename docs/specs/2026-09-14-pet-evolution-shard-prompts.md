# 进化壳碎片出图 Prompt

> **日期**：2026-09-14  
> **用途**：ChatGPT 出图，供「蛋 → 刚孵化」碎壳动画  
> **接入**：壳路径由该种类 `IPetTypeStrategy.shellImages()` 提供（基类按 `pets/<type>/evo-shell-*.png` 约定生成）。新增宠物时实现策略并登记到 `petTypeRegistry.ts`；只放文件、不注册策略，会走兜底策略、不播壳片。  
> **进度**：小鸡、小兔、小猫、小狗各 3 张均已接入。  
> **参考图**：先上传现有蛋图，再贴对应 Prompt  
> - 小鸡：`public/pets/chicken/stage-1-egg.png`  
> - 小兔：`public/pets/rabbit/stage-1-egg.png`  
> - 小猫：`public/pets/cat/stage-1-egg.png`  
> - 小狗：`public/pets/dog/stage-1-egg.png`

每种宠物 **3 片**（左 / 右 / 顶）。只要蛋壳碎片，不要鸟巢、草地、花瓣垫、云座、整颗蛋、动物。

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

> **已接入**。路径：`public/pets/chicken/evo-shell-{left,right,top}.png`，由 `ChickenPetTypeStrategy.shellImages()` 提供。

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

## 小猫 🐱

> **已接入**。路径：`public/pets/cat/evo-shell-{left,right,top}.png`。

花纹：奶油白底 + 金色圆点 + 粉色爱心。顶片只要蛋尖约 20%，不要半个空壳。

**左片** → `public/pets/cat/evo-shell-left.png`

```
A LEFT eggshell shard from that cream egg with gold polka dots and pink hearts. Roughly 1/3 of the shell, curved like the left side of an oval, broken jagged inner edge on the right. Gold dots and a partial pink heart on the outer surface. Soft clay thickness.
```

**右片** → `public/pets/cat/evo-shell-right.png`

```
A RIGHT eggshell shard from that cream egg with gold polka dots and pink hearts. Roughly 1/3 of the shell, curved like the right side of an oval, broken jagged inner edge on the left. Gold dots on the outer surface. Soft clay thickness. Do not copy the left shard; this is a different piece.
```

**顶片** → `public/pets/cat/evo-shell-top.png`

```
A tiny pointed TOP APEX only, about the top 20% of that cream-gold polka-dot heart egg. Small shallow lid, lots of empty space around it, broken jagged rim facing downward. Not a half-egg, not a helmet.
```

---

## 小狗 🐶

> **已接入**。路径：`public/pets/dog/evo-shell-{left,right,top}.png`。

花纹：天蓝底 + 白云 + 金色小星星。顶片只要蛋尖约 20%，不要半个空壳。

**左片** → `public/pets/dog/evo-shell-left.png`

```
A LEFT eggshell shard from that sky-blue egg with white clouds and stars. Roughly 1/3 of the shell, curved like the left side of an oval, broken jagged inner edge on the right. White clouds and stars on the outer surface. Soft clay thickness.
```

**右片** → `public/pets/dog/evo-shell-right.png`

```
A RIGHT eggshell shard from that sky-blue cloud-and-star egg. Roughly 1/3 of the shell, curved like the right side of an oval, broken jagged inner edge on the left. Clouds or stars on the outer surface. Soft clay thickness. Do not copy the left shard.
```

**顶片** → `public/pets/dog/evo-shell-top.png`

```
A tiny pointed TOP APEX only, about the top 20% of that sky-blue cloud egg. Small shallow lid, lots of empty space around it, broken jagged rim facing downward. Not a half-egg, not a helmet.
```

---

## 导出

- 透明 PNG，正方形，碎片居中
- 单片大约占画面 40%–60%，不要太小
- 2x 即可（512–1024）
- 若 ChatGPT 给了白底，自己抠透明后再放进上述路径
- 接入时实现该种类策略并登记到 `petTypeRegistry.ts`。只放文件、不注册策略，孵化走兜底、不播壳片。
