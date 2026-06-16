const AI_CONFIG = {
    gemini:     { storageKey: 'pendingGeminiQuery',     url: 'https://gemini.google.com/app' },
    chatgpt:    { storageKey: 'pendingChatGPTQuery',    url: 'https://chatgpt.com/' },
    claude:     { storageKey: 'pendingClaudeQuery',     url: 'https://claude.ai/new' },
    grok:       { storageKey: 'pendingGrokQuery',       url: 'https://grok.com/' },
    perplexity: { storageKey: 'pendingPerplexityQuery', url: 'https://www.perplexity.ai/' },
    doubao:     { storageKey: 'pendingDoubaoQuery',     url: 'https://www.doubao.com/chat/' }
};

const PROMPTS = {
    short:    "请用一句话简短总结以下网页的核心内容：\n\n",
    detailed: "请详细总结以下网页的主要内容，提取核心要点并分点列出：\n\n",
    '5w1h':   "请使用 5W1H 分析法（Who人物, What事件, Where地点, When时间, Why原因, How方式/过程）对以下网页的主要内容进行结构化总结：\n\n"
};

const AI_LABELS = {
    gemini:     'Gemini',
    chatgpt:    'ChatGPT',
    claude:     'Claude',
    grok:       'Grok',
    perplexity: 'Perplexity',
    doubao:     '豆包'
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ai-summary-root",
        title: "AI 总结当前页面",
        contexts: ["page"]
    });

    for (const [aiId, label] of Object.entries(AI_LABELS)) {
        chrome.contextMenus.create({
            id: `parent-${aiId}`,
            parentId: "ai-summary-root",
            title: label,
            contexts: ["page"]
        });

        chrome.contextMenus.create({
            id: `${aiId}_short`,
            parentId: `parent-${aiId}`,
            title: "一句话简短总结",
            contexts: ["page"]
        });

        chrome.contextMenus.create({
            id: `${aiId}_detailed`,
            parentId: `parent-${aiId}`,
            title: "详细要点总结",
            contexts: ["page"]
        });

        chrome.contextMenus.create({
            id: `${aiId}_5w1h`,
            parentId: `parent-${aiId}`,
            title: "5W1H 分析总结",
            contexts: ["page"]
        });
    }
});

function extractPageText() {
    let contentElement = document.querySelector('article') || document.querySelector('main') || document.body;
    let text = contentElement.innerText || "";
    text = text.replace(/\s+/g, ' ').trim().substring(0, 15000);
    return text;
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const menuId = info.menuItemId;
    const parts = menuId.split('_');
    if (parts.length !== 2) return;

    const [aiId, summaryType] = parts;
    if (!AI_CONFIG[aiId] || !PROMPTS[summaryType]) return;

    const promptPrefix = PROMPTS[summaryType];
    const { storageKey, url } = AI_CONFIG[aiId];

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractPageText
    }, (injectionResults) => {
        if (injectionResults && injectionResults[0] && injectionResults[0].result) {
            const pageText = injectionResults[0].result;
            const finalQuery = promptPrefix + pageText;

            chrome.storage.local.set({ [storageKey]: finalQuery }, () => {
                chrome.tabs.create({ url });
            });
        } else {
            console.error("AI 网页总结助手：未能提取到页面文本内容");
        }
    });
});
