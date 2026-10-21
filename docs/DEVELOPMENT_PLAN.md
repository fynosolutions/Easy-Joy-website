# Easy Joy 建站执行与复用说明

## 项目网址与参考范围（执行时必读）

| 角色 | 完整网址 | 执行用途 |
|---|---|---|
| 旧官网与品牌来源 | https://www.easyjoybuffet.com/ | 品牌配色、原有Logo元素、餐厅介绍与现有URL迁移盘点 |
| 参考网站一 | https://heynoodles.com/ | 用户指定的导航、内容组织及动效参考；实施前实际浏览并记录采用部分 |
| 参考网站二 | https://frydomexpress.com/en/ | 用户指定的页面与交互参考；实施前实际浏览并记录采用部分 |
| 参考网站三 | https://zenramensushiny.com/ | 用户指定的餐饮站结构与动效参考；实施前实际浏览并记录采用部分 |
| 参考代码项目 | https://github.com/fynosolutions/zen-ramen-sushi-v2 | 参考代码组织和可复用组件；使用前检查许可、依赖与实际实现 |

参考站提供结构与交互参考。Easy Joy的品牌视觉以旧官网为准；所有餐厅事实采用Easy Joy确认资料。上表记录参考用途，不代表所有参考站已完成逐项实现比对。

## 品牌实施要求与当前状态

- 全站主背景采用旧官网米色 `#f6f0e7`，主按钮金黄色 `#febd2d`，主要文字黑色，导航白底，页尾深色。现有米金渐变使用同一色系。
- 字体沿用旧站Inter与Kumbh Sans；导航直接展示Overview、Menu、About、Facility、Location、Contact。
- 用户已明确要求使用旧官网Logo元素。正式页头、页脚和favicon必须使用核实后的品牌资产；保持原比例、原色与透明背景，深色底适配使用店方提供的版本。
- 当前页眉/页脚是临时文字标识，favicon也是临时标识，原Logo替换尚未完成。
- 旧官网HTML中的Logo图片地址为 `https://website-cdn.menusifu.com/public/images/Transparent+Logo.png`；本次网页读取返回403，尚不能确认图像实际内容及是否为有效品牌Logo。不得将通用透明占位图当作正式Logo。
- 后续执行者应先核查旧站可访问的Logo资源；若无法获取有效资产，再向店方索取SVG或透明PNG。资产登记建议放在 `assets/brand/`，来源、尺寸和使用位置写入STYLE_REFERENCE.md。

## 完成验收

- 执行文档包含以上五个完整网址，并记录实际参考部分与差异。
- 页头、页脚、favicon完成品牌资产替换，桌面/手机比例正确、深浅背景清晰可读。
- 首页渐变、紧凑特色菜布局、导航和菜单筛选在手机/桌面可用，减少动态效果设置生效。
- 菜单、About及到店信息在源HTML可读；菜单价格与JSON-LD、menu.txt同步；核心信息不依赖JavaScript加载。
- 现有152条菜单、12个分类及菜品锚点保持完整；营业时间已由店方确认每天10:00–22:30；AYCE价格及其他待确认项按CONTENT_GAPS.md处理。
- 预览环境noindex与正式环境索引配置分开；发布前盘点旧URL并逐条建立重定向映射。

## 本期目标

先建立能被顾客阅读、搜索引擎和AI检索系统读取的内容主体。菜品图片后续加入；内容结构和可抓取性在本期落地。菜单、关于、Facility、地点、联系与FAQ是独立网址，12个菜单分类也有独立页面。不要把可见正文和价格只放在JS、图片、PDF或第三方点餐页面里。

## 内容边界

- 152条正式菜单数据，14道Popular只作标记，不重复计算。
- 菜品的售罄为2026-10-20文本快照：Mystery Box Set、Grilled Oysters、Fried Mini Dough Stick。
- 不把源菜单里不同份数/不同分类的近似名称盲目合并，例如点心Fried Milk Custard(4pc)为$3.99，Hot Pot Delivery同名无份数项为$4.99。
- 保留供应范围和过敏原的不确定性；菜名中的Vegetarian和选项说明不能推导整道菜无过敏原或严格满足饮食要求。
- Restaurant/菜单schema只表达页面可见事实；不虚构评分、评论、坐标、营业时间、priceRange或预订可用性。
- 不把schema、llms.txt或关键词堆叠当作AI推荐保证。本期的基础是完整HTML内容、清晰URL、内部链接和一致实体信息。

