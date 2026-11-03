# EasyJoy 抓取设置与评价发布记录

2026-11-03 · [Vercel 站点](https://easyjoy-website-tau.vercel.app/)

## 已上线的改动

- 预览索引模式下，首页 `/` 和菜单总页 `/menu/` 的 HTML 保留 `noindex, nofollow`。在 robots.txt 中加入 `Allow: /$` 和 `Allow: /menu/$` 两条精确规则，让爬虫能读取这两页的指令。其他路径仍受预览环境的全站禁止抓取规则约束。正式索引模式沿用原配置。
- 首页只渲染 `content/reviews.json` 中 `publicationStatus` 为 `approved` 的评价。原先公开的三条评价保留。维护者录入新评价时可先留空该字段，审核文字和来源后再设为 `approved`，重新构建、发布后才会展示。

## 排查与验证

- 线上 sitemap 包含 20 个指向 `www.easyjoybuffet.com` 的网址，其中 12 个为固定菜单分类页。菜品搜索和热门筛选只改变菜单页内的显示结果，没有独立条目。
- 针对 Vercel 域名的全站及感谢页、分享页定向 `site:` 查询均未返回结果。该抽查不能替代逐网址索引检查。
- 检查构建生成的 21 个 HTML 页面，未发现站内留言、评价或联系提交表单。菜单搜索在浏览器内完成，无需增加提交验证。
- 运行 `npm run build`、`npm run check` 和 `npm run build:vercel`。另外向渲染函数传入缺少状态、待审及拒绝状态的测试评价，确认测试文字均未进入首页 HTML。
