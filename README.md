# AI 网页总结助手 (Chrome Extension)

这是一个 Chrome 浏览器扩展，可以快速提取当前网页的主要文字内容，并一键发送至你选择的 AI 平台进行智能总结。支持 **Gemini、ChatGPT、Claude、Grok、Perplexity** 五大平台，以及三种总结模式。

## 🚀 主要功能

- **多平台支持**：可自由选择将内容发送至 Gemini、ChatGPT、Claude、Grok 或 Perplexity。
- **智能正文提取**：自动识别页面中的 `<article>` 或 `<main>` 标签，精准抓取网页核心内容。
- **多维度总结选项**：通过右键菜单提供三种预设提示词（Prompt）：
  - **一句话简短总结**：快速获取核心大意。
  - **详细要点总结**：分点罗列文章深度内容。
  - **5W1H 分析总结**：使用 Who、What、Where、When、Why、How 模型进行结构化分析。
- **全自动操作**：自动跳转 AI 平台、自动填入文本、自动触发发送。

## 📂 文件结构

```
.
├── manifest.json           # 插件配置文件
├── background.js           # 后台脚本：右键菜单与内容抓取
├── gemini_injector.js      # Gemini 页面注入脚本
├── chatgpt_injector.js     # ChatGPT 页面注入脚本
├── claude_injector.js      # Claude 页面注入脚本
├── grok_injector.js        # Grok 页面注入脚本
└── perplexity_injector.js  # Perplexity 页面注入脚本
```

## 🛠️ 安装步骤

1. 下载或克隆本仓库到本地文件夹。
2. 在 Chrome 地址栏输入 `chrome://extensions/` 并回车。
3. 勾选页面右上角的 **"开发者模式"** 开关。
4. 点击 **"加载已解压的扩展程序"**，选择包含上述文件的文件夹。
5. 看到 **"AI 网页总结助手"** 出现在扩展列表中即表示安装成功。

## 📝 使用方法

1. 打开任何包含文字内容的网页（新闻、博客、文档等）。
2. 在页面**空白处点击右键**。
3. 选择 **"AI 总结当前页面"**，展开后选择目标 AI 平台（如 Claude）。
4. 再选择总结类型（一句话简短总结 / 详细要点总结 / 5W1H 分析总结）。
5. 浏览器会自动打开对应平台的新标签页，并完成文本填入与发送。

## ⚠️ 注意事项

- **登录状态**：使用前请确保你已登录对应 AI 平台的账号。
- **字符限制**：为保证性能，插件默认截取网页前 15,000 个字符。
- **权限说明**：插件需要 `scripting` 权限读取页面文字，`storage` 权限用于在页面跳转间传递文本。

## 🔧 技术实现原理

1. **提取阶段**：通过 `chrome.scripting.executeScript` 在当前页面执行 DOM 抓取。
2. **存储阶段**：将文本与 Prompt 拼接后存入 `chrome.storage.local`（各平台使用独立 key）。
3. **注入阶段**：在对应平台域名下，各注入脚本读取 storage 并等待输入框加载。
4. **模拟交互**：通过 `document.execCommand('insertText')` 或原生 value setter 模拟输入，触发 `input` 事件激活发送按钮，最后自动点击发送。

## 支持的平台

| 平台 | 域名 |
|------|------|
| Gemini | gemini.google.com |
| ChatGPT | chatgpt.com / chat.openai.com |
| Claude | claude.ai |
| Grok | grok.com |
| Perplexity | perplexity.ai |
