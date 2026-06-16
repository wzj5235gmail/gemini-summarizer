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

        // Dispatch beforeinput so ProseMirror registers the change
        inputBox.dispatchEvent(new InputEvent('beforeinput', {
            inputType: 'insertText',
            data: queryText,
            bubbles: true,
            cancelable: true
        }));
        document.execCommand('insertText', false, queryText);
        inputBox.dispatchEvent(new InputEvent('input', {
            inputType: 'insertText',
            data: queryText,
            bubbles: true
        }));

        let retries = 0;
        const checkButtonExist = setInterval(() => {
            const sendButton =
                document.querySelector('button[aria-label="Send Message"]') ||
                document.querySelector('button[aria-label="Send"]') ||
                document.querySelector('button[aria-label="发送消息"]') ||
                document.querySelector('button[aria-label="发送"]') ||
                document.querySelector('[data-testid="send-button"]') ||
                document.querySelector('button[type="submit"]');

            if (sendButton && !sendButton.disabled) {
                clearInterval(checkButtonExist);
                sendButton.click();
                return;
            }

            if (++retries >= 10) {
                clearInterval(checkButtonExist);
                // Claude submits on Enter (Shift+Enter for newline)
                inputBox.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }));
            }
        }, 500);
    }, 500);

    setTimeout(() => clearInterval(checkInputExist), 15000);
});
