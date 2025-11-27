document.addEventListener("DOMContentLoaded", function() {
    // 1. TẠO GIAO DIỆN HTML BẰNG JS
    const chatContainer = document.createElement("div");
    chatContainer.id = "viva-chatbot-container";
    chatContainer.className = "fixed bottom-4 right-4 z-50 font-sans";
    chatContainer.innerHTML = `
        <button id="chat-toggle-btn" class="bg-vivavn text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl cursor-pointer transform transition duration-300 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <div id="chat-box" class="hidden absolute bottom-20 right-0 w-80 md:w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transform scale-95 opacity-0 transition duration-300">
            <div class="bg-vivavn text-white p-4 flex justify-between items-center shadow-md">
                <div class="flex items-center"><span class="text-xl font-bold mr-2">Vivavn Product Support</span><span class="text-sm">🌱</span></div>
                <button id="chat-close-btn" class="text-white hover:text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"><div class="flex justify-start"><div class="bg-gray-200 text-gray-800 p-3 rounded-xl rounded-tl-none max-w-[85%] shadow-sm chat-bubble-bot">Hello! I'm Vivavn's AI assistant. I can help you with Vietnamese products today. 🇻🇳</div></div></div>
            <div class="p-3 border-t border-gray-200 flex items-center bg-white">
                <input type="text" id="user-input" placeholder="Type your question..." class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-vivavn focus:ring-1 focus:ring-vivavn">
                <button id="send-btn" class="btn-vivavn text-white p-3 ml-2 rounded-lg flex items-center justify-center disabled:opacity-50" disabled><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 15 2 11 22 2"></polygon></svg></button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // 2. LOGIC JAVASCRIPT
    const API_URL = "https://vivavn-chatbot-backend.onrender.com/chat";
    const chatBox = document.getElementById('chat-box');
    const messagesContainer = document.getElementById('chat-messages');
    const inputField = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close-btn');

    // Event Listeners
    inputField.addEventListener('input', () => { sendButton.disabled = inputField.value.trim() === ''; });
    inputField.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);

    function toggleChat() {
        const isHidden = chatBox.classList.contains('hidden');
        if (isHidden) {
            chatBox.classList.remove('hidden');
            setTimeout(() => {
                chatBox.classList.remove('scale-95', 'opacity-0');
                chatBox.classList.add('scale-100', 'opacity-100');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                inputField.focus();
            }, 10);
        } else {
            chatBox.classList.remove('scale-100', 'opacity-100');
            chatBox.classList.add('scale-95', 'opacity-0');
            setTimeout(() => { chatBox.classList.add('hidden'); }, 300);
        }
    }

    function appendMessage(sender, text) {
        const messageClass = sender === 'user' ? 'justify-end' : 'justify-start';
        const bubbleClass = sender === 'user' ? 'chat-bubble-user text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-tl-none chat-bubble-bot';
        let iconPrefix = '';
        if (sender === 'bot') {
            const lower = text.toLowerCase();
            if (lower.includes('sorry') || lower.includes('error')) iconPrefix = '⚠️ ';
            else if (lower.includes('price') || lower.includes('cost')) iconPrefix = '💰 ';
            else if (lower.includes('info') || lower.includes('details')) iconPrefix = '💡 ';
            else if (text.includes('<a href')) iconPrefix = '🔗 ';
            else iconPrefix = '✅ ';
        }
        let formattedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-vivavn hover:underline font-medium">$1</a>');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        formattedText = formattedText.replace(/\n/g, '<br>');

        const html = `<div class="flex ${messageClass}"><div class="p-3 rounded-xl max-w-[85%] shadow-sm ${bubbleClass}">${iconPrefix}${formattedText}</div></div>`;
        messagesContainer.innerHTML += html;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage() {
        const text = inputField.value.trim();
        if (!text) return;
        appendMessage('user', text);
        inputField.value = '';
        sendButton.disabled = true;

        const loadingId = 'loading-' + Date.now();
        messagesContainer.innerHTML += `<div id="${loadingId}" class="flex justify-start"><div class="text-sm text-gray-500 italic p-3"><span class="animate-pulse">Bot is typing...</span></div></div>`;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            if (!res.ok) throw new Error(res.status === 503 ? "Server sleeping 503" : `Status ${res.status}`);
            const data = await res.json();
            document.getElementById(loadingId).remove();
            if (data.reply) appendMessage('bot', data.reply);
            else appendMessage('bot', `❌ Error: No reply data.`);
        } catch (error) {
            document.getElementById(loadingId)?.remove();
            let msg = 'Connection error.';
            if (error.message.includes('503')) msg = 'Server is waking up. Please wait 30s and try again.';
            appendMessage('bot', msg);
        } finally {
            sendButton.disabled = false;
            inputField.focus();
        }
    }
});