# 宠物四表情出图 Prompt

> **日期**：2026-09-14  
> **用途**：用 ChatGPT 出图（Images / DALL·E）  
> **配套规范**：[宠物进化设计规范](./2026-09-02-pet-design-spec.md) §4 表情系统  
> **风格来源**：现有 `public/pets/` 成图（3D 粘土 / Claymorphism Q 版），不是扁平插画

每个阶段 4 张表情。小鸡 + 小兔 × 5 阶段 = **40 张**。  
其中 10 张「普通」已有主图，可直接复用；需要新出的是 **开心 / 难过 / 饥饿**，共 30 张。

---

## 1. ChatGPT 怎么用

推荐流程（一致性最好）：

1. 新开一轮对话，**先上传该阶段现有 PNG**（见下方「参考图」路径）。
2. 复制 **§2 固定指令** + 该条表情的英文 Prompt，一次只出 **1 张**。
3. 不满意就回：「Keep the uploaded character 100%. Only change the face.」再出一张。
4. 换阶段时重新上传新的参考图，不要混用上一阶段的图。
5. 导出：正方形、透明底（若给了白底，自己抠）。文件名按 §6。

出图设置：

- 比例 **1:1**
- 主体居中，四周留白
- 不要写字、水印、边框、真实照片感

---

## 2. 固定指令（每条都带上）

先贴这一段，再贴具体表情。

```
Use the uploaded image as the exact character reference.
Keep the SAME 3D kawaii clay/plush style, same body shape, same outfit, same accessories, same colors, same pose, same composition, same sparkles around the character.
Only change the facial expression and tiny extra details described below.
Do NOT add new clothes, do NOT change the species, do NOT make it realistic, dark, scary, or sharp-edged.
Square 1:1, character centered, clean transparent background (or pure white if transparency is not possible), no text, no watermark, no extra characters.
Soft pastel children's mobile game character for a 5-year-old girl.
```

无参考图时，把对应阶段的「角色锁定」整段一并贴上。

---

## 3. 四种表情怎么演

只改 **眼睛 + 嘴巴 + 腮红 + 少量粒子**。身体、衣服、配饰、体型、构图锁定。

面向 5 岁女孩：难过不要嚎哭，饥饿不要恶心。

| 表情 | 文件后缀 | 演法 | 产品对应 |
|------|----------|------|----------|
| 😐 普通 | 无后缀（现有主图） | 圆眼、双高光、轻轻微笑或微张嘴 | 心情 30–70 |
| 😊 开心 | `-happy` | 眯眼弯月笑、腮红更红、嘴角上扬；可轻微跳起；多 2–3 颗爱心/星星 | 心情 > 70 |
| 😢 难过 | `-sad` | 眉梢下垂、嘴角微撇、眼角 **一滴** 晶莹泪光；粒子变少；不要大哭、不要发黑 | 心情 < 30 |
| 🍽️ 饥饿 | `-hungry` | 眼神看向画面一侧的 **小小食物**；嘴边 **一颗** 可爱口水珠；肚子上 2–3 条软软的饥饿弧线；食物要极小，不抢角色 | 预留（饥饿系统尚未接回） |

蛋没有五官：用裂纹、光、倾斜、粒子表达，**不要在蛋上画人脸**。

---

## 4. 小鸡 🐔

主色：暖黄身体、粉色腮红、橙色喙和脚。性格：圆润、元气、爱撒娇。

### 4.1 阶段 1 · 神秘蛋

参考图：`public/pets/chicken/stage-1-egg.png`  
文件：`stage-1-egg[-happy|-sad|-hungry].png`

**角色锁定**

```
A glossy pastel egg sitting in a tiny golden straw nest on a small lime-green grassy patch with two tiny flowers (pink and white). The egg is cream-pink with round golden-yellow polka dots and two pink hearts (one large in the center, one smaller to the left). Soft highlight on the upper left. A glowing golden crack at the bottom of the shell. A few yellow stars floating around. 3D kawaii clay style, centered, square.
```

**😐 普通** — 复用现有 `stage-1-egg.png`，不必重出。

**😊 开心** → `stage-1-egg-happy.png`

```
Same egg and nest. Happier mood: the golden crack glows brighter and warmer, the egg tilts slightly as if bouncing, more sparkles and tiny pink hearts floating, shell looks extra shiny and delighted. Still NO face on the egg.
```

