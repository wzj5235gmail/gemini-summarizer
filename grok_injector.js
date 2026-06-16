chrome.storage.local.get(['pendingGrokQuery'], function(result) {
    if (!result.pendingGrokQuery) return;

    const queryText = result.pendingGrokQuery;
    chrome.storage.local.remove('pendingGrokQuery');

    const checkInputExist = setInterval(function() {
        const inputBox = document.querySelector('textarea') ||
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

        let retries = 0;
        const checkButtonExist = setInterval(() => {
            const sendButton = document.querySelector('button[type="submit"]') ||
                document.querySelector('button[aria-label="Send"]') ||
                document.querySelector('button[aria-label="发送"]');

            if (sendButton && !sendButton.disabled) {
                clearInterval(checkButtonExist);
                sendButton.click();
            }
            if (++retries > 20) clearInterval(checkButtonExist);
        }, 500);
    }, 500);

    setTimeout(() => clearInterval(checkInputExist), 15000);
});
