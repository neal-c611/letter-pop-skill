<p align="right">
  <a href="./README.md">English</a> · <strong>简体中文</strong>
</p>

# Letter Pop

一个 Agent Skill，用于把现有网页中的指定文字变成逐字图片替换交互。默认状态保留网页原本的字体；鼠标悬停、触摸或键盘聚焦时，每个字形会变成独立的视觉对象，并让周围文字平滑腾出空间。

这套工作流来自 [OpenAI ChatGPT Images 2.5 发布页](https://openai.com/index/introducing-chatgpt-images-2-5/)的交互形式，并已适配 React、Next.js、Vue、Svelte 和原生前端项目。

在线 Demo 使用固定图片，以保证加载速度和效果一致。Skill 用于新的文字或项目时，默认会为本次任务重新生成素材。如果结果中有不满意的部分，可以保留已经认可的字形，只让 Agent 重新生成某个字、标点或整套视觉方向。

## 在线 Demo

在[互动演示页面](https://neal-c611.github.io/letter-pop-skill/)中体验鼠标悬停、触摸和键盘操作。同一套图片被放进三种不同的排版环境，用来展示 Letter Pop 会继承宿主网页的字体。

| 无衬线 / 中英混排 | 编辑感衬线体 | 紧凑 CJK |
| --- | --- | --- |
| [![无衬线 Demo：Hello, 我是Neal](docs/previews/demo-sans.png)](https://neal-c611.github.io/letter-pop-skill/#sans) | [![衬线体 Demo：Hello, Neal](docs/previews/demo-serif.png)](https://neal-c611.github.io/letter-pop-skill/#serif) | [![紧凑 Demo：我是Neal](docs/previews/demo-compact.png)](https://neal-c611.github.io/letter-pop-skill/#compact) |

## 能做什么

- 在现有代码中找到指定文字，只修改目标位置。
- 保留宿主网页原有的字体、字号、字重、颜色、语义、换行和断点。
- 按字形出现的位置规划素材，支持重复字母、中文、Emoji 和组合字符。
- 让标点保持较小的视觉尺寸和自然的基线位置。
- 生成或接入透明背景图片素材。
- 使用稳定的命中层，避免字形放大后造成悬停抖动。
- 支持鼠标、触摸、键盘焦点和 `prefers-reduced-motion`。
- 在真实页面中检查素材加载、控制台错误、换行和移动端溢出。

## 安装

### Codex

让 Codex 直接从 GitHub 安装：

```text
$skill-installer install https://github.com/neal-c611/letter-pop-skill
```

也可以手动克隆到 Agent 的全局 Skill 目录：

```bash
mkdir -p "$HOME/.agents/skills"
git clone https://github.com/neal-c611/letter-pop-skill.git \
  "$HOME/.agents/skills/letter-pop"
```

部分 Codex 安装使用 `$CODEX_HOME/skills`。使用默认 Codex 目录时，命令如下：

```bash
mkdir -p "$HOME/.codex/skills"
git clone https://github.com/neal-c611/letter-pop-skill.git \
  "$HOME/.codex/skills/letter-pop"
```

### WorkBuddy

安装为用户级 WorkBuddy Skill：

```bash
mkdir -p "$HOME/.workbuddy/skills"
git clone https://github.com/neal-c611/letter-pop-skill.git \
  "$HOME/.workbuddy/skills/letter-pop"
```

重启 WorkBuddy 或新建一个对话，然后使用 `/skills` 确认 `letter-pop` 已加载。

需要生成新字形时，请确认 WorkBuddy 的 `ImageGen` 工具已经启用，并允许它提出的工具授权。Kimi-K3 的视觉能力可以理解图片，实际生成图片由独立的 `ImageGen` 工具完成。Letter Pop 现在会在长任务开始前检查这项能力，并用一次批量生成完成首稿，避免每个字分别调用一次生图。

### 不使用 Git 下载

下载仓库 ZIP：

```text
https://github.com/neal-c611/letter-pop-skill/archive/refs/heads/main.zip
```

解压后把文件夹改名为 `letter-pop`，再放入 Agent 的用户级或项目级 Skill 目录。

## 使用

```text
$letter-pop

项目：/path/to/my-website
页面：/about
目标：.hero-title
文字："Hello, 我是Neal"

把这段文字改成逐字图片悬停效果。保留现有字体、字号、颜色和响应式布局。
标点要小一些。桌面端使用 hover，触摸设备使用 tap，完成后运行页面并验证效果。
```

如果文字在页面中只出现一次，通常提供页面路径和准确文字就够了。同一句文字出现多次时，可以补充选择器或源组件位置。

## 运行要求

Skill 本身没有运行时依赖。创建新的字形素材需要图片生成能力，或者由用户提供透明背景素材。建议使用浏览器自动化验证视觉效果。如果生成结果是字形图集，可以选择使用 ImageMagick 或其他图片工具进行确定性裁切。

## 文件结构

```text
letter-pop-skill/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── references/
    ├── artwork-generation.md
    └── implementation-pattern.md
```

## 许可证

MIT
