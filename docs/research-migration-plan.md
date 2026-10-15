# 科研主页迁移计划（临时工作文档）

状态：本地迁移初版及验证已完成，待视觉确认与正式发布。建立日期：2026-10-14。

## 目标与约定

- 将独立科研站的内容迁入当前 Astro 仓库，使用 Juniverse 的背景、Logo、导航和深浅色主题。
- `/research/` 和 `/research-page/` 都可以直接打开科研主页，复用同一个组件和同一份数据；`/research/` 为主要地址。
- 完整论文列表使用 `/research/publications/`，保留旧站论文列表地址的兼容入口。
- 保留介绍、研究方向、招聘信息、教育、工作经历、动态、全部论文及其外部链接；不改写学术事实。
- 论文采用紧凑列表，科研正文优先保证阅读体验；首页和摄影相册保持现有结构。
- 本阶段只进行本地迁移与验证。发布和旧仓库 Pages 配置调整单独处理。

## 第一步：核对来源与内容

- [x] 核对旧仓库源码和线上主页、完整论文列表。
- [x] 记录全部内容、图片、下载文件和旧地址。
- [x] 确认代表论文与完整论文列表共用的数据来源，避免重复录入。

## 第二步：主题与双入口

- [x] 建立科研共享页面组件，使用当前 BaseLayout 和导航。
- [x] 实现 `/research/`、`/research-page/` 双入口，避免原有跳转形成循环。
- [x] 迁移个人介绍、研究方向、招聘信息、教育和工作经历。
- [x] 设置标题、描述、canonical 和导航激活状态。

## 第三步：论文与动态

- [x] 建立带类型约束的论文和动态数据。
- [x] 迁移代表论文、全部论文及作者、年份、会议、共同贡献说明和链接。
- [x] 实现完整论文列表及旧地址兼容。
- [x] 迁移需要的静态资源，移除对旧站主题和路径的依赖。

## 第四步：验证与交付

- [x] 检查两个科研入口、论文列表、旧地址及首页导航。
- [x] 检查桌面、手机、深浅色模式、图片和外部资源链接。
- [x] 运行格式、Astro 检查、生产构建和相关路由测试。
- [x] 更新 AGENTS.md 中科研路由与维护约定。
- [x] 给出本地预览地址，列出待发布事项和未解决的问题。

本地预览：

- 科研主页：<http://127.0.0.1:4321/research/>。
- 兼容主页：<http://127.0.0.1:4321/research-page/>。
- 完整论文：<http://127.0.0.1:4321/research/publications/>。
- 无结尾斜线的 `/research` 和 `/research-page` 也已验证可访问。

## 发布前事项

- 检查旧 `research-page` 仓库的 Pages 是否仍然独立发布同一路径。
- 正式发布前处理旧站与当前站的路径归属，验证线上两种入口。
- 旧仓库可保留为历史存档；不在迁移过程中删除。

## 执行记录

