chrome.storage.local.get(['pendingClaudeQuery'], function(result) {
    if (!result.pendingClaudeQuery) return;

    const queryText = result.pendingClaudeQuery;
    chrome.storage.local.remove('pendingClaudeQuery');

    const checkInputExist = setInterval(function() {
        // Claude uses ProseMirror contenteditable
        const inputBox = document.querySelector('div[contenteditable="true"].ProseMirror') ||
            document.querySelector('[contenteditable="true"]');

        if (!inputBox) return;
        clearInterval(checkInputExist);
        inputBox.focus();
        document.execCommand('insertText', false, queryText);
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));

        let retries = 0;
        const checkButtonExist = setInterval(() => {
            const sendButton = document.querySelector('button[aria-label="Send Message"]') ||
                document.querySelector('button[aria-label="发送消息"]') ||
                document.querySelector('button[aria-label="发送"]') ||
                document.querySelector('button[type="submit"]');

            if (sendButton && !sendButton.disabled) {
                clearInterval(checkButtonExist);
                sendButton.click();
            }
            if (++retries > 20) clearInterval(checkButtonExist);
        }, 500);
    }, 500);

    setTimeout(() => clearInterval(checkInputExist), 15000);
});
