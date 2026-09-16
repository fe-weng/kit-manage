# 新增小猫、小狗设计规范

> **日期**：2026-09-16  
> **状态**：已实施  
> **关联**：[宠物进化设计规范](./2026-09-02-pet-design-spec.md) · [多宠物养成设计规范](./2026-09-14-multi-pet-design-spec.md) · [进化壳碎片 Prompt](./2026-09-14-pet-evolution-shard-prompts.md)

## 1. 背景

当前可领养种类只有小鸡 `chicken` 和小兔 `rabbit`。图鉴、首养表单、进化粒子和壳图名册都按「两只」或「兔子 / 非兔子」编写。需要再增加两只原创宠物：小猫、小狗。气质分别参考 Hello Kitty 与玉桂狗，但必须是本 App 的 3D 粘土 Q 版角色，不能做成商标外形复制。

已有用户若已集齐小鸡和小兔，图鉴会从「已集齐」变为 `2/4`，满级后可再花 100 分领养新种类。不迁移旧数据。

## 2. 目标

- 图鉴可领养种类变为 4 种：小鸡、小兔、小猫、小狗。每种仍限一只。
- 小猫、小狗各有五阶段主图和三片孵化壳碎片，成长与进化演出与现有宠物同一套规则。
- 种类、中文名、emoji、进化粒子、成熟升段图标集中在一份 `PET_CATALOG`，避免 UI 与 Service 各写一份列表。
- 视觉风格对齐现有小鸡/小兔：3D kawaii clay/plush、头大身小、糖果色、大闪亮眼睛、越长大越华丽。

## 3. 非目标

- 不改 EXP 门槛、喂食花费、领养价 `PET_ADOPTION_COST = 100`。
- 不做开心/难过/饥饿表情图。
- 不做出未接入代码的 `*-bg.png`。
- 不支持放生、删除单只宠物、或重复领养同一 `type`。
- 不改数据库 schema：`pet.type` 保持字符串。
- 不照搬 Hello Kitty / 玉桂狗的商标外形（无嘴标致脸、头上肉桂卷等）。

## 4. 业务规则（沿用，仅种类变多）

- 第一只免费，从图鉴之后的领养各花 100 分。
- 每种 `type` 只能有一只。
- 同时最多一只未满级（养成中）宠物。
- 展示宠物仍由 `isDisplayed` 决定；养成宠物仍由「唯一未满级」推导。
- 图鉴 `totalCount` = `PET_CATALOG.length`（4）。已领养小鸡+小兔的用户显示 `2/4`，不再显示「已集齐全部宠物」，直到四只都领养且满级。
- 目录顺序：`chicken` → `rabbit` → `cat` → `dog`（已有种类在前）。

## 5. 角色设定

风格总则与 [宠物进化设计规范 §1](./2026-09-02-pet-design-spec.md) 相同。两只新角色都必须**有嘴巴**、大圆眼、粉腮红，脸型跟现有小鸡/小兔同一套，不要做成三丽鸥平面贴纸脸。

### 5.1 小猫 `cat`

| 属性 | 值 |
|------|---|
| 图鉴名 | 小猫 |
| emoji | 🐱 |
| 主色 | 奶白身体 + 樱桃红 `#E85D75` 配饰 |
| 辅助色 | 金色铃铛 `#FFD54F`、浅粉腮红 `#FF9BB0`、樱花瓣 |
| 性格 | 甜、爱整齐、端正 |
| 标志 | 耳侧樱桃红蝴蝶结 + 小金铃铛 |
| 禁止 | 无嘴脸、椭圆贴纸头、原样复制 Hello Kitty 轮廓 |

### 5.2 小狗 `dog`

| 属性 | 值 |
|------|---|
| 图鉴名 | 小狗 |
| emoji | 🐶 |
| 主色 | 雪白身体 + 天空蓝 `#7EC8E3` |
| 辅助色 | 白云、浅蓝肉垫、银白高光 |
| 性格 | 软、爱飞、黏人 |
| 标志 | 长垂耳内侧天空蓝 + 头顶一小团卷云（云，不是食物） |
| 禁止 | 头上肉桂卷、彩虹（留给小兔）、金色大皇冠（留给小鸡） |

