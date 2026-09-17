# Kid Manage

面向家长的儿童行为管理 PWA。核心闭环是：**任务打卡 → 赚积分 → 养宠物 + 兑换奖励**。

数据全部存在本机浏览器（IndexedDB），没有后端、不需要登录。适合在 iPad 或手机上「添加到主屏幕」当 App 用。

在线体验：[https://fe-weng.github.io/kit-manage/](https://fe-weng.github.io/kit-manage/)

<p align="center">
  <img src="public/icons/icon-192.png" width="96" alt="Kid Manage 图标" />
</p>

---

## 功能

- **任务打卡**：每日 / 每周 / 一次性任务，也支持扣分行为
- **积分**：完成任务赚积分，喂宠物、领养、兑奖励会消耗积分
- **宠物养成**：小鸡、小兔、小猫、小狗，每种限一只；神秘蛋 → 孵化 → 成长 → 成熟 → 满级
- **宠物图鉴**：切换展示宠、改名、满级后花费积分领养下一只
- **奖励商城**：用积分兑换现实奖励，生成待使用券；可核销或退还
- **打卡历史**：月历查看完成情况，支持按日期 / 按任务
- **数据备份**：设置页可导出、导入、重置本地数据

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS v4 |
| 状态 | Zustand |
| 存储 | Dexie.js（IndexedDB） |
| 路由 | React Router DOM v7 |
| 动画 | Framer Motion |
| 离线 | vite-plugin-pwa |

分层结构是 Clean Architecture / DDD-lite：`domain` → `application` → `infrastructure` → `presentation`。

## 本地运行

需要 **Node.js 20+**。

```bash
git clone https://github.com/fe-weng/kit-manage.git
cd kit-manage
npm install
npm run dev
```

开发地址：[http://localhost:3100/kit-manage/](http://localhost:3100/kit-manage/)

> 仓库名和 Vite `base` 都是 `/kit-manage/`，本地和 GitHub Pages 都走这个路径前缀。

### 常用命令

```bash
npm run dev       # 开发，端口 3100
npm run build     # 类型检查 + 生产构建
npm run preview   # 预览构建结果
```

### 安装成 PWA

1. 用 Safari（iPad / iPhone）或 Chrome 打开页面
2. 分享 / 菜单 → **添加到主屏幕**
3. 之后可离线使用；换设备请先在设置里导出备份

## 页面

| 路径 | 说明 |
|------|------|
| `/home` | 首页：今日任务、展示宠物、待使用券 |
| `/tasks` | 任务打卡 |
| `/tasks/manage` | 任务增删改 |
| `/tasks/history` | 打卡历史 |
| `/pet` | 宠物喂食、互动、进化 |
| `/pet/collection` | 宠物图鉴 |
| `/shop` | 奖励商城 |
| `/shop/coupons` | 我的券 |
| `/shop/history` | 兑换历史 |
| `/settings` | 备份 / 恢复 / 重置 |

## 数据说明

- 数据只存在当前浏览器的 IndexedDB（库名 `kid-manage`）
- 清除站点数据会丢失记录，请定期在设置页导出 JSON 备份
- 多设备不同步，靠手动导入备份迁移

## 部署

`main` 分支推送后，GitHub Actions 会构建并发布到 GitHub Pages。SPA 回退靠构建时复制 `dist/404.html`。

若要改发布路径，需要同时改 `vite.config.ts` 里的 `base`、`start_url`、`scope`。

## 项目结构

```
src/
├── domain/            # 领域模型、规则、仓储接口（纯 TS）
├── application/       # Service 编排业务
├── infrastructure/    # Dexie 实现、JSON 备份
├── presentation/      # 页面、布局、Zustand store
└── shared/            # 路由常量、DI 容器、宠物种类策略
```

更细的模块说明见 [`.cursor/context/`](.cursor/context/CONTEXT.md)。

## License

暂未声明开源协议。默认保留所有权利。
