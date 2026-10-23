# 涂色页实现计划

> 日期：2026-10-23
> 规格：[2026-10-23-coloring-page-design.md](./2026-10-23-coloring-page-design.md)
> 顺序：纯逻辑 → 存储 → 服务 → 备份 → 路由 → 画册 → 画布 → 半成品与成品 → 构建验收

不新增依赖。不改任务、积分、宠物、奖励。Dexie 当前版本是 v7，本功能升到 v8。

新会话只读本计划和规格，按任务 1 到 10 实现。界面沿用现有底栏、`toast` 和确认框。`vite.config.ts` 的 PWA `globPatterns` 已经包含 `svg`，内置线稿不用改构建配置。

## 任务 1：颜色常量与分区算法

文件：

- `src/domain/coloring/palette.ts`
- `src/domain/coloring/labelRegions.ts`

做这些事：

- 按规格写下 40 个固定色，顺序与色系表一致。
- `labelRegions(pixels, width, height)` 接收灰度或 RGB 缓冲，返回编号和是否成功。亮度低于 110 的像素是墙，墙再向外扩 1 像素。浅色四连通区域共用一个编号。
- 导出常量 `REGION_LABEL_VERSION = 1`。以后改阈值或扩墙规则时把版本加一，旧缓存即失效。
- 用一张小的内存图做手工核对：闭合方块得到独立编号，缺一个口的方块与外部同一个编号。不引入测试框架，这段核对可以是开发时的临时脚本，不提交到 `src/`。

完成标准：小图上闭合区域与缺口漏色的结果符合上面两条。40 色数量是 40。

## 任务 2：数据库 v8 与仓储

文件：

- `src/infrastructure/database/DexieDatabase.ts`
- `src/domain/repositories/IColoringRepository.ts`
- `src/infrastructure/database/repositories/DexieColoringRepository.ts`

表：

| 表 | 主键与索引 | 记录 |
| --- | --- | --- |
| `coloringTemplates` | `id, kind` | `kind` 为 `builtin` 或 `imported`。内置记录 public 路径、宽 1024、高 1366。导入记录 PNG Blob 和缩小后的宽高 |
| `coloringResumes` | `templateId` | 一份带透明通道的 PNG Blob |
| `coloringDrafts` | `id, templateId, updatedAt` | 颜色层 Blob、线稿 id、更新时间 |
| `coloringFinished` | `id, templateId, createdAt` | 合成 PNG Blob。`templateId` 可空 |
| `coloringLabelCaches` | `templateId` | 宽、高、`REGION_LABEL_VERSION`、编号 Blob（`Uint16Array`） |

内置线稿 id 固定为 `builtin-bird`，指向 `public/宠物填色线稿 · iPad 竖屏 1024×1366 · 可换装.svg`。不把 SVG 正文复制进数据库。

完成标准：升级后旧的任务和宠物数据还在。五张新表可以写入并按 `templateId` 读出。

## 任务 3：涂色服务

文件：

- `src/application/services/ColoringService.ts`
- `src/shared/container.ts`
- `src/domain/coloring/scaleImage.ts`（浏览器画布缩放，长边限制 1600）

服务负责：

- 首次需要时写入内置模板，重复调用不产生第二份。
- 导入：`createImageBitmap` 解码。失败抛出可展示的错误，不写半条记录。长边超过 1600 时先画到较小画布，再存 PNG Blob。
- 删除导入模板：同时删除该 `templateId` 的接着涂、半成品和编号缓存。不删除成品。内置模板的删除方法直接拒绝。
- 读取接着涂、写入接着涂、按模板删除接着涂。
- 新建半成品、复制半成品、按 id 更新半成品、删除半成品。
- 保存成品：调用方传入已经合成好的 PNG Blob。服务只负责入库。合成失败时调用方不得调用删除接着涂。
- 读取编号缓存。仅当 `templateId`、宽、高、`REGION_LABEL_VERSION` 都一致时返回。写入缓存。区域数达到 65536 时不写。删除某张线稿的缓存。

颜色层和成品在库里用 Blob。编号缓存也用 Blob。不要在这一步做备份。

完成标准：服务可以完成「导入 → 写接着涂 → 存半成品并删接着涂 → 存成品」这条链路。解码失败时模板表行数不变。同一张图写入缓存后，第二次读取不再要求调用方重算。

## 任务 4：备份

文件：

- `src/domain/repositories/IBackupAdapter.ts`
- `src/infrastructure/storage/JsonBackupAdapter.ts`

`BackupData.version` 保持 `1`，否则旧备份无法导入。模板、接着涂、半成品、成品做成可选字段。旧文件没有这些字段时，导入为空，不报错。编号缓存不导出、不导入。

JSON 不能直接保存 Blob。导出时把颜色层和成品 Blob 转成 base64，导入时转回 Blob。`resetAll` 清空这四张表，并清空 `coloringLabelCaches`。

完成标准：导出再导入后，半成品和成品的图片字节一致，备份文件里没有编号缓存。导入后的编号缓存为空。一份没有涂色字段的旧备份仍能导入。

## 任务 5：路由与底栏

文件：

- `src/shared/constants.ts`
- `src/App.tsx`
- `src/presentation/layouts/TabBar.tsx`

新增路由：

- `/coloring`
- `/coloring/paint/:templateId`
- `/coloring/drafts`
- `/coloring/drafts/:draftId`
- `/coloring/finished`
- `/coloring/finished/:finishedId`

底栏增加「涂色」，图标用 Phosphor 已有的画笔或调色板图标。`matchPaths` 覆盖上述全部路径。页面组件可以先渲染标题，确认导航能进出。

