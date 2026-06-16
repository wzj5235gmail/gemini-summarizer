chrome.storage.local.get(['pendingChatGPTQuery'], function(result) {
    if (!result.pendingChatGPTQuery) return;

    const queryText = result.pendingChatGPTQuery;
    chrome.storage.local.remove('pendingChatGPTQuery');

    const checkInputExist = setInterval(function() {
        const inputBox = document.querySelector('#prompt-textarea') ||
            document.querySelector('div[contenteditable="true"]') ||
            document.querySelector('textarea');

        if (!inputBox) return;
        clearInterval(checkInputExist);
        inputBox.focus();

        if (inputBox.tagName === 'TEXTAREA') {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            nativeSetter.call(inputBox, queryText);
        } else {
            document.execCommand('insertText', false, queryText);
        }
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));

        let retries = 0;
        const checkButtonExist = setInterval(() => {
            const sendButton = document.querySelector('[data-testid="send-button"]') ||
                document.querySelector('button[aria-label="Send message"]') ||
                document.querySelector('button[aria-label="发送消息"]');

            if (sendButton && !sendButton.disabled) {
                clearInterval(checkButtonExist);
                sendButton.click();
            }
            if (++retries > 20) clearInterval(checkButtonExist);
        }, 500);
    }, 500);

    setTimeout(() => clearInterval(checkInputExist), 15000);
});
