# Easy Joy 原官网视觉对齐记录

观察来源：https://www.easyjoybuffet.com/ （2026-10-20）

原官网公开样式中的主要值：

- 页面背景：`#f6f0e7`
- 主按钮：`#febd2d`，黑色文字；悬停反转为黑底黄字
- 主要标题：黑色，Kumbh Sans 700
- 正文与导航：Inter，正文400、导航600
- 导航背景：白色，页尾黑色/深灰

本次已将这些元素用于所有页面。保留新增的静态HTML菜单、结构化数据、分类详情、内部链接和问答内容。页头使用文字品牌标识，没有把临时红色圆印当作原有Logo。

导航入口：Overview → 首页 `/`；Menu → `/menu/`；About → `/about/`；Facility → `/facility/`；Location → `/location/`；Contact → `/contact/`。FAQ位于页尾。所有入口在手机上也直接展示。

Facility页面的设施咨询文案不表示确认存在停车场、Wi-Fi、无障碍设施或指定座位容量。待店方提供信息后，应替换成明确的事实条目。

复用的已有资源（首页背景，不是新增菜品图片）：

- `hero-original.jpg`：https://www.easyjoybuffet.com/wp-content/uploads/easyjoybuffet.com/2025/08/AdobeStock_1537341418.jpeg
- `inter-regular.ttf`：https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf
- `inter-semibold.ttf`：https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf
- `kumbh-sans-bold.ttf`：https://fonts.gstatic.com/s/kumbhsans/v27/c4mP1n92AsfhuCq6tVsaoIx1LQICk0boNoq0SjlDfnzKo-bF3mdQdpEA8Q.ttf

## 本次品牌要求确认

用户要求全站配色及Logo元素延续旧官网。现有配色已经采用旧站色值；页头、页脚文字标识和临时favicon尚需替换。旧站HTML的Logo资源地址为https://website-cdn.menusifu.com/public/images/Transparent+Logo.png，本次网页读取返回403，资源内容未核实；必须核查有效原资产或取得店方原文件后接入。完整网址清单和验收见DEVELOPMENT_PLAN.md。
