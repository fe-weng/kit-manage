# 宠物进化设计规范

> **版本**：v1.0
> **日期**：2026-09-02
> **目标受众**：5 岁女孩
> **核心感受**：「好可爱！我想养它！」

---

## 1. 整体视觉风格

### 1.1 风格定义

| 属性 | 规范 |
|------|------|
| **风格** | 卡通 Q 版 / Chibi / SD（Super Deformed） |
| **比例** | 头身比 1:1 ~ 1:1.5（头大身小） |
| **线条** | 圆润无棱角，无尖锐线条 |
| **颜色** | 柔和糖果色 / 粉彩色（Pastel） |
| **表情** | 大而闪亮的眼睛（占脸部 40%），丰富的腮红 |
| **质感** | 扁平 + 微渐变（Flat with soft gradient），与 Claymorphism UI 搭配 |
| **禁止** | ❌ 写实风格 ❌ 暗色调 ❌ 尖锐棱角 ❌ 恐怖/怪异元素 |

### 1.2 参考风格关键词（适用于 AI 绘图 Prompt）

```
kawaii chibi pet, super deformed, cute cartoon illustration,
pastel colors, soft gradient, round shapes, big sparkly eyes,
flat design with soft shadows, children's game character,
suitable for 5-year-old girl, warm and friendly
```

### 1.3 全局色彩约束

所有宠物使用的颜色必须与 App UI 色彩系统兼容：

| 色彩令牌 | 色值 | 用途 |
|---------|------|------|
| Primary | `#FF9BB0` | 柔粉色（心情、爱心） |
| Secondary | `#C4A8E0` | 薰衣草紫（小兔主色调） |
| Accent | `#7ECFC0` | 薄荷绿（成长、积分） |
| Warning | `#FFB74D` | 柔橙色（提醒、饥饿） |
| Pet Gold | `#FFD54F` | 金黄色（经验值、进化、皇冠） |
| Background | `#FFF8F0` | 奶白色（背景） |

---

## 2. 宠物 A：小鸡 🐔

### 2.1 基本设定

| 属性 | 值 |
|------|---|
| **主色调** | 暖黄 `#FFD154` + 粉色腮红 `#FF9BB0` |
| **辅助色** | 金色 `#FFD54F`、白色、浅橙 `#FFB74D` |
| **性格** | 圆润活泼、元气满满、爱撒娇 |
| **特征** | 圆球体型、小翅膀、红腮红、大圆眼 |

### 2.2 五阶段进化详细描述

#### 阶段 1：神秘蛋（0 EXP）

```
外形：一颗椭圆形的蛋，微微倾斜
颜色：粉白底色 + 金色波点花纹 + 浅粉色心形图案
大小：占画面 60%
细节：
  - 蛋壳表面有柔和的光泽（左上角高光）
  - 底部有微小裂纹（暗示即将孵化）
  - 蛋周围有 3-4 个小星星 ✨ 漂浮
  - 蛋下方有一个小草坪/鸟巢
情绪：神秘、期待
```

**AI Prompt 参考**：
```
a kawaii pastel-colored egg with golden polka dots and pink heart patterns,
sitting in a tiny nest, small sparkles floating around, soft gradient,
cracked slightly at bottom, chibi style, white background,
children's illustration for mobile game
```

#### 阶段 2：刚孵化（50 EXP）

```
外形：圆球形小鸡，头占身体 70%
颜色：暖黄色身体 + 粉色腮红
大小：比蛋略大
细节：
  - 头顶有 2-3 块蛋壳碎片（白色带裂纹）
  - 大圆眼睛（黑色瞳孔 + 白色高光 x2）
  - 两个小圆腮红（#FF9BB0）
  - 小小的橙色三角嘴巴
  - 极小的翅膀（像两个小圆形凸起）
  - 橙色小脚丫（2趾）
  - 头顶一个小粉色蝴蝶结 🎀
表情：惊喜、好奇（眼睛睁大）
```

**AI Prompt 参考**：
```
a newly hatched kawaii baby chick, round body, big sparkly eyes,
pink blush cheeks, tiny pink bow on head, eggshell pieces on head,
small orange beak, warm yellow color, chibi/SD proportions,
pastel soft shadows, children's mobile game character, white background
```

#### 阶段 3：成长期（200 EXP）

