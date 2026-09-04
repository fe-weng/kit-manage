# PWA 图标 AI 生成 Prompt

> 用于生成 Kid Manage 应用图标，可直接用于 ChatGPT / Midjourney / DALL-E / 通义万相 等 AI 图像生成工具。

---

## English Prompt (Recommended for Midjourney / DALL-E)

```
A cute app icon for a children's task management app. Features a small baby chick (🐣) character in a kawaii/chibi style, sitting on a pastel pink cloud. The chick has rosy cheeks, big sparkling eyes, and a tiny golden star floating above its head. Background is a soft gradient from warm peach (#FFE4C9) to light pink (#FFD6E0). Style: 3D claymorphism with soft shadows, rounded corners, minimal and clean. No text. Square format, suitable for app icon at 512×512 pixels.
```

## 中文 Prompt（适用于 ChatGPT / 豆包 / 通义万相）

```
一个可爱的儿童任务管理 App 图标。主角是一只 Q 版小鸡宝宝（🐣），坐在粉色云朵上，有红润的脸颊、闪亮的大眼睛，头顶有一颗金色小星星。背景是温暖的桃粉渐变（#FFE4C9 → #FFD6E0）。风格：3D 粘土拟物（Claymorphism），柔和阴影，圆角，简约干净。无文字。正方形 512×512。
```

---

## 生成后处理

生成图片后需要导出以下尺寸，放到 `public/icons/` 目录下：

| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| `icon-192.png` | 192×192 | Android PWA manifest |
| `icon-512.png` | 512×512 | Android PWA manifest + Splash |
| `apple-touch-icon.png` | 180×180 | iOS "添加到主屏幕" |

替换后需要同步更新：

1. **`vite.config.ts`** — manifest.icons 改为 PNG 格式：
   ```ts
   icons: [
     { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
     { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
   ]
   ```

2. **`index.html`** — 更新 icon 引用：
   ```html
   <link rel="icon" type="image/png" href="/icons/icon-192.png" />
   <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
   ```

3. 可删除旧的 `icon.svg` 和 `apple-touch-icon.svg`。
