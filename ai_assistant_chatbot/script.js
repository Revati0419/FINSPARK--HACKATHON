document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');
    const sendButton = document.getElementById('send-button');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userMessage = userInput.value.trim();
        if (userMessage === '') return;

        // 1. Display user's message
        addMessage(userMessage, 'user');
        userInput.value = ''; // Clear the input field immediately

        // 2. Display a "loading" indicator
        const loadingMessage = addMessage('...', 'bot loading');

        try {
            // 3. Send the message to the backend API
            const response = await fetch('http://127.0.0.1:5000/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const botMessage = data.answer;

            // 4. Replace the loading indicator with the actual bot message
            loadingMessage.innerHTML = `<p>${botMessage}</p>`;
            loadingMessage.classList.remove('loading');

        } catch (error) {
            console.error('Error fetching bot response:', error);
            // If there's an error, show it in the chat window
            loadingMessage.innerHTML = `<p>Sorry, I'm having trouble connecting. Please try again later.</p>`;
            loadingMessage.classList.remove('loading');
        }
    });

    function addMessage(text, type) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message ${type}`;

        if (type.includes('loading')) {
            messageWrapper.innerHTML = `<span></span><span></span><span></span>`;
        } else {
            const messageText = document.createElement('p');
            messageText.textContent = text;
            messageWrapper.appendChild(messageText);
        }

        chatBody.appendChild(messageWrapper);
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll to the bottom
        return messageWrapper; // Return the element so we can modify it later
    }
});