```
外形：小鸡长大一些，头身比 1:1.2
颜色：暖黄 + 翅膀尖端渐变为浅金色
大小：比阶段2大 30%
细节：
  - 蛋壳碎片消失
  - 翅膀变大，有 3 根可见的羽毛轮廓
  - 脖子上戴粉色小围巾 🧣
  - 头顶蝴蝶结变大，增加一颗小宝石
  - 尾巴出现（3根小翘羽毛）
  - 腮红保留，增加小睫毛（2根）
  - 脚丫变大，有小指甲细节
表情：自信、微笑（嘴角上翘）
```

**AI Prompt 参考**：
```
a growing kawaii chick character, slightly larger, with visible wings,
wearing a pink scarf, bigger pink bow with tiny gem, small tail feathers,
eyelashes, confident smile, warm yellow with golden wing tips,
chibi proportions, pastel colors, children's game character, white background
```

#### 阶段 4：成熟期（500 EXP）

```
外形：完全体小鸡，身材匀称但仍Q版
颜色：暖金黄色 + 粉色配饰
大小：比阶段3大 20%
细节：
  - 漂亮的大翅膀（展开时像天使翅膀）
  - 头顶戴小金色皇冠 👑（替代蝴蝶结）
  - 穿粉色小裙子（蓬蓬裙/公主裙下摆）
  - 脖子上的围巾变成珍珠项链
  - 尾巴变成华丽的 3-4 根长羽毛
  - 眼睛更闪亮（增加星形高光）
  - 脚上有小红鞋/舞鞋
表情：优雅、自信、开心
```

**AI Prompt 参考**：
```
a mature kawaii chicken princess, golden yellow, wearing a tiny gold crown,
pink puffy dress, pearl necklace, beautiful angel-like wings,
long tail feathers, sparkly star-shaped eye highlights, little red shoes,
chibi/SD proportions, pastel royal style, children's game character,
white background
```

#### 阶段 5：满级 ✨（1000 EXP）

```
外形：最华丽的小鸡形态，全身闪闪发光
颜色：金色光芒 + 暖黄底色 + 彩虹渐变点缀
大小：最大尺寸
细节：
  - 头顶金色大皇冠（镶嵌彩色宝石）
  - 身后有金色光环/光圈（halo）
  - 翅膀变成金色渐变羽翼（天使翅膀 + 星光粒子）
  - 穿华丽公主长裙（金色 + 粉色渐变）
  - 周围环绕 5-6 颗漂浮的彩色星星 ⭐
  - 脚下有小云朵托着
  - 整体有柔和的金色外发光（glow）
表情：骄傲、幸福、闪闪发光（眯眼微笑）
```

**AI Prompt 参考**：
```
a legendary kawaii chicken queen, full golden glow, magnificent crown
with colorful gems, golden angel wings with sparkle particles,
gorgeous golden-pink gradient princess gown, floating on small clouds,
surrounded by colorful stars, golden halo behind head,
chibi/SD proportions, maximum kawaii, pastel fantasy royal style,
children's mobile game character, white background
```

---

## 3. 宠物 B：小兔子 🐰

### 3.1 基本设定

| 属性 | 值 |
|------|---|
| **主色调** | 白色 + 薰衣草紫 `#C4A8E0` |
| **辅助色** | 粉色 `#FF9BB0`、浅蓝 `#A8D8F0`、彩虹色（满级） |
| **性格** | 温柔甜美、优雅可爱、略带害羞 |
| **特征** | 长垂耳朵、粉色鼻子、绒毛质感、大圆眼 |

### 3.2 五阶段进化详细描述

#### 阶段 1：神秘蛋（0 EXP）

```
外形：圆润的蛋形，比小鸡的蛋略大
颜色：淡紫色底 + 白色星星图案 + 粉色圆点
细节：
  - 蛋壳表面有薰衣草色渐变
  - 白色小星星和月亮图案装饰
  - 顶部有一个小蝴蝶结贴纸（紫色）
  - 周围有 3 个小心形 💜 漂浮
  - 蛋放在花瓣垫子上
情绪：梦幻、甜美
```

**AI Prompt 参考**：
```
a kawaii lavender-colored egg with white star and moon patterns,
pink dots, tiny purple bow sticker on top, floating purple hearts,
sitting on flower petals, soft gradient, dreamy pastel style,
chibi illustration for children's mobile game, white background
```