**😢 难过** → `stage-1-egg-sad.png`

```
Same egg and nest. Sad mood: egg tilts a little downward, crack glow is dimmer and cooler, fewer stars, one tiny teardrop-shaped sparkle falling from the shell, overall still cute and pastel, not gloomy or broken.
```

**🍽️ 饥饿** → `stage-1-egg-hungry.png`

```
Same egg and nest. Hungry mood: egg leans slightly toward a very tiny kawaii cookie or corn kernel sitting at the edge of the nest (small, not covering the egg). Soft wobble/shiver lines beside the egg. The crack looks a bit like a tiny hungry mouth of light. One tiny cute drool sparkle near the crack. Still NO face on the egg.
```

---

### 4.2 阶段 2 · 刚孵化

参考图：`public/pets/chicken/stage-2-hatched.png`  
文件：`stage-2-hatched[-happy|-sad|-hungry].png`

**角色锁定**

```
A super round chibi baby chick, almost a yellow sphere. Warm yellow body, tiny stubby wings, orange two-toed feet. Pink bow on top. Broken white eggshell pieces on the head like a cap. Huge glossy dark eyes with two white highlights, round pink blush, small orange triangular beak. Floating yellow stars and pink dots. 3D kawaii clay/plush, front-facing, centered.
```

**😐 普通** — 复用现有主图（圆眼、小嘴微张）。

**😊 开心** → `stage-2-hatched-happy.png`

```
Same baby chick. Happy: crescent closed-happy eyes (^_^), bigger smile with the orange beak open happily, blush brighter and rounder, body slightly bouncing upward, extra tiny pink hearts around the head. Keep the pink bow, eggshell cap, and feet unchanged.
```

**😢 难过** → `stage-2-hatched-sad.png`

```
Same baby chick. Sad: eyebrows droop, eyes still big and round but with a small watery shine and ONE tiny teardrop at the corner, beak closed in a small downturned shape, blush paler, fewer sparkles. Cute, not crying hard.
```

**🍽️ 饥饿** → `stage-2-hatched-hungry.png`

```
Same baby chick. Hungry: eyes glance to the side at a very tiny kawaii cookie or corn kernel, beak slightly open, ONE small cute drool droplet at the beak, 2–3 soft round hunger lines on the tummy. Keep bow and eggshell unchanged. Food must be tiny.
```

---

### 4.3 阶段 3 · 成长期

参考图：`public/pets/chicken/stage-3-growing.png`  
文件：`stage-3-growing[-happy|-sad|-hungry].png`

**角色锁定**

```
A growing kawaii chick, still chibi, standing, wings spread a little. Warm yellow body, visible feathered wings. Big pink bow on the head with a heart-shaped gem in the center. Pink scarf with heart prints tied around the neck. Round pink blush, small eyelashes, orange beak and orange feet. Yellow stars and a pink heart floating. 3D kawaii clay style, centered.
```

**😐 普通** — 复用现有主图（圆眼、自信微笑）。

**😊 开心** → `stage-3-growing-happy.png`

```
Same growing chick. Happy: smiling crescent eyes, wider happy beak, brighter blush, a slight bounce, extra sparkles and tiny hearts. Keep the gem bow, heart scarf, and wing pose.
```

**😢 难过** → `stage-3-growing-sad.png`

```
Same growing chick. Sad: droopy brows, watery eye-corner shine with ONE tiny teardrop, small downturned beak, paler blush, fewer floating stars. Still wearing the same bow and scarf. Cute, not tragic.
```

**🍽️ 饥饿** → `stage-3-growing-hungry.png`

```
Same growing chick. Hungry: eyes look toward a very tiny cookie/corn at the side, slightly open beak, one cute drool droplet, soft tummy hunger lines. Scarf and bow unchanged. Food tiny.
```

---

### 4.4 阶段 4 · 成熟期

参考图：`public/pets/chicken/stage-4-mature.png`  
文件：`stage-4-mature[-happy|-sad|-hungry].png`

**角色锁定**

```
A mature kawaii chick princess. Golden-yellow chibi body, pink-to-gold angel-like wings with flower bows. Tiny gold crown with a pink heart gem and small flowers. Pink puffy princess skirt with bows and daisies, pearl necklace with a heart pendant, long golden-pink tail feathers, little pink dance shoes. Star-shaped highlights in the big eyes, round pink blush. Gold sparkles and petals around. 3D kawaii clay, centered.
```

