# 2026-10-28 首页图文与滚动改版

参考用户指定的 https://www.xiaolongkan.com/zh-cn 的布局与滚动展示方式，使用 Easy Joy 品牌、文案和自有素材实现。

## 页面与效果

- 大幅火锅摄影首屏，滚动时轻微位移与淡出；预留横版视频。
- 红底品牌区、循环品牌大字、滚动进入文字与错落三列介绍。
- 六道菜的横向轮播：自动切换、上一项/下一项、键盘方向键、Home/End；鼠标悬停、焦点进入、触摸操作、切出页面时暂停自动播放。
- 自助火锅、手工点心、聚餐环境三个图文场景。桌面窗口足够高时采用 sticky 叠层与图片视差，手机和较矮窗口采用正常滚动。
- 用户提供的入口、环境、火锅和就餐氛围照片全部接入，输出 1920/960px WebP。原图来源见 HOME_IMAGE_SOURCES.json。
- 横版视频占位、真实评价全文、地址地图与点餐链接。
- Pause motion 控件可暂停循环字、自动轮播和视差；系统 reduced-motion 下默认停止非必要动画。无 JavaScript 时内容、菜品横向滚动、链接仍可用。

## 维护入口

- `content/home.json`：首屏图片/可选视频、三个整屏图文场景的图片及焦点位置、两张氛围照片。
- `content/media.json` 的 `hotpotVideo`：首页横版影片区域。
- `lib/home-editorial.mjs`：首页文案和布局；`lib/home.mjs` 保留 Dining 页面共用组件。
- `assets/home.css` / `assets/home.js`：仅首页加载的样式和动态效果，没有新增 npm 运行依赖。
- `assets/video/hero-landscape.mp4`：文件存在时自动接入首屏背景视频，可点击暂停。
- `assets/video/hot-pot-landscape.mp4`：文件存在时自动替换首页横版视频占位符。两个位置也可以通过配置共用同一个视频文件。

## 仍待补充的素材

1. 横版视频，16:9、1920×1080、约15–30秒；适合循环剪辑，不在画面中嵌入大段文字。建议H.264/AAC MP4。已有20秒竖版宣传片仍可在Dining页播放。
2. 点心主题高清横图1–2张，建议至少1920px宽，主体集中在中间或右侧，左侧留空间供文字面板叠加；可用蒸笼组合、出笼蒸汽、手工制作场景。
3. 正式Logo，优先SVG或透明PNG；当前使用文字品牌标记。
4. 可选：6–8张招牌菜更高清原图，目前轮播已使用现有真实菜图。

## 验证

`npm run build` 与 `npm run check` 检查菜单、价格、21个HTML页面、站内链接、文案和页面结构。
`node scripts/browser-qa.mjs` 检查五种宽度、共享页面、导航、菜单筛选、原生视频播放和无JavaScript阅读。
`node scripts/home-motion-qa.mjs` 检查循环字、轮播自动播放与暂停、键盘操作、桌面叠层/视差、手机流式布局、短屏、reduced-motion和无JavaScript横向浏览。
截图与机器结果位于 `docs/redesign-qa/`。

线上地图服务可达性取决于第三方网络；地图加载失败时保留地址与外链。
