chrome.storage.local.get(['pendingPerplexityQuery'], function(result) {
    if (!result.pendingPerplexityQuery) return;

    const queryText = result.pendingPerplexityQuery;
    chrome.storage.local.remove('pendingPerplexityQuery');

    const checkInputExist = setInterval(function() {
        const inputBox = document.querySelector('textarea[placeholder]') ||
            document.querySelector('textarea') ||
            document.querySelector('div[contenteditable="true"]');

        if (!inputBox) return;
        clearInterval(checkInputExist);
        inputBox.focus();

        document.execCommand('insertText', false, queryText);

        if (inputBox.tagName === 'TEXTAREA' && !inputBox.value) {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            nativeSetter.call(inputBox, queryText);
            inputBox.dispatchEvent(new Event('input', { bubbles: true }));
            inputBox.dispatchEvent(new Event('change', { bubbles: true }));
        }

        let retries = 0;
        const checkButtonExist = setInterval(() => {
            const sendButton =
                document.querySelector('[data-testid="ask-input-submit-button"]') ||
                document.querySelector('button[aria-label="Submit"]') ||
                document.querySelector('button[aria-label="发送"]') ||
                document.querySelector('button[type="submit"]');

            if (sendButton && !sendButton.disabled) {
                clearInterval(checkButtonExist);
                sendButton.click();
                return;
            }

            if (++retries >= 10) {
                clearInterval(checkButtonExist);
                // Perplexity submits on Enter
                inputBox.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }));
            }
        }, 500);
    }, 500);

    setTimeout(() => clearInterval(checkInputExist), 15000);
});