## 6. 五阶段外形

体型随阶段略增大，配饰变华丽。构图：角色居中、正方形、透明底、四周留白，与现有 `public/pets/chicken|rabbit/stage-*.png` 一致。

### 6.1 小猫

| 阶段 | 文件 | 外形 |
|------|------|------|
| 1 神秘蛋 | `stage-1-egg.png` | 奶油白蛋，大红心 + 金色圆点；底部微裂纹；坐在小草巢上，旁有两三朵小樱花。 |
| 2 刚孵化 | `stage-2-hatched.png` | 圆滚白猫，头顶蛋壳；耳朵一侧樱桃红结；脖子一颗小金铃；粉腮红、微笑嘴、大圆眼。 |
| 3 成长期 | `stage-3-growing.png` | 蛋壳消失；红结变大；红项圈 + 金铃；尾巴尖一点红丝带；小睫毛。 |
| 4 成熟期 | `stage-4-mature.png` | 樱桃红蓬蓬裙；铃铛变成金项链；头上小红金冠，耳侧结仍在；坐姿端正。 |
| 5 满级 | `stage-5-max.png` | 红金渐变礼服；樱花冠 + 柔光环；脚下小云朵；周围红心和金星。 |

### 6.2 小狗

| 阶段 | 文件 | 外形 |
|------|------|------|
| 1 神秘蛋 | `stage-1-egg.png` | 天蓝蛋，白云 + 小星星；坐在一团棉花糖云上（不是草巢）。 |
| 2 刚孵化 | `stage-2-hatched.png` | 圆滚白狗；长垂耳内侧浅蓝；头顶一小团卷云 + 蛋壳；粉肉垫、微笑嘴、大圆眼。 |
| 3 成长期 | `stage-3-growing.png` | 蛋壳消失；耳朵更长；天蓝小围巾；卷云略大；踮脚感。 |
| 4 成熟期 | `stage-4-mature.png` | 云朵小披风；身体略离地；耳尖更蓝；浅蓝短裙或肚兜；**不用金色皇冠**。 |
| 5 满级 | `stage-5-max.png` | 透明云翼；白蓝礼服；云朵光环；踩更大的云；周围蓝星和白云，**不用彩虹**。 |

## 7. 壳碎片

路径与小鸡/小兔相同约定：`public/pets/<type>/evo-shell-{left,right,top}.png`。必须在 `SHELL_SHARD_IMAGES`（或由 catalog 派生的名册）里登记，动画不会自动探测文件。

- 小猫：奶油底 + 红心/金点；断面浅金/奶白糖果壳。
- 小狗：天蓝底 + 白云；断面奶白。
- 只要单片壳，不要整蛋、不要动物、不要巢/云座。
- 出图时用该种类 `stage-1-egg.png` 当纹理参考。固定指令沿用 [壳碎片 Prompt](./2026-09-14-pet-evolution-shard-prompts.md) 的 clay/plush 段落。

## 8. 出图与接入顺序

1. 用现有小鸡/小兔 PNG 当风格参考，各出 1 张阶段 2 定妆图，人工确认脸型和配色。
2. 按阶段 1→5 补齐主图（阶段 2 定妆通过后可重出一张更稳的阶段 2）。
3. 用各自蛋图出三片壳。
4. 文件放入 `public/pets/cat/` 与 `public/pets/dog/` 后接线。
5. 表情图与 `-bg` 不做。

主图格式：正方形 PNG、透明底（不能透明则纯白底再抠）、无文字水印。分辨率对齐现有成图（高分辨率正方形，供手机与平板 `object-fit: contain`）。

## 9. 代码设计

### 9.1 `PET_CATALOG`

新增 `src/shared/petCatalog.ts`，作为种类唯一数据源。`PetService.ADOPTABLE_PET_TYPES` 改为从 catalog 映射 `{ type, label }`，不再手写两行。

每条至少包含：

