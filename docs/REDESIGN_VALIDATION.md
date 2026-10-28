# Easy Joy 本地改版验收 · 2026-10-28

已实施确认方案：红白金配色、Inter 400/600、火锅优先的七区块首页、统一导航与页脚、Dining 环境页面、可展开原文评价。保留 152 道菜单、12 个分类、所有既有路由与菜品锚点。未发布线上。

## 构建与数据

- `npm run build` 与 `npm run check` 通过。
- 21 个 HTML 页面、1073 个站内链接/锚点通过检查。
- 校验菜单价格、份数、售罄快照、结构化数据、官方 About 内容与首页摘要。
- 新增首页区块顺序、六个精选入口、评价全文、AYCE/外卖区别和路径导航选中状态检查。
- 读取本地 TTF 表确认 Inter 为静态 400 与 600 字重，CSS 使用对应声明。
- 预览模式与生产模式分别检查索引配置；最终本地输出沿用 `npm run build` 模式。上线需另行授权。

## 浏览器检查

独立 Headless Chromium；首页及菜单检查 1440、1024、768、390、360px。About、Dining、Location、Contact、Gallery、FAQ 检查 1440 与 360px。未发现横向溢出；首页图片无加载失败，每页单一 H1。

通过：手机导航展开/关闭、Esc 焦点返回、分类菜单、评价全文展开、用户点击播放视频、菜单搜索/清空/14 道热门筛选、禁用 JavaScript 时导航与菜单可读、原生视频控件、减少动态效果设置。浏览器未记录脚本异常。

**限制：Google Maps 嵌入区域在当前验证网络下未成功显示地图，因此未确认地图交互。地址与电话始终可读，Get Directions 和 Open in Google Maps 入口保留。未提交外部订单或拨打电话。**

## 审阅文件

- [桌面首页全页](redesign-qa/home-1440.png)
- [手机首页全页](redesign-qa/home-390.png)
- [360px 首屏](redesign-qa/home-360.png)
- [手机分类菜单](redesign-qa/mobile-navigation.png)
- [机器检查结果](redesign-qa/results.json)

重跑浏览器测试：使用独立无窗口浏览器开放 CDP 端口 9334，确保现有预览服务在 4173，再执行 `node scripts/browser-qa.mjs`。该测试不会修改菜单或线上状态；需要 Node.js、Python 及本机已有的 websockets 包。