**😐 普通** — 复用现有主图（星瞳、开心拍）。

**😊 开心** → `stage-4-mature-happy.png`

```
Same chick princess. Happy: joyful crescent or extra-sparkly smiling eyes, bigger happy beak, richer blush, a tiny bounce as if dancing, more hearts and sparkles. Crown, dress, wings, pearls, and shoes stay identical.
```

**😢 难过** → `stage-4-mature-sad.png`

```
Same chick princess. Sad: elegant droopy brows, glistening eyes with ONE tiny tear, small downturned beak, slightly paler blush, fewer sparkles. Outfit unchanged. Soft and cute, never gloomy gothic.
```

**🍽️ 饥饿** → `stage-4-mature-hungry.png`

```
Same chick princess. Hungry: eyes glance at a very tiny cute cookie or cupcake to the side, slightly open beak, one tiny drool droplet, soft tummy hunger lines (visible above the skirt, very subtle). Dress and crown unchanged. Food tiny and kawaii.
```

---

### 4.5 阶段 5 · 满级

参考图：`public/pets/chicken/stage-5-max.png`  
文件：`stage-5-max[-happy|-sad|-hungry].png`

**角色锁定**

```
A legendary kawaii chick queen floating on a small cloud. Warm yellow body, huge iridescent pastel angel wings (pink, gold, lavender) with sparkle particles. Tall gold crown with colorful gems and flowers, golden halo behind the head. Layered pink-gold princess gown with pearls and flowers, pearl necklace, little pink shoes, long flowing golden tail. Surrounded by pastel stars. 3D kawaii clay, centered, glowing but still soft pastel.
```

**😐 普通** — 复用现有主图。

**😊 开心** → `stage-5-max-happy.png`

```
Same chick queen. Happy: proud closed-happy crescent eyes, big warm smile, extra-rosy blush, stronger but still soft golden sparkle, a few extra hearts. Cloud, gown, crown, halo, and wings stay identical.
```

**😢 难过** → `stage-5-max-sad.png`

```
Same chick queen. Sad: gentle droopy brows, watery sparkle with ONE tiny tear, smaller downturned beak, slightly fewer surrounding stars. Still regal and cute, not dark, not broken-winged.
```

**🍽️ 饥饿** → `stage-5-max-hungry.png`

```
Same chick queen. Hungry: eyes look toward a very tiny kawaii cake or cookie floating beside her, slightly open beak, one cute drool droplet, very subtle tummy hunger lines. Gown/crown/wings unchanged. Food tiny so it does not compete with the queen look.
```

---

## 5. 小兔 🐰

主色：白绒毛、薰衣草耳朵内侧、粉鼻、紫瞳。性格：温柔、甜美、略害羞。

### 5.1 阶段 1 · 神秘蛋

参考图：`public/pets/rabbit/stage-1-egg.png`  
文件：`stage-1-egg[-happy|-sad|-hungry].png`

**角色锁定**

```
A round glossy lavender egg sitting in a bed of large soft pink-purple flower petals with tiny purple and pink blossoms. The egg has white stars, a cream crescent moon, pink dots, and a lavender bow on top with a tiny gold heart. Floating purple and pink hearts, a few sparkles. 3D kawaii clay style, centered, square. NO face on the egg.
```

**😐 普通** — 复用现有 `stage-1-egg.png`。

**😊 开心** → `stage-1-egg-happy.png`

```
Same lavender egg and petal bed. Happier: extra floating hearts, brighter pearly shine, egg slightly bouncing, bow looking extra perky. Still NO face on the egg.
```

**😢 难过** → `stage-1-egg-sad.png`

```
Same lavender egg. Sad: egg tilts down a little, fewer hearts, dimmer sparkle, one tiny teardrop-shaped highlight sliding off the shell. Still pastel and cute, not gloomy.
```

**🍽️ 饥饿** → `stage-1-egg-hungry.png`

```
Same lavender egg. Hungry: egg leans toward a very tiny kawaii carrot or clover on the petals. Soft shiver lines. One tiny drool sparkle near the lower shell. Still NO face.
```

---

### 5.2 阶段 2 · 刚孵化