| 字段 | 说明 |
|------|------|
| `type` | `'chicken' \| 'rabbit' \| 'cat' \| 'dog'` |
| `label` | 小鸡 / 小兔 / 小猫 / 小狗 |
| `emoji` | 🐣 / 🐰 / 🐱 / 🐶 |
| `hatchParticles` | 进化粒子 emoji 列表 |
| `legendParticles` | 满级粒子 |
| `defaultParticles` | glow / ascend 粒子 |
| `ascendIcon` | `'crown' \| 'flower' \| 'bell' \| 'cloud'` |

图片路径不写进 catalog 散落字符串，而由约定生成：

```
pets/${type}/stage-1-egg.png
pets/${type}/stage-2-hatched.png
pets/${type}/stage-3-growing.png
pets/${type}/stage-4-mature.png
pets/${type}/stage-5-max.png
pets/${type}/evo-shell-left.png | right | top
```

`getPetImage` 按该约定取图；未知 type 仍回退到小鸡成长图（与现逻辑相同）。

### 9.2 必须改掉的二元分支

这些地方今天把「非兔子」当成小鸡，接入猫狗前必须改成查 catalog：

- `evolutionTransition.getEvolutionParticles`：`petType !== 'rabbit'`
- `PetDisplay` 名称旁 emoji：`petType === 'rabbit' ? '🐰' : '🐣'`
- `EvolutionFx` 成熟升段图标：兔子花 / 否则皇冠
- `EvolutionFx.resolveShellKey`：增加 cat/猫、dog/狗
- `CreatePetForm` 本地 `PET_TYPES`：改为读 catalog
- `Pet/index.tsx` 图鉴角标：`totalCount ?? 2` 改为 `?? PET_CATALOG.length` 或与 `getCollection()` 一致

### 9.3 首养表单布局

四种选项不再横排四个 `flex-1`（手机过窄）。改为 **2×2** 网格，按钮样式（选中描边、emoji + 中文名）保持不变。默认选中仍是 `chicken`。

### 9.4 进化演出差异（仅装饰）

| type | hatch | glow/ascend | legend | 成熟升段图标 |
|------|-------|-------------|--------|--------------|
| chicken | ✨💛🩷⭐ | ✨⭐🌟 | ✨⭐🌟💫💛 | 皇冠 |
| rabbit | 💜✨🩷⭐ | 💜✨🌸 | 💜✨🌸⭐💫 | 花 |
| cat | ✨❤️💛⭐ | ✨❤️⭐ | ✨⭐💖💫💛 | 铃铛 |
| dog | ✨💙☁️⭐ | ✨☁️⭐ | ✨⭐☁️💫💙 | 云 |

小鸡/小兔粒子与现网一致，不要顺手改掉。

时间轴、不能跳过、无音效、无庆祝文案：全部沿用现有进化规范。

### 9.5 不改动的层

- Domain：`Pet`、`PetStage`、`PetGrowthRule`、领养校验逻辑（只消费 catalog 列表）。
- DB / 备份：无新字段。导入旧备份后，未领养的猫狗以图鉴灰蛋出现。
- 首页 `PetMiniCard`：已走 `getPetImage(petType, stage)`，接好映射即可。

## 10. 验收

- 无宠物时，首养表单能选四类，2×2 布局在手机与 iPad 竖屏都可点。
- 图鉴四张卡：未领养为灰蛋；已有鸡/兔的用户能在满级后领养猫或狗（100 分，二次校验不变）。
- 领养猫/狗后，首页、宠物页、图鉴显示对应阶段图，emoji 与粒子不再错成小鸡。
- 蛋→孵化有该种类壳片飞出；缺图时仍只播闪光与粒子，不请求 404。
- 小鸡/小兔的图、动画、文案与行为相对本需求无回归。
- 四种都领养且满级后，图鉴显示「已集齐全部宠物」。

## 11. 文档同步（实施时）

- 更新 `.cursor/context/CONTEXT.md` 中「本期最多两只」等描述。
- 提醒用 `project-context-generator` 刷新 `CODE_INDEX.md`。
- 壳碎片 Prompt 文档补小猫、小狗两节（实施出图后）。
