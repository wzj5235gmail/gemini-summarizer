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

        if (inputBox.tagName === 'TEXTAREA') {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            nativeSetter.call(inputBox, queryText);
        } else {
            document.execCommand('insertText', false, queryText);
        }
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));

        let retries = 0;
        const checkButtonExist = setInterval(() => {
            const sendButton = document.querySelector('[data-testid="ask-input-submit-button"]') ||
                document.querySelector('button[aria-label="Submit"]') ||
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