参考图：`public/pets/rabbit/stage-2-hatched.png`  
文件：`stage-2-hatched[-happy|-sad|-hungry].png`

**角色锁定**

```
A fluffy round baby bunny, white fur, long floppy ears with lavender-pink inner color. Sitting, tiny paws together, pink paw pads and a heart-shaped pink sole. Huge glossy purple-lilac eyes with lashes and dual highlights, pink triangle nose, round pink blush, tiny smile. Lavender eggshell piece on the head, a purple flower, tiny star clips. Cotton-ball tail. Floating purple hearts. 3D kawaii plush/clay, centered.
```

**😐 普通** — 复用现有主图（害羞圆眼、小微笑）。

**😊 开心** → `stage-2-hatched-happy.png`

```
Same baby bunny. Happy: closed curved happy eyes, bigger sweet smile, rosier blush, tiny bounce, extra pink hearts. Keep floppy ears, flower, eggshell, and sitting pose.
```

**😢 难过** → `stage-2-hatched-sad.png`

```
Same baby bunny. Sad: droopy inner-ear angle slightly lower, watery purple eyes with ONE tiny teardrop, small downturned mouth, paler blush, fewer hearts. Shy and soft, not sobbing.
```

**🍽️ 饥饿** → `stage-2-hatched-hungry.png`

```
Same baby bunny. Hungry: eyes glance at a very tiny kawaii carrot, mouth a little open, one cute drool droplet, soft tummy hunger lines. Paws, flower, and eggshell unchanged. Food tiny.
```

---

### 5.3 阶段 3 · 成长期

参考图：`public/pets/rabbit/stage-3-growing.png`  
文件：`stage-3-growing[-happy|-sad|-hungry].png`

**角色锁定**

```
A growing kawaii bunny, white fluffy body, one ear up and one ear floppy, lavender inner ears. Light purple ruffled dress, flower crown of purple/pink blossoms, holding a tiny bouquet of pink and yellow flowers. Big purple eyes with lashes, pink blush, cotton tail with a small purple flower. Standing, cute short legs. Floating stars and a heart. 3D kawaii clay, centered.
```

**😐 普通** — 复用现有主图（歪头好奇、微笑）。

**😊 开心** → `stage-3-growing-happy.png`

```
Same growing bunny. Happy: crescent happy eyes, bigger smile, brighter blush, a little hop, extra sparkles. Keep one-up-one-down ears, dress, flower crown, and bouquet.
```

**😢 难过** → `stage-3-growing-sad.png`

```
Same growing bunny. Sad: both ears a bit lower, droopy brows, watery eyes with ONE tiny tear, small downturned mouth. Dress and bouquet unchanged. Cute, not tragic.
```

**🍽️ 饥饿** → `stage-3-growing-hungry.png`

```
Same growing bunny. Hungry: eyes look toward a very tiny carrot besides the bouquet, slightly open mouth, one drool droplet, soft tummy hunger lines above the dress. Crown and dress unchanged. Food tiny.
```

---

### 5.4 阶段 4 · 成熟期

参考图：`public/pets/rabbit/stage-4-mature.png`  
文件：`stage-4-mature[-happy|-sad|-hungry].png`

**角色锁定**

```
A mature kawaii bunny princess. White fur, long floppy ears with pink-lavender tips and tiny bows. Gold mini crown plus a colorful flower crown (purple, pink, blue, yellow). Lavender lace princess dress with pearls, bows, and daisies. Holding a pink star magic wand with a purple bow. Crystal-like shoes, fluffy tail with a bow. Two or three pastel butterflies nearby. Big sparkly purple eyes, gentle smile. 3D kawaii clay, centered.
```

**😐 普通** — 复用现有主图（温柔微笑、星瞳）。

**😊 开心** → `stage-4-mature-happy.png`

```
Same bunny princess. Happy: joyful crescent eyes, warmer bigger smile, rosier blush, a graceful little bounce, extra sparkles. Wand, crown, dress, butterflies stay identical.
```

**😢 难过** → `stage-4-mature-sad.png`

```
Same bunny princess. Sad: elegant droopy brows, glistening eyes with ONE tiny tear, small downturned mouth, butterflies a little farther/fewer. Outfit unchanged. Soft pastel sadness only.
```

**🍽️ 饥饿** → `stage-4-mature-hungry.png`

