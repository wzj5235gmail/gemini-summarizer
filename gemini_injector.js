// 页面加载后，检查 storage 中是否有等待查询的文本
chrome.storage.local.get(['pendingGeminiQuery'], function (result) {
    if (result.pendingGeminiQuery) {
        const queryText = result.pendingGeminiQuery;

        // 获取到文本后立即清除 storage，避免刷新页面时再次重复输入
        chrome.storage.local.remove('pendingGeminiQuery');

        // 轮询等待输入框出现
        const checkInputExist = setInterval(function () {
            // 查找 Gemini 的输入框
            const inputBox = document.querySelector('rich-textarea div[contenteditable="true"]') ||
                document.querySelector('[contenteditable="true"]');

            if (inputBox) {
                // 找到输入框后，停止寻找输入框的轮询
                clearInterval(checkInputExist);

                // 聚焦输入框
                inputBox.focus();

                // 插入文本
                document.execCommand('insertText', false, queryText);

                // 【关键修复 1】手动触发 input 事件，强制唤醒底层框架，让它把发送按钮从 disabled 变成可用状态
                inputBox.dispatchEvent(new Event('input', { bubbles: true }));

                // 【关键修复 2】开启一个新的轮询，专门用来等待并点击发送按钮
                let clickRetryCount = 0;
                const checkButtonExist = setInterval(() => {
                    // 涵盖中英文常见标签名，也可通过类名查找
                    const sendButton = document.querySelector('button[aria-label="Send message"], button[aria-label="发送消息"], button[aria-label="发送"]');

                    // 如果找到了按钮，并且它不是禁用状态
                    if (sendButton && !sendButton.disabled) {
                        clearInterval(checkButtonExist); // 停止按钮轮询
                        sendButton.click();              // 触发点击
                    }

                    // 设置超时防护：最多尝试 20 次（约 10 秒），防止死循环卡死浏览器
                    clickRetryCount++;
                    if (clickRetryCount > 20) {
                        clearInterval(checkButtonExist);
                        console.log("Gemini 网页总结助手：未找到发送按钮或按钮未激活。");
                    }
                }, 500); // 每 500 毫秒检查一次发送按钮
            }
        }, 500); // 每 500 毫秒检查一次输入框是否加载完毕

        // 设置输入框寻找的 15 秒超时 (考虑到有时网络慢)
        setTimeout(() => clearInterval(checkInputExist), 15000);
    }
});