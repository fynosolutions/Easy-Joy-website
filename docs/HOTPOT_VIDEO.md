# 首页火锅横版视频

首页 Come for the food / Stay for the feeling 区域预留 16:9 横版视频。没有视频时显示静态占位符，不请求不存在的视频文件。

## 放入本地视频（推荐）

1. 准备适合网页播放的横版 MP4，建议 1920×1080 或 1280×720，H.264 视频与 AAC 音频。压缩后再上传，单文件需符合 Vercel 当前上传限制。
2. 将文件放入 `assets/video/`，命名为 `hot-pot-landscape.mp4`。
3. 重新构建/部署：构建会自动识别该文件，将占位符替换为原生视频播放器。移除文件后重新构建即可恢复占位符。

## 自定义文件或托管视频链接

编辑 `content/media.json` 中的 `hotpotVideo`：

```json
{
  "src": "https://your-cdn.example/hot-pot.mp4",
  "poster": "/assets/images/hot-pot-landscape-poster.webp",
  "title": "Easy Joy hot pot experience",
  "caption": "A moment at the Easy Joy table."
}
```

`src` 支持站内 MP4 路径或可直接访问的 HTTPS MP4 地址，不能填视频网站观看页链接。非空 `src` 优先于约定文件路径；留空时使用自动识别。`poster` 为可选封面，没有封面时保留空字符串。播放器按用户点击播放，支持手机行内播放与原生控件，不自动下载整段视频。

此网站为静态站点，上传通过项目文件和重新部署完成；首页占位符不作为访客上传入口。已有的竖版餐厅宣传视频保留在 Dining 页面。首屏背景视频可放入 assets/video/hero-landscape.mp4，或配置 content/home.json 的 hero.videoSrc。

## 2026-10-30 视频接入

- 来源：店方提供的 `0727意中人1.2.mp4`，原片约 597 MB，3840×2160，30 fps，时长 2:48.28。
- 首页 At the Easy Joy table 占位区已接入完整视频，保留音频和时长，不自动播放，使用原生控件与手机行内播放。
- 网页文件：`assets/video/hot-pot-landscape.mp4`（1080p）和 `hot-pot-landscape-mobile.mp4`（720p）；H.264 / AAC，faststart。
- 封面提取自视频第 10 秒，`hot-pot-landscape-poster.webp`。提供直接打开视频的备用链接。
- 原始视频和临时转码工具不提交到 GitHub、不部署。