```
Same bunny princess. Hungry: eyes glance at a very tiny kawaii carrot or clover cake, slightly open mouth, one cute drool droplet, very subtle tummy hunger lines. Wand and gown unchanged. Food tiny.
```

---

### 5.5 阶段 5 · 满级

参考图：`public/pets/rabbit/stage-5-max.png`  
文件：`stage-5-max[-happy|-sad|-hungry].png`

**角色锁定**

```
A legendary kawaii bunny fairy queen. White fluffy body, rainbow-gradient long ears (pink-purple-blue-gold), transparent sparkly butterfly wings. Flower crown plus a small gold-and-purple tiara. Lavender-pink gradient layered fairy gown with flowers, pearls, and sparkles. Holding a glowing star wand with a purple bow. Sitting/hovering above a small rainbow arc with flowers. Closed-eye happy smile in the current default. Surrounding pastel stars, hearts, petals. 3D kawaii clay, centered.
```

现有满级主图已经是 **闭眼笑**，更接近「开心」。建议：

- 把现有 `stage-5-max.png` 当作 **😊 开心**
- 用下面的「普通」prompt 补一张睁眼温柔版，作为无后缀主图（可选）

**😐 普通** → 若要补：覆盖或另存后再替换 `stage-5-max.png`

```
Same bunny fairy queen, identical outfit, wings, rainbow ears, wand, rainbow arc. Normal expression: eyes OPEN, big glossy purple sparkly eyes, gentle small smile (not closed-eye laugh), calm happy-neutral. Keep everything else the same.
```

**😊 开心** → `stage-5-max-happy.png`（也可直接复制现有主图并改名）

```
Same bunny fairy queen. Happy: closed crescent eyes, big sweet open-mouth smile, extra-rosy blush, more sparkles and hearts. Outfit unchanged.
```

**😢 难过** → `stage-5-max-sad.png`

```
Same bunny fairy queen. Sad: eyes open, droopy brows, watery shine with ONE tiny tear, small downturned mouth, slightly fewer surrounding stars. Still rainbow and cute, never dark.
```

**🍽️ 饥饿** → `stage-5-max-hungry.png`

```
Same bunny fairy queen. Hungry: eyes glance at a very tiny kawaii cupcake or carrot cookie near the wand, slightly open mouth, one drool droplet, very subtle tummy hunger lines. Gown/wings/rainbow unchanged. Food tiny.
```

---

## 6. 文件清单

放到 `public/pets/<chicken|rabbit>/`。现有主图 = 普通。

| 阶段 | 普通（已有） | 开心 | 难过 | 饥饿 |
|------|--------------|------|------|------|
| 1 蛋 | `stage-1-egg.png` | `stage-1-egg-happy.png` | `stage-1-egg-sad.png` | `stage-1-egg-hungry.png` |
| 2 刚孵化 | `stage-2-hatched.png` | `stage-2-hatched-happy.png` | `stage-2-hatched-sad.png` | `stage-2-hatched-hungry.png` |
| 3 成长期 | `stage-3-growing.png` | `stage-3-growing-happy.png` | `stage-3-growing-sad.png` | `stage-3-growing-hungry.png` |
| 4 成熟期 | `stage-4-mature.png` | `stage-4-mature-happy.png` | `stage-4-mature-sad.png` | `stage-4-mature-hungry.png` |
| 5 满级 | `stage-5-max.png` | `stage-5-max-happy.png` | `stage-5-max-sad.png` | `stage-5-max-hungry.png` |

小鸡、小兔各一套，共 40 个文件名。优先出 **30 张新表情**；满级小兔如需把主图改成睁眼普通，再加 1 张。

导出建议：

- 正方形 PNG，透明底
- 2x（约 512–1024 边长即可，进工程后再压）
- sRGB，单张 < 100KB（压缩后）
- 颜色空间不要发灰、不要加黑色方形底板

---

## 7. 出图时如果跑偏

按顺序试：

1. 「Match the uploaded image exactly. Same face shape, same colors, same clothes. Only the expression changes.」
2. 把参考图再发一次。
3. 加一句：`identical 3D clay kawaii style, not anime 2D, not photorealistic, not Barbie, not Disney 3D.`
4. 仍不像：只出头部特写对比，确认表情对了再出全身。

禁止出现：写实羽毛/兽毛、尖牙、黑眼圈、大片泪海、真实食物照片、第二只动物、任何文字。
