# 2026-10-29 局部修改验收

- 首屏保留火锅与食材主体，使用 AI 替换为暖色灯笼、木质餐厅背景；原照片保留。
- 品牌标题、页头页脚、简介和SEO摘要加入 BBQ Skewers；原始顾客评价、历史来源记录、菜单菜名和价格保持原样。
- 红色循环文字改为三栏菜品介绍，保留一次淡入；其他已存在的首页视差与菜品轮播保留。
- A table full of possibilities 配图换为用户提供的 _25A4705.jpg 门头实拍。
- 两张环境图桌面等宽等高3:2，顶部底部对齐；手机上下排列。
- 全站 Kumbh Sans，使用 Google Fonts 官方100—900可变字重，附SIL OFL许可；中文使用统一系统黑体回退。
- 所有原有点餐按钮统一拆成 Order Pickup（MealKeyway）和 Order Delivery（原生details面板）。三个配送平台链接均核对145 Mulberry St地址。支持键盘、Esc返回焦点、点击外侧关闭及无JS展开；配送状态和费用以平台为准。

## 验证

`npm run build`、`npm run check`通过。浏览器1440、1024、768、390、360px检查通过：无横向溢出、图片可加载、环境照片尺寸与排列符合要求、字体加载正常、配送面板位于屏幕内，三个链接可访问；未下单。各主要内页手机排版检查通过。

测试脚本：scripts/refinement-qa.py（独立CDP 9334、本地预览4173，需要Python websockets）。截图及结果：docs/refinement-qa/。本次仅本地预览，未同步GitHub或发布。

链接：
- https://www.grubhub.com/restaurant/easy-joy-ayce-dim-sum-hot-pot-145-mulberry-st-new-york/12387504
- https://www.ubereats.com/store/easy-joy-dim-sum-hot-pot-buffet-%E6%84%8F%E4%B8%AD%E4%BA%BA%E7%82%B9%E5%BF%83%E7%81%AB%E9%94%85%E8%87%AA%E5%8A%A9-145-mulberry-street/7ObUBkSuUKCK1aTC7nHx_g
- https://www.doordash.com/store/35886623/
