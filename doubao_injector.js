chrome.storage.local.get(['pendingDoubaoQuery'], function(result) {
    if (!result.pendingDoubaoQuery) return;

    const queryText = result.pendingDoubaoQuery;
    chrome.storage.local.remove('pendingDoubaoQuery');

    const checkInputExist = setInterval(function() {
        const inputBox = document.querySelector('textarea#chat-input') ||
            document.querySelector('textarea[placeholder]') ||
            document.querySelector('textarea') ||
            document.querySelector('div[contenteditable="true"]');

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
        inputBox.dispatchEvent(new Event('change', { bubbles: true }));

        let retries = 0;
        const checkButtonExist = setInterval(() => {
            const sendButton = document.querySelector('button[aria-label="发送"]') ||
                document.querySelector('button[aria-label="Send"]') ||
                document.querySelector('button[type="submit"]') ||
                document.querySelector('[data-testid="send-button"]');

            if (sendButton && !sendButton.disabled) {
                clearInterval(checkButtonExist);
                sendButton.click();
            }
            if (++retries > 20) clearInterval(checkButtonExist);
        }, 500);
    }, 500);

    setTimeout(() => clearInterval(checkInputExist), 15000);
});
