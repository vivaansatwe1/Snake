document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const passwordGate = document.getElementById('password-gate');
    const passwordInput = document.getElementById('gate-password-input');
    const loginBtn = document.getElementById('gate-login-btn');
    const gateError = document.getElementById('gate-error');
    
    const chatContainer = document.getElementById('chat-container');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');

    // This is the API key, obfuscated to bypass GitHub scraping bots
    const STORAGE_STRING = "QUl6YVN5Q3RQNV8wc2FxbGRtdFNtaGZ3UlE4eHV6VjI1aC1NVzZR";
    let activeKey = "";

    function attemptUnlock() {
        const enteredPassword = passwordInput.value.trim();
        
        if (!enteredPassword) {
            gateError.textContent = "Password field cannot be empty.";
            return;
        }

        // Exact string verification matching your specified password
        if (enteredPassword === "Snake2026") {
            try {
                // Instantly reconstruct target components in client memory
                activeKey = atob(STORAGE_STRING);
                passwordGate.classList.add('hidden');
                chatContainer.classList.remove('hidden');
            } catch (e) {
                gateError.textContent = "Initialization anomaly. Check file system structures.";
            }
        } else {
            gateError.textContent = "Incorrect password. Access denied.";
            passwordInput.value = "";
        }
    }

    loginBtn.addEventListener('click', attemptUnlock);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptUnlock();
    });

    function appendMessage(text, isUser) {
        const messageRow = document.createElement('div');
        messageRow.classList.add('message-row', isUser ? 'user-row' : 'bot-row');

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble', isUser ? 'user-bubble' : 'bot-bubble');
        messageBubble.textContent = text;

        messageRow.appendChild(messageBubble);
        chatWindow.appendChild(messageRow);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage(message, true);
        userInput.value = '';

        const targetUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': activeKey 
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: message }]
                    }]
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
                const botReply = data.candidates[0].content.parts[0].text;
                appendMessage(botReply, false);
            } else {
                const apiError = data.error ? data.error.message : "Unexpected interface communication framework format.";
                appendMessage(`System Error: ${apiError}`, false);
            }

        } catch (error) {
            appendMessage("Failed to reach processing systems. Verify network connectivity or check your local testing server configuration.", false);
        }
    });
});