#### 阶段 2：刚孵化（50 EXP）

```
外形：圆球形小兔，极其蓬松
颜色：白色身体 + 薰衣草紫色耳朵内侧
大小：蛋的 1.2 倍
细节：
  - 两只长长的下垂耳朵（圆头耳朵，内侧粉紫色）
  - 头顶有蛋壳碎片（淡紫色）
  - 大大的圆眼睛（紫色/棕色瞳孔 + 双高光）
  - 小粉色三角鼻子 🐽
  - 圆形腮红（粉色）
  - 小短手 + 粉色肉垫
  - 圆形蓬松尾巴（棉花糖状）
  - 头上戴薰衣草色小花 🌸
表情：害羞、软萌（微微歪头）
```

**AI Prompt 参考**：
```
a newly hatched kawaii baby bunny, extremely fluffy white round body,
long floppy ears with lavender inner color, big round eyes with
purple-brown iris, pink triangle nose, pink cheek blush,
tiny lavender flower on head, eggshell pieces on head,
cotton-ball tail, chibi/SD proportions, pastel soft style,
children's mobile game character, white background
```

#### 阶段 3：成长期（200 EXP）

```
外形：兔子长大，耳朵更长，头身比 1:1.2
颜色：白色 + 耳朵和四肢薰衣草渐变
大小：比阶段2大 30%
细节：
  - 耳朵更长，一只竖起一只下垂（活泼感）
  - 穿淡紫色小裙子（荷叶边裙摆）
  - 脖子上的花变成花环（混色小花）
  - 手上抱着一朵小花或小星星
  - 眼睛增加小睫毛
  - 尾巴变大，像一朵小花
表情：活泼、好奇（一只眼睛略大 = 歪头看）
```

**AI Prompt 参考**：
```
a growing kawaii bunny, white with lavender gradient on ears and paws,
one ear up one ear floppy, wearing a light purple ruffle dress,
flower crown on head, holding a tiny flower, fluffy flower-shaped tail,
eyelashes, curious expression with tilted head,
chibi proportions, pastel colors, children's game character, white background
```

#### 阶段 4：成熟期（500 EXP）

```
外形：优雅的完全体兔子，仍保持Q版比例
颜色：白色 + 薰衣草紫配饰 + 粉色点缀
大小：比阶段3大 20%
细节：
  - 长耳朵飘逸，末端有渐变（紫→粉）
  - 头戴花冠/花环 🌺（多种颜色小花交织）
  - 穿精致的紫色公主裙（带蕾丝边和蝴蝶结）
  - 手持粉色魔法棒/星星棒 ✨
  - 脚上有水晶小鞋
  - 尾巴上绑了蝴蝶结
  - 周围有 2-3 只蝴蝶飞舞 🦋
表情：优雅、温柔微笑
```

**AI Prompt 参考**：
```
a mature kawaii bunny princess, white with lavender gradient ear tips,
wearing an elaborate flower crown, purple princess dress with lace and bows,
holding a pink star magic wand, crystal shoes, bow on fluffy tail,
butterflies flying around, elegant gentle smile,
chibi/SD proportions, pastel fantasy style, children's game character,
white background
```

#### 阶段 5：满级 ✨（1000 EXP）

```
外形：最华丽的兔子形态，梦幻仙子风
颜色：白色 + 彩虹渐变耳朵 + 紫色主配饰
大小：最大尺寸
细节：
  - 耳朵变成彩虹渐变（粉→紫→蓝→绿→金）
  - 头戴精致花冠 + 小皇冠组合
  - 手持闪光魔法杖（顶端是星星）
  - 穿最华丽的渐变长裙（紫→粉 + 星光粒子）
  - 背后有透明的蝴蝶翅膀（薄纱质感 + 闪光）
  - 周围环绕 6-8 颗彩色星星 + 心形 + 小花瓣
  - 脚下有彩虹光弧
  - 整体有紫色柔光外发光（glow）
表情：幸福、自信、闪闪发光（闭眼微笑/星星眼）
```

