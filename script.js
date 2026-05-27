document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');

    // Helper function to dynamically insert message bubbles
    function appendMessage(text, isUser) {
        const messageRow = document.createElement('div');
        messageRow.classList.add('message-row', isUser ? 'user-row' : 'bot-row');

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble', isUser ? 'user-bubble' : 'bot-bubble');
        messageBubble.textContent = text;

        messageRow.appendChild(messageBubble);
        chatWindow.appendChild(messageRow);

        // Auto-scroll to the bottom of the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Handle Form Submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // 1. Render user message instantly
        appendMessage(message, true);
        userInput.value = '';

        try {
            // 2. Fetch answer from your local Flask backend
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();

            // 3. Render the server's response or handle server-side errors
            if (response.ok && data.response) {
                appendMessage(data.response, false);
            } else {
                appendMessage("Error: " + (data.error || "Unable to get response."), false);
            }

        } catch (error) {
            // Handle network/connection errors
            appendMessage("Failed to reach the chat server. Ensure your backend is running.", false);
        }
    });
});
