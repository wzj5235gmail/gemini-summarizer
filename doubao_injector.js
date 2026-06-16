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
                document.querySelector('button[aria-label="发送"]') ||
                document.querySelector('button[aria-label="Send"]') ||
                document.querySelector('[data-testid="send-button"]') ||
                document.querySelector('button[type="submit"]');

            if (sendButton && !sendButton.disabled) {
                clearInterval(checkButtonExist);
                sendButton.click();
                return;
            }

            if (++retries >= 10) {
                clearInterval(checkButtonExist);
                // Doubao submits on Enter
                inputBox.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }));
            }
        }, 500);
    }, 500);

    setTimeout(() => clearInterval(checkInputExist), 15000);
});