**AI Prompt 参考**：
```
a legendary kawaii bunny fairy queen, white fluffy body with
rainbow gradient ears (pink-purple-blue-green-gold),
elaborate flower crown with tiny tiara, sparkling star magic wand,
gorgeous purple-pink gradient long gown with star particles,
transparent butterfly wings with shimmer, surrounded by colorful stars
hearts and flower petals, rainbow arc at feet, purple soft glow,
closed-eye happy smile, chibi/SD proportions,
maximum kawaii dreamy fantasy style, children's mobile game character,
white background
```

---

## 4. 表情系统

每个阶段的宠物需要额外制作 **4 种表情**（用于不同状态）：

| 状态 | 表情 | 触发条件 |
|------|------|---------|
| 😊 开心 | 眯眼微笑、腮红更红、蹦跳姿态 | 心情 > 70 |
| 😐 普通 | 标准表情、微微微笑 | 心情 30-70 |
| 😢 难过 | 眉毛下垂、嘴角下垂、眼角有泪光 | 心情 < 30 |
| 🍽️ 饥饿 | 流口水、眼睛看向食物方向、肚子有线条 | 饥饿度 > 70 |

### 表情制作要点

- 只需改变**眼睛 + 嘴巴 + 附加细节**，身体和配饰不变
- 保持同一阶段的一致性
- 过渡要自然（可用 2-3 帧渐变）

---

## 5. 技术规格

### 5.1 尺寸规范

| 用途 | 尺寸 | 格式 |
|------|------|------|
| 宠物页面主展示 | 240×240 px | PNG（透明背景） |
| 首页迷你卡片 | 80×80 px | PNG（透明背景） |
| 进化动画用 | 320×320 px | PNG 或 Lottie JSON |
| 创建宠物选择 | 160×160 px | PNG（透明背景） |

### 5.2 命名规范

```
assets/pets/
├── chicken/
│   ├── stage-1-egg.png
│   ├── stage-1-egg@2x.png
│   ├── stage-2-hatched.png
│   ├── stage-2-hatched@2x.png
│   ├── stage-2-hatched-happy.png    // 开心表情
│   ├── stage-2-hatched-sad.png      // 难过表情
│   ├── stage-2-hatched-hungry.png   // 饥饿表情
│   ├── stage-3-growing.png
│   ├── stage-4-mature.png
│   └── stage-5-max.png
├── rabbit/
│   ├── stage-1-egg.png
│   ├── stage-2-hatched.png
│   ├── ...
│   └── stage-5-max.png
└── shared/
    ├── sparkle.png
    ├── heart.png
    └── star.png
```

### 5.3 导出要求

- 透明背景 PNG
- 2x 分辨率（适配 Retina/iPad 屏幕）
- 颜色空间：sRGB
- 文件大小：单张 < 100KB（压缩后）

---

## 6. AI 生成工具使用建议

### Midjourney

```
/imagine prompt: [具体描述] --style cute --ar 1:1 --niji 6 --s 250
```

添加以下通用后缀提升效果：
```
chibi proportions, kawaii style, children's game character,
pastel colors, soft gradient, white background, clean illustration,
no text, centered composition --niji 6
```

### DALL-E / ChatGPT

使用上面每个阶段的 AI Prompt 参考，补充：
```
Style: kawaii chibi illustration, pastel colors, flat with soft gradient
Format: centered on white background, suitable for mobile game
Constraints: no text overlay, transparent-friendly, clean edges
```

### Stable Diffusion

推荐模型：`Counterfeit-V3.0` 或 `AnythingV5`
```
(chibi:1.3), (kawaii:1.2), [具体角色描述],
pastel colors, soft gradient, simple background,
game character design, (children's illustration:1.2)
Negative: realistic, dark, scary, sharp edges, adult
```

---

## 7. 进化动画建议

| 进化 | 动画效果 | 时长 |
|------|---------|------|
| 蛋 → 孵化 | 蛋壳裂纹 → 碎裂 → 小动物弹出 + 彩色碎纸 | 2-3s |
| 孵化 → 成长 | 白光包裹 → 光散去露出新形态 + 星星粒子 | 2s |
| 成长 → 成熟 | 旋转 + 光柱 → 新形态 + 皇冠/花环出现 | 2.5s |
| 成熟 → 满级 | 金色爆发光效 + 彩虹光弧 → 最终形态 + 大量星星 | 3s |

> MVP 阶段可以用简单的 Framer Motion 缩放 + 闪光效果代替复杂动画。