完成标准：从任意主页面能进入涂色，再进入四个子路径，底栏保持选中。

## 任务 6：画册、导入和删除

文件：

- `src/presentation/pages/Coloring/AlbumPage.tsx`
- `src/presentation/pages/Coloring/useColoringAlbum.ts`

画册同时列出内置图和导入图。有接着涂的卡片显示角标。提供半成品、成品、添加图片的入口。

添加图片使用 `<input type="file">`，不靠扩展名过滤。解码失败用现有 `toast.error`。删除导入图前用现有确认对话框，文案写明会删除接着涂和半成品、成品仍保留。内置图不显示删除。

完成标准：内置鸟图出现在画册。一张可解码图片导入后出现。一张无法解码的文件只有提示。删除导入图后，对应接着涂、半成品和编号缓存消失，成品还在。

## 任务 7：涂色画布

文件：

- `src/presentation/pages/Coloring/PaintPage.tsx`
- `src/presentation/pages/Coloring/PaintStage.tsx`
- `src/presentation/pages/Coloring/paintSession.ts`
- `src/domain/coloring/labelRegions.ts`（任务 1 已有）

叠放：白底、透明颜色 canvas、线稿。线稿 `mix-blend-mode: multiply`，`pointer-events: none`。内置线稿用 `<img>` 或 `<object>` 加载 SVG，不用 canvas 把线重新画死。导入线稿用缩小后的位图。

手势：一个触点在颜色层上涂或填；两个触点平移和缩放。缩放范围是适配屏幕到 4 倍。坐标先去掉当前的平移和缩放，再落到颜色层像素。笔宽 28，橡皮 36。

块填充：打开时先读该线稿的编号缓存。宽高和 `REGION_LABEL_VERSION` 一致则直接用。否则把线稿画到离屏 canvas，调用 `labelRegions`，成功后写入缓存。成功则点按涂满该编号。失败则关闭填色按钮并 toast，手涂仍可用，不写入缓存。角色外的空白与画布边缘相连时，点下去涂满背景。第一次计算若超过大约一秒，先允许手涂，编号完成后再打开填色。缓存命中时不要走这条等待。

模式默认手涂。切换模式不清除颜色层。撤销栈最多 20 步，只在内存里。离开页面时丢弃撤销栈。

离开页面、`pagehide` 和返回画册时自动保存。编辑线稿则写入接着涂。编辑半成品则写回该半成品。写盘失败时 toast，不导航到「已保存」的空状态。

「存入草稿」：编辑线稿时，把当前颜色层存成新半成品并删除接着涂，然后回到画册。编辑半成品时，用当前颜色层再新建一条半成品，不修改、不删除正在编辑的这一条，并留在当前页。半成品列表里因此能看到两份。

「保存成品」：先在离屏 canvas 上铺白底、画颜色层，再以 `multiply` 画上线稿，导出 PNG。入库成功后再删除线稿的接着涂。合成或入库失败时不删除接着涂，也不改掉已有半成品。从半成品保存时，不删除该半成品。

完成标准：在内置图上涂一笔、填一块、放大到 4 倍。黑线仍然清楚，颜色在白区可见。返回再进入，笔迹还在，填色不再重新计算编号。存草稿后再从画册进入是空白，半成品里能看到刚才的颜色。

## 任务 8：色板与自由调色

文件：

- `src/presentation/pages/Coloring/ColorBar.tsx`
- `src/presentation/pages/Coloring/CustomColorSheet.tsx`

40 色横滑，选中态明显。自由调色是单独入口，两条粗滑条：色相、深浅。选定后成为当前笔色。最近一次自由色写入 `localStorage` 键 `coloring.customColor`。不写入备份，不插入 40 色数组。

完成标准：固定色和自由色都能画上。刷新后自由色还在，40 色的值和顺序不变。

## 任务 9：半成品库与成品库

文件：

- `src/presentation/pages/Coloring/DraftListPage.tsx`
- `src/presentation/pages/Coloring/FinishedListPage.tsx`
- `src/presentation/pages/Coloring/FinishedViewPage.tsx`

半成品列表进入任务 7 的同一涂色页，查询参数或路由区分 `draftId`。成品查看页只显示合成图和删除。没有画笔、填色、橡皮、色板、存草稿、保存成品。

列表项可以单独删除，删除前确认。

完成标准：从半成品保存成品后，两边各有一份。成品页不能涂。删除成品不影响半成品。删除半成品不影响成品。

## 任务 10：验收

运行 `npm run build`。在 iPad Safari 上按规格第 10 节的 11 条逐项看一遍。另外确认：

- 底栏第 6 项在 iPad 上可点，窄宽度下不挡页面内容。
- 设置里的备份导出后能再导入，涂色图片还在，备份中没有编号缓存。恢复后第一次打开会重新计算，第二次打开命中新缓存。旧备份文件仍能导入。
- 任务、宠物、商城页面的原有入口仍可进出。

## 风险

- 1024×1366 的分区只在第一次打开或缓存失效时计算。若超过大约一秒，先显示手涂，编号完成后再打开填色，不要卡住整页。缓存命中后直接填色。
- 一张内置图的编号缓存约 2.8MB。它留在本地库，不进入备份。
- SVG 正片叠底依赖白底。颜色层周围必须是白，不能是透明页面底，否则叠底会变暗。
- 备份里的 base64 会让导出文件明显变大。这是规格已接受的结果。
- 内置 SVG 文件名含中文和间隔号。引用时使用完整 public 路径，不要改名。
