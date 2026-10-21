# 菜单展示顺序

同一类别内有图片的条目在前，无图片的条目在后。两组均按content/menu.json原索引稳定排序；不重写菜单数据顺序、价格、份量或推荐对应关系。总菜单和分类页共用orderedDishes渲染函数。

所有dish锚点和链接仍使用原索引，例如第一道有图菜原本是第12项，排序后仍保留dish-<category>-12。首页特色菜、站内链接和MenuItem.url因此保持稳定。JSON-LD与menu.txt保留原数据顺序，内容和价格一致。

首页从新增others目录精选环境3、环境1、烤串 烤、烤鱿鱼四张实拍；环境照片用于About摘要拼贴，烧烤照片用于影片区域的小图，四图同时进入图集。源文件映射位于media.json的lifestylePhotos，WebP位于assets/images/lifestyle。
