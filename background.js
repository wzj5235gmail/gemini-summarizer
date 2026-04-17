// 当插件安装时，创建右键多级菜单
chrome.runtime.onInstalled.addListener(() => {
    // 创建父级菜单
    chrome.contextMenus.create({
        id: "gemini-summary-parent",
        title: "发送到 Gemini 总结当前页面",
        contexts: ["page"] // 在页面空白处右键时触发
    });

    // 创建子菜单：一句话总结
    chrome.contextMenus.create({
        id: "summary-short",
        parentId: "gemini-summary-parent",
        title: "一句话简短总结",
        contexts: ["page"]
    });

    // 创建子菜单：详细总结
    chrome.contextMenus.create({
        id: "summary-detailed",
        parentId: "gemini-summary-parent",
        title: "详细要点总结",
        contexts: ["page"]
    });

    // 创建子菜单：5W1H 总结 (新增)
    chrome.contextMenus.create({
        id: "summary-5w1h",
        parentId: "gemini-summary-parent",
        title: "5W1H 分析总结",
        contexts: ["page"]
    });
});

// 在目标网页中执行的文本提取函数
function extractPageText() {
    // 优先寻找 article 或 main 标签（通常是正文），如果没有则获取 body
    let contentElement = document.querySelector('article') || document.querySelector('main') || document.body;
    let text = contentElement.innerText || "";

    // 清理多余的换行和空白符，并截取前 15000 个字符
    // (截断是为了防止网页过大导致注入到 Gemini 输入框时浏览器卡死)
    text = text.replace(/\s+/g, ' ').trim().substring(0, 15000);
    return text;
}

// 监听右键菜单的点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // 检查是否点击了我们定义的任何一个总结菜单
    const validMenus = ["summary-short", "summary-detailed", "summary-5w1h"];

    if (validMenus.includes(info.menuItemId)) {

        // 1. 根据点击的菜单，设置不同的提示词前缀
        let promptPrefix = "";
        if (info.menuItemId === "summary-short") {
            promptPrefix = "请用一句话简短总结以下网页的核心内容：\n\n";
        } else if (info.menuItemId === "summary-detailed") {
            promptPrefix = "请详细总结以下网页的主要内容，提取核心要点并分点列出：\n\n";
        } else if (info.menuItemId === "summary-5w1h") {
            promptPrefix = "请使用 5W1H 分析法（Who人物, What事件, Where地点, When时间, Why原因, How方式/过程）对以下网页的主要内容进行结构化总结：\n\n";
        }

        // 2. 注入脚本到当前页面，提取文字
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractPageText
        }, (injectionResults) => {
            // 确保成功获取到文本
            if (injectionResults && injectionResults[0] && injectionResults[0].result) {
                const pageText = injectionResults[0].result;
                const finalQuery = promptPrefix + pageText;

                // 3. 将拼接好的文本保存到 Chrome 的本地存储中
                chrome.storage.local.set({ pendingGeminiQuery: finalQuery }, () => {
                    // 存储成功后，打开 Gemini 的网页
                    chrome.tabs.create({ url: "https://gemini.google.com/app" });
                });
            } else {
                console.error("未能提取到页面文本内容");
            }
        });
    }
});