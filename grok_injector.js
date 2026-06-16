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

        // execCommand works on focused textarea and triggers React's synthetic events
        document.execCommand('insertText', false, queryText);

        // Fallback: if execCommand didn't fill the value, use native setter
        if (inputBox.tagName === 'TEXTAREA' && !inputBox.value) {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            nativeSetter.call(inputBox, queryText);
            inputBox.dispatchEvent(new Event('input', { bubbles: true }));
            inputBox.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Try clicking the send button first; fall back to Enter key
        let retries = 0;
        const checkButtonExist = setInterval(() => {
            const sendButton = document.querySelector('button[type="submit"]') ||
                document.querySelector('button[aria-label="Send"]') ||
                document.querySelector('button[aria-label="发送"]');

            if (sendButton && !sendButton.disabled) {
                clearInterval(checkButtonExist);
                sendButton.click();
                return;
            }

            if (++retries >= 10) {
                clearInterval(checkButtonExist);
                // Grok uses Enter to submit
                inputBox.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }));
            }
        }, 500);
    }, 500);

    setTimeout(() => clearInterval(checkInputExist), 15000);
});