## 部署前后工作

1. 店方审阅内容并解决CONTENT_GAPS中的必需项。
2. 设置content/restaurant.json的正式domain。域名是canonical和sitemap的唯一来源。
3. 本地执行 `npm run build` 和 `npm run check`。上线预览域名可改用build:preview，正式站重新build。
4. 部署dist文件到静态托管的站点根目录；配置目录URL、404和旧站URL重定向，保留第三方点餐链接。
5. 真实部署后验证公开页面HTTP 200、源HTML正文、JSON-LD、sitemap、robots、canonical与电话/路线/点餐链接。
6. 在站长平台提交sitemap，检查网站抓取与索引；按实际账号权限处理Google Business Profile等外部资料一致性。
7. 以抓取成功、索引覆盖、菜单页展示/点击和点餐/电话转化为观测指标。AI系统是否引用及何时更新还取决于其自身抓取与检索策略。

## 后续图片接入

图片路径建议 `assets/images/<category>/<dish>.webp`，原图单独归档。menu.json条目增加image、alt、width、height，dish渲染组件读取这些字段；无图条目继续保持当前文本布局。不要通过不同页面各自维护图片与菜名来制造多份数据。

## 复用到其他餐饮项目

1. 将本目录复制到一个新的独立餐厅目录，移除dist后重建。
2. 替换content/restaurant.json中的品牌、domain、地址、电话、点餐与地图链接，清空未确认营业时间。
3. 替换content/menu.json菜单和推荐分组；sourceCount必须与items实际数一致。
4. 替换content/pages.json的页面metadata与FAQ。About叙事位于content/about.json，由lib/about.mjs渲染；首页和其他页面的部分叙事仍位于scripts/build.mjs，需要按新餐厅事实改写，不可仅换Logo后直接复用。
5. 在assets/style.css调整颜色、字体与版式；核心菜品组件、菜单schema和检查脚本可复用。
6. build/check后搜索旧品牌、旧域名、旧电话残留，再进入发布流程。

下一次复用如果出现第二家以上餐厅，再将scripts/build.mjs内品牌叙事提取为统一的页面section数据模型。本版本先保持轻量且可审阅，避免在事实资料仍不完整时建立复杂CMS。

## 首页评价模块

首页在分类入口之后、到店信息之前展示Google Review完整评论区，沿用旧官网米金配色。数据来自content/reviews.json，HTML在构建时生成，Google Maps地址统一维护于content/restaurant.json。按用户提供截图恢复旧站三条完整评论和各条五星，清楚标注来源及非实时状态；后续替换为经核对的评价数据。不得将展示条数当作Google评论总数，或将旧站展示的星星推导为餐厅整体评分。

## 地图模块

首页底部与Location页共用lib/map.mjs生成Google Maps iframe，按restaurant.json地址定位。首页配合深色联系信息区，地图延迟加载，并保留独立Google Maps链接；地址和电话始终在静态HTML中可读。地图内容需要访问Google服务，本地构建通过不代表第三方地图已在浏览器加载成功。营业时间由店方确认每天10:00–22:30（纽约当地时间），统一使用restaurant.json的hoursMessage与hours字段。

## 本地素材阶段（已接入）

此前菜品图片延后要求已由店方本轮接入要求更新。62张图片翻译与WebP版本、28道有价菜单配图、英文/gallery/图集、首页精选图和独立宣传视频区现已实现。视频以Zen Ramen & Sushi的独立影片入口为交互参考，按本片竖屏比例设计；不改变Easy Joy配色。细节和份数冲突见MEDIA_INTEGRATION.md，后续复用替换media.json和素材目录即可。

## 本轮菜单与实拍优化、Vercel部署

菜单与分类页有图条目优先、两组内保留原序，锚点保留原索引；见MENU_DISPLAY_ORDER.md。首页加入四张精选店内/烧烤实拍，原图与网页图来源映射写入media.json。Vercel easy-j-o-y团队部署设置见vercel.json和VERCEL_DEPLOYMENT.md。
