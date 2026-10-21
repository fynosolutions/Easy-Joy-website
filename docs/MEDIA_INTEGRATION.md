# 本地图片与视频接入

## 素材与翻译

原图：`../material/photos/menu/`，62张PNG，约145MB。原视频：`../material/video/promotionalvideo.mp4`，20秒、1080×1920竖屏、带音轨，约31MB。所有原文件保留，网站使用派生文件。图片中英文对照和现有菜单匹配见ASSET_TRANSLATIONS.csv，渲染数据源见content/media.json。

全部62张图在/gallery/以英文名称展示，涵盖粥类与原价格菜单之外的菜品，不添加未经提供的价格。古发（鲮鱼烧卖）按括号内菜品翻译为Dace Fish Siu Mai；番茄烫套餐按汤锅内容翻译为Tomato Mini Hot Pot Set。图集名称不自动表示当前可点餐或有确定价格。

28道现有菜品配图，同步用于菜单、分类页和MenuItem.image。价格、份数、原菜单分类及售罄状态不变。图片与菜单的份数有冲突时保持图集展示：烤鸡肉6串/菜单5串；烤生蚝2个/菜单3个；鸡翅2串/菜单3个；鸡肉饺4个/菜单8个。拼盘照片不替代单一虾饺或烧卖菜品；鲜虾腐皮卷不替代未注明馅料的腐皮卷；生煎包不猜测牛肉馅。

## 首页与视频

参考https://zenramensushiny.com/的独立Inside Zen/Play the film区域，保留Easy Joy米金黑配色。首页新增深色视频区、英文介绍、两张食物静态照片与右侧完整竖屏播放器。封面取自原片14秒附近的火锅餐桌画面；点击播放，保留原生播放/音量/全屏控制，playsinline、preload=none，不自动播放或自动出声。无JavaScript时仍可通过原生播放器观看。

首页特色菜使用已有明确照片的Soup Dumplings、Beef Chow Mein、Coconut Chicken Mini Hot Pot，链接进入对应有价菜单条目；手机端小图横排。首页另展示六张精选照片并链接完整图集。图集入口位于菜单介绍与全站页脚。

## 性能与维护

PNG转为480/960两档WebP，含英文alt、显式尺寸、懒加载与srcset，总计约4.1MB。原视频使用AVFoundation导出网页版本并优化网络起播，桌面720×1280版本约18MB，手机320×568版本约2MB，均为20秒；按设备宽度选择视频源，尺寸以content/media.json为准。服务器支持video/mp4、image/webp、HEAD与HTTP Range，静态托管时也应支持正确MIME与Range。

重新处理图片：在含Pillow的Python环境执行scripts/prepare-images.py。视频与封面以assets/video路径维护，普通构建直接复制成品。更换图片后同步更新media.json与对应menu.json图片字段。

本轮完成静态构建；没有可用浏览器控制工具，未完成浏览器视觉与播放交互验收。
