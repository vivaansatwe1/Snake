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

    // Your key securely encrypted with 'Hektor123' 
    const ENCRYPTED_GEMINI_KEY = "U2FsdGVkX19CgL1UIsx9I1hN4A/8Gv3S6WjMivwD+HlEcl9W/bYpT9S+I1YV1j/E/K9Wp2zK4p8QvXm6="; 
    let decryptedApiKey = "";

    function attemptUnlock() {
        const enteredPassword = passwordInput.value.trim();
        
        if (!enteredPassword) {
            gateError.textContent = "Password field cannot be empty.";
            return;
        }

        try {
            const bytes = CryptoJS.AES.decrypt(ENCRYPTED_GEMINI_KEY, enteredPassword);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

            if (decryptedText && decryptedText.startsWith("AIzaSy")) {
                decryptedApiKey = decryptedText;
                passwordGate.classList.add('hidden');
                chatContainer.classList.remove('hidden');
            } else {
                throw new Error("Bad decryption mapping");
            }
        } catch (error) {
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

        // API base URL endpoint
        const targetUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Correct required Google API Header format to pass browser CORS security restrictions
                    'x-goog-api-key': decryptedApiKey 
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
                const apiError = data.error ? data.error.message : "Unexpected response validation format.";
                appendMessage(`System Error: ${apiError}`, false);
            }

        } catch (error) {
            appendMessage("Failed to reach processing systems. Verify network connectivity or check browser console logs.", false);
        }
    });
});
