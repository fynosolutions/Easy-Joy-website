# Easy Joy：可抓取的餐饮网站基础版

这一版优先完成菜单、About、Location、Contact、FAQ 的独立 HTML 页面及搜索可读性。现已接入本地提供的62张菜品素材与宣传视频，文字内容仍可独立阅读。

## 本地运行

需要 Node.js 20 或更新版本，无第三方运行依赖，不用安装 npm 包。

```sh
npm run build
npm run check
npm run preview
```

打开 http://127.0.0.1:4173 。`npm run build:preview` 会生成带 noindex 和 robots 禁止抓取的预览版本；正式上线前运行 `npm run build` 重建。

## 目录与职责

```text
content/
  restaurant.json    名称、NAP、地址、电话、点餐链接、营业信息、主导航
  menu.json          已整理菜单；Popular 为推荐集合，12 个正式分类共 152 条
  pages.json         各页面 metadata 和 FAQ 内容
  about.json         原官网介绍、厨房理念、招牌菜及首页摘要的统一来源
lib/
  site.mjs           共用页头、页尾、菜品卡片、schema、转义函数
  about.mjs          About 页面模板（内容来自 about.json）
scripts/
  build.mjs          首页及各页面布局、路由与静态生成
  check.mjs          数据、HTML、schema、站内链接的构建检查
  serve.mjs          本地预览服务器
assets/
  style.css          品牌颜色、字号、响应式、减少动画、打印样式
  site.js            分类下拉、搜索、热门筛选、分类高亮与回顶；不承载核心正文
  favicon.svg        临时文字标记（正式品牌标识待提供）
docs/
  CONTENT_GAPS.md    需要店方确认的事实及素材
  DEVELOPMENT_PLAN.md 实施内容、发布交接及复用指南
  SOURCES.md         事实与技术参考来源
dist/                生成物；部署时上传此目录，勿在其中直接编辑
```

## 已实现页面

- `/`（Overview）：餐厅定位、菜单推荐、分类入口、到店入口。
- `/menu/`：完整菜单、价格、份数、说明、推荐及售罄快照、分类导航、文本搜索。
- `/menu/<category>/`：12 个分类的独立详情页面和菜品锚点。
- `/about/`：与店方提供的原官网About对齐，展示AYCE火锅、手工点心、食材理念和三道招牌菜。
- `/location/`：地址、电话、路线、每日营业时间。
- `/contact/`：电话联系和第三方在线点餐。
- `/facility/`：到店、用餐、pickup及设施条件咨询信息；不臆造未确认的设施。
- `/faq/`：地址、菜单、pickup、AYCE价格口径、汤底、营业时间和饮食需求。
- `sitemap.xml`、`robots.txt`、`404.html`、`menu.txt`。

页面在源 HTML 中已经包含全部菜单、价格及说明，无需先运行 JavaScript。Restaurant、Menu、MenuSection、MenuItem、Offer 和 BreadcrumbList 使用 JSON-LD，与页面可见信息来自同一数据源。FAQ 提供可读问答，不承诺 FAQ 富媒体结果。

## 内容维护与上线

修改 content 和模板后运行 build/check。店方已确认每日营业时间为纽约当地时间10:00–22:30，restaurant.json 的 hours 与页面同步；取餐时间以点餐平台为准。菜单价格来自 2026-10-20 的在线点餐文本，不代表堂食自助定价。详见 docs/CONTENT_GAPS.md。

当前为本地搭建准备与可预览实现，未连接正式域名，也没有替换旧官网。部署到任何静态站托管时，将 dist 作为网站根目录，启用目录 index.html、自定义 404 和旧 URL 重定向。HTML 页面需要保留静态输出，不能把未知路径一律重写成首页。

## 与原官网统一的视觉与页眉

沿用原官网的米色背景（#f6f0e7）、黑色标题、黄色按钮（#febd2d）以及Inter/Kumbh Sans字体。首页使用原官网已有的背景图；菜单没有新增菜品图片。详情见docs/STYLE_REFERENCE.md。

主导航由content/restaurant.json的navigation配置，Overview、Menu、About、Facility、Location、Contact在桌面和移动端均直接显示；FAQ保留在页脚。

## About 对齐与浏览体验更新

About原文归档在content/about.json的sourceText中。该文件提供About正文、首页摘要和Restaurant结构化数据描述的统一来源；编辑时保留店方提供的事实范围。

菜单支持多关键词搜索、14道热门菜筛选、桌面分类高亮、手机分类选择器和页眉12个分类快捷入口。手机主导航以两行直接展示；分类下拉支持键盘和Esc；动效遵守prefers-reduced-motion。无JavaScript时仍显示全部菜单和分类链接。

## 本地素材接入

- `content/media.json`：62张图片的中英文名称、来源文件、分类、英文alt与菜单对应关系，以及视频配置。
- `content/menu.json`：28道明确对应的现有菜单菜品增加图片字段；原菜单152条、价格、份量和售罄状态保留。
- `/gallery/`：完整英文菜品图集，按点心、火锅、烧烤、饭面粥分类。
- `assets/images/dishes/`：480px与960px WebP图片，总计约4.1MB。
- `assets/video/`：网页视频和真实视频帧封面；原始素材保留于上一级material目录。
- `lib/media.mjs`：首页视频区与图集组件。
- `scripts/prepare-images.py`：按media.json重新处理图片，需要Pillow；普通npm构建不需要Python。
- `docs/ASSET_TRANSLATIONS.csv`与`docs/MEDIA_INTEGRATION.md`：翻译、映射与维护说明。

如果本地服务器已在本次修改前启动，请重启npm run preview，以加载图片/视频MIME与Range支持。

## Vercel

目标团队easy-j-o-y，vercel.json已配置Other静态构建及dist输出。构建命令npm run build:vercel默认生成noindex审阅版本；完成正式域名迁移时设置EASYJOY_INDEXING=production后重建。操作说明见docs/VERCEL_DEPLOYMENT.md。菜单有图优先的稳定排序见docs/MENU_DISPLAY_ORDER.md。