- 2026-10-14：创建计划。创建时 `/research/` 仍跳转至独立科研站，现已替换为本地页面。
- 已核对源码：[ba1jun/research-page](https://github.com/ba1jun/research-page)，提交 `0bd2d0f3301e9d871c08c5cb6bf81c223472e5aa`。
- 从 `_data/profile.yml`、`_publications/`、`_news/` 迁入个人资料、21 篇论文（7 篇代表论文）及 5 条动态。逐条比对了论文标题、作者、标记、链接、会议、年份、日期和代表论文标志。
- 论文封面转换为最长宽度 800px 的 WebP，总大小从 14,585,741 字节降至 931,416 字节。旧科研头像和 6 个机构 Logo 保留，静态资源位于 `public/research/images/`。
- 介绍位于 `src/data/research/bio.md`；资料、论文和动态分别位于同目录的 `profile.json`、`publications.json`、`news.json`，类型与派生列表位于 `index.ts`。
- `/research-page/publications/` 直接展示完整论文列表；旧 `/research-page/publications.html` 静态跳转至 `/research/publications/`。
- 保留旧站的学术内容，不迁入模板调试提示、访客计数器和模板专用脚本。修正两条动态链接末尾的重复斜线，保留原链接指向。
- Astro 检查通过：0 错误、0 警告，8 条原有提示。格式检查通过。
- 最终生产构建和 Pagefind 索引构建通过。受限网络首次构建无法获取旧摄影资源；允许联网后正常完成。
- 构建后运行首页、科研、导航、主题、搜索、SEO 和无障碍相关测试，共 47 项通过。搜索去重修正后再次运行科研及搜索 13 项测试，全部通过；`Xetrieval` 只返回 `/research/` 和 `/research/publications/`，不重复列出兼容地址。
- 425 项内部链接及资源检查通过，包含科研双入口、完整论文、旧 `.html` 地址和年份锚点。既有 `lint:links` 使用的 `--skip-external` 不被当前 Hyperlink CLI 识别，本次改用实际支持的 `--internal --canonicalroot https://ba1jun.github.io --recursive` 完成核验，未更改项目脚本。
- 新科研正文及旧 `.html` 跳转页通过 HTML 校验。整页校验仍有共享组件的原有问题：按钮缺少 `type`、按钮内使用 `div`、搜索组件内联样式；四个科研整页各 8 项，共 32 项。未扩展本次迁移去重构这些组件，完整 HTML 质量门禁尚未全绿。
- 旧站未配置 CV 下载链接，资源目录未发现 PDF；没有遗漏需迁入的 CV 文件。旧摄影 showcase 不在旧站导航中启用，当前摄影内容继续由 `/photography/` 维护。
- 2026-10-14：按用户反馈移除学术主页的个人照片及照片分享元信息；保留源图片文件。教育与任职经历的位置暂不调整，先讨论排版。修正开发环境无结尾斜线 `/research` 的导航激活状态。
- 2026-10-14：按确认后的方案实现顶部两栏：800px 起左侧简介与研究方向占约 2/3，右侧教育及任职经历占约 1/3；经历列表使用更紧凑的字号、图标和间距。手机按简介、教育、任职、News、论文的顺序排列，News 与论文保持全宽。桌面、800px 平板、375px 手机及深色截图与实际布局边界检查通过，科研 9 项测试和 Astro 检查通过。
- 本轮布局调整后的生产构建、Pagefind 索引和科研正文 HTML 校验通过；既有共享组件的 HTML lint 问题仍保留在上述记录中。本地开发服务已恢复，继续使用 4321 端口。
- 2026-10-14：公共菜单增加 Home，摄影与科研页可由菜单返回首页。全站浏览器标题统一为 Juniverse，页面内容、OpenGraph、Twitter 与搜索结果继续保留各自标题。生产构建后的 112 个 HTML 页面均已核验标签页标题；21 项首页、导航与科研测试通过，CV 标题及搜索结果标题另行核验通过。
- 2026-10-14：首页主题切换移至右上角，三个主入口仍位于简介下方。版权统一由 `Copyright.astro` 输出，首页、共享页脚和 CV 复用同一份文字及字体。生产构建通过，111 个内容页面均有且仅有一份一致的版权，旧 `.html` 即时跳转页不展示页脚。28 项首页、科研、导航、主题及 CV 测试通过。
- 2026-10-15：首页改为两个主要入口（Research、Photography）和独立的个人外链行（Google Scholar、GitHub、X、LinkedIn、Email）。外链从现有个人资料派生，X 使用原 Twitter 账户地址及本地 SVG 图标。科研双入口仅保留 Scholar 与 Email 快捷链接，论文各自的资源链接保留。桌面、手机显示检查、18 项首页/科研/主题测试、Astro 检查、格式检查及生产构建通过；构建产物已核验首页两组链接和科研双入口快捷链接。
- 2026-10-15：移除 Xetrieval 和 OneMillion-Bench 的发布新闻，新增两条录用新闻，使用会议官方通知日期：OneMillion-Bench 为 [NeurIPS 2026 Evaluations and Datasets Track 的 9 月 24 日](https://neurips.cc/Conferences/2026/CallForEvaluationsDatasets)，CircuitLens 为 [EMNLP 2026 的 8 月 20 日](https://2026.emnlp.org/calls/main_conference_papers/)。按 [CircuitLens 的 arXiv 信息](https://arxiv.org/abs/2609.07183) 标注 EMNLP Findings，补入精选及完整论文列表，并将论文方法示意图压缩为 800px WebP（约 69 KiB）；同步更新 OneMillion-Bench 会议信息。现有 5 条新闻、8 篇精选论文、22 篇完整论文。9 项科研测试、桌面与手机显示检查及生产构建通过。
- 2026-10-15：Xetrieval 移出精选，保留在完整列表；新增 [Belief Context Graph](https://github.com/bigai-nlco/belief-context-graph) 项目到精选及完整列表，并按 [Workshop 官方通知日期 9 月 29 日](https://resource-aware-workshop.github.io/) 添加 NeurIPS 2026 Workshop on Resource-Aware Agentic AI 录用新闻。论文未公开，暂用项目名、简介及 Code/Website/Docs 链接，不推测论文作者或提供 Paper 链接；封面来自官方仓库 `assets/architecture.svg`，压缩为 800px WebP（约 47 KiB）。Star 数初始快照为仓库当天显示的 222，浏览器请求 GitHub API 更新，缓存一小时，失败时保留快照；无 JavaScript 仍可读。现有 6 条新闻、8 篇精选、23 篇完整条目。11 项科研测试、Astro 检查、桌面/手机/深色视觉检查、生产构建、生产环境的 2 项 star 行为测试及科研正文 HTML 校验通过。
- 2026-10-15：为 [Native Parallel Reasoner](https://github.com/bigai-nlco/Native-Parallel-Reasoner)、[OneMillion-Bench](https://github.com/humanlaya/OneMillion-Bench)、[RouterLens](https://github.com/bigai-nlco/RouterLens)、[TongSearch-QR](https://github.com/bigai-nlco/TongSearch-QR) 增加 Star 展示，核验快照依次为 112、54、29、44，复用现有自动更新与回退组件。精选数据增加 `acceptedDate`，按录用通知日期降序排列，同日保持源文件顺序；原 `date` 及完整列表顺序保留。排序为 BCG → OneMillion-Bench → CircuitLens → NPR → RouterLens → TongSearch-QR → AiRTran → Survey。前述 2026 日期沿用官方来源，NPR 使用 [ICML 2026 通知日 4 月 30 日](https://icml.cc/Conferences/2026/Dates)；两篇 EMNLP 2025 工作使用 [8 月 20 日](https://2025.emnlp.org/calls/main_conference_papers/)，AiRTran 使用 [EMNLP 2024 的 9 月 20 日](https://2024.emnlp.org/calls/main_conference_papers/)，Survey 使用 [EMNLP 2023 的 10 月 6 日](https://2023.emnlp.org/)。11 项科研测试、Astro 检查及生产构建通过。
- 2026-10-15：科研主页仅显示最新 5 条 News，保留 `news.json` 中全部 6 条记录；页面顶部与 BIGAI 任职经历同步更新为 Senior Research Engineer。邮箱暂保留 Email 文本和可点击的 `mailto:` 链接。11 项科研测试、格式检查及生产构建通过，构建产物已核验两处岗位文字与科研双入口的新闻数量。
- 2026-10-15：首页与科研双入口的中文姓名统一使用思源宋体 SC Medium 派生的本地字库，字号为 18–20px，字距 0.06em，透明度 85%。只提取“白骏”两字生成 2,220 字节 WOFF2，按 OFL 要求重命名并保留许可证，来源与版本记于 `public/fonts/README.md`；共享样式位于 `src/styles/chinese-name.css`。已通过浏览器实际字形检查（自定义字体、两个字形）、桌面/手机/深色视觉检查及 17 项首页与科研测试。检查时同步将首页简介的岗位改为读取个人资料，显示 senior research engineer，追加 6 项首页验证通过。
- 2026-10-15：全站浏览器标题常量 `SITE_TITLE` 改为 `Jun Bai's Homepage`，同步首页元数据与站点默认名称，保留各页面独立的分享及 Pagefind 标题。生产构建通过，全部 112 个 HTML 页面的 `<title>` 已核验；生产环境中 32 项首页、科研、CV 与 SEO 测试通过。
- 2026-10-15：首页简介替换为用户提供的两段文字，以“By day, I try to make language models and agents a little more trustworthy.”开头，以“Curious about how machines think, how light falls, and everything in between.”收尾。中文姓名改为与英文名的字形底部对齐，通过轻微的基线补偿处理宋体下探；桌面、手机与深色模式检查及 6 项首页测试通过。
- 2026-10-15：最终首页欢迎语为“Welcome to 🌌 Juniverse!”，与正文使用相同字体、字号及字重；保留现有个人 Logo，三份 Juniverse 概念图作为设计参考存于 `docs/design/juniverse-logo-concepts/`。发布前的生产构建、Astro 检查与改动文件格式检查通过；完整 Playwright 套件为 98 项通过、1 项因缺少 blockquote 内容按既有规则跳过，428 项内部链接检查及四个科研页面正文的 HTML 校验通过。远程旧 `redesign/revista` 历史已与当前本地分支分叉，因此本次使用新分支 `redesign/juniverse-homepage`，保留旧远程分支；线上部署仍由 `main` 触发。
