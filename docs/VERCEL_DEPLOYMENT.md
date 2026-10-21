# Vercel 部署交接

目标团队：easy-j-o-y。用户提供入口：https://vercel.com/new?teamSlug=easy-j-o-y 。

## 构建配置

- 项目根目录：website目录（含package.json、vercel.json、assets、content、lib、scripts）。
- Framework Preset：Other；Node.js 20或更高。
- Build Command：npm run build:vercel。
- Output Directory：dist；Install Command留空，项目无npm依赖。
- vercel.json已配置输出目录、目录尾斜线及nosniff；dist/404.html为404页。
- 本地原始素材位于website外，不上传；仅上传assets中的WebP/视频成品。

## 索引与域名

首次部署至Vercel用于上线审阅，默认带noindex/nofollow与robots禁止抓取，避免与仍在线旧官网产生重复索引。页面canonical仍指向content/restaurant.json的正式品牌域名。

迁移正式域名时，先确认品牌Logo、定价等待办、盘点旧URL并配置重定向；在Vercel中绑定店方确认域名并完成DNS，再将EASYJOY_INDEXING环境变量设为production并重新部署。普通npm run build仍生成正式索引版本。不得把点餐平台的取餐时段当作营业时间。

## CLI路线

在已登录Vercel账号且有目标团队权限时，在website目录执行：

```sh
npx vercel login
npx vercel deploy --scope easy-j-o-y
```

首次关联选择新项目，建议项目名easyjoy-website；保留vercel.json构建设置。获取预览地址后审阅；首次正式项目部署需要时执行npx vercel deploy --prod --scope easy-j-o-y。用户已授权部署，本说明不构成需要重复请求发布授权的步骤。账号登录若缺失，需要用户在Vercel官方页面自行完成；不要在聊天中粘贴密码或Token。

## 网页导入路线

若采用Vercel New Project网页导入，先将本website源码上传至店方选择的Git仓库，再在easy-j-o-y团队下导入仓库。如果仓库根就是website内容，Root Directory选择./；如果仓库包含easyjoy/website等多级目录，选择对应website目录。仓库创建、归属与公开性应由店方指定。

## 部署完成后

记录实际项目名称、团队、deployment URL和访问状态；核对/menu/、12个分类页、/gallery/、404、静态图片、视频Content-Type与Range播放、noindex和canonical。浏览器实际验收与构建成功应分别记录，不得在没有部署返回结果时报告上线成功。

## 实际部署记录

- 团队：easy-j-o-y
- 项目：easyjoy-website
- 固定访问地址：https://easyjoy-website.vercel.app
- 本次部署地址：https://easyjoy-website-bvabxbtco-easy-j-o-y.vercel.app
- 控制台：https://vercel.com/easy-j-o-y/easyjoy-website
- Vercel返回状态：READY（Production alias已分配）。
- Vercel网址目前为noindex审阅版本，尚未切换easyjoybuffet.com域名。
- 本地认证.env文件及.vercel关联目录已排除；不要将其加入源码压缩包或Git。

### 云端构建与访问设置核对

云端日志确认构建完成：20个常规页面路由加404、152道菜、12个分类页面，Mode: preview (noindex)。固定生产别名使用公开访问配置，预览/独立部署URL保留Vercel登录保护（ssoProtection.deploymentType=prod_deployment_urls_and_all_previews）。

从当前执行环境访问固定和独立部署域名均连接超时，未能确认HTTP页面、图片和视频Range响应；浏览器视觉/播放验收待实际打开页面确认。Vercel部署本身已返回READY。
