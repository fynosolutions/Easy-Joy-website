# 内容与技术来源

- 已核对菜单：店方复制的MealKeyway页面文本，菜单快照日期2026-10-20。原始文本：`docs/menu-source-2026-10-20.txt`（已归档店方提供的文本）。本项目的content/menu.json来自已整理菜单JSON。
- 旧官网名称/位置/电话：https://www.easyjoybuffet.com/
- 店方确认的官方点餐入口：https://order.mealkeyway.com/customer/release/index?mid=35554f7339436751782f466c5152626a423569654a773d3d#/main
- Google：AI features and your website：https://developers.google.com/search/docs/appearance/ai-features
- Google：Search Essentials：https://developers.google.com/search/docs/essentials
- Schema.org Restaurant：https://schema.org/Restaurant
- Schema.org Menu：https://schema.org/Menu

GEO的执行重点：可访问的正文、菜单价格、明确问题答案与一致的餐厅信息。结构化数据必须与可见文本一致；技术优化不保证被任何AI检索系统收录或推荐。

- About事实来源：店方在本对话中提供的旧官网完整介绍；原文归档在content/about.json的sourceText中。首页摘要和About保持同源。

## 用户指定的制作参考

- 旧官网与品牌来源：https://www.easyjoybuffet.com/
- Hey Noodles：https://heynoodles.com/
- Frydom Express：https://frydomexpress.com/en/
- Zen Ramen & Sushi：https://zenramensushiny.com/
- 代码参考：https://github.com/fynosolutions/zen-ramen-sushi-v2

参考范围、品牌要求与完成验收统一见DEVELOPMENT_PLAN.md。

## 旧站 Google Review 迁移

2026-10-20用户提供旧官网Google Review区的完整截图，按截图恢复三条完整评论（含原文段落与各条五星展示），内容维护在content/reviews.json。评论中的口语、大小写与语法保持引文原貌，未作为网站自述改写。旧站来源：https://www.easyjoybuffet.com/ 。未补造评论者姓名、头像、日期、评论数量或餐厅总评分；不输出Review或AggregateRating结构化数据。五星仅表示截图中各条评论所展示的星级。

原站地址链接 https://maps.app.goo.gl/HgKMhWXqBt28XdHA9 用作Google Maps入口，不承诺直达评价标签。页面说明这些评论沿用旧官网，非Google实时同步；评论中提及的历史菜品与价格不作为当前菜单或定价承诺。正式上线前建议补充各条评价的Google永久链接与作者信息，或配置有权限的评价服务。

- 营业时间：店方于2026-10-20在本对话确认 Mon - Sun: 10:00 AM - 10:30 PM，使用纽约当地时间；与原官网一致。此确认覆盖此前待核实状态，取餐时段仍以点餐平台为准。

## 新增本地媒体来源

店方提供的../material/photos/menu/中62张PNG与../material/video/promotionalvideo.mp4，已查看图片总览及视频候选封面。翻译与映射见ASSET_TRANSLATIONS.csv，网页媒体配置见content/media.json。视频参考https://zenramensushiny.com/的Inside Zen/Play the film独立影片区域，Easy Joy采用适配本地竖屏片源的左右分栏。
