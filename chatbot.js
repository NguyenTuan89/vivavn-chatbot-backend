(function () {
    // 0. LOG KIỂM TRA (Để chắc chắn file đã được tải)
    console.log("🚀 Vivavn Chatbot Script Loaded!");

    // Hàm khởi tạo chính
    function initVivavnChatbot() {
        // Kiểm tra xem đã chạy chưa để tránh tạo trùng lặp
        if (document.getElementById("viva-chatbot-container")) return;

        console.log("⚙️ Starting initialization...");

        // ============================================================
        // 1. CẤU HÌNH GIAO DIỆN
        // ============================================================
        const chatContainer = document.createElement("div");
        chatContainer.id = "viva-chatbot-container";
        // Thêm !important để chống bị theme đè style
        chatContainer.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 2147483647 !important; font-family: sans-serif; pointer-events: none;";
        // pointer-events: none ở container cha để không che nút bấm khác trên web,
        // các nút con sẽ bật lại pointer-events: auto

        chatContainer.innerHTML = `
            <button id="chat-toggle-btn" style="
                pointer-events: auto;
                background-color: #38a169; color: white; width: 60px; height: 60px;
                border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                border: none; cursor: pointer; display: flex; align-items: center;
                justify-content: center; transition: transform 0.3s ease;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>

            <div id="chat-box" style="
                pointer-events: auto;
                display: none; position: absolute; bottom: 80px; right: 0;
                width: 350px; height: 500px; background: white; border-radius: 12px;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2); overflow: hidden;
                flex-direction: column; border: 1px solid #e5e7eb;
            ">
                <div style="background-color: #38a169; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: bold; font-size: 16px;">Vivavn Product Support</span>
                        <span>🌱</span>
                    </div>
                    <button id="chat-close-btn" style="background: none; border: none; color: white; cursor: pointer; padding: 5px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div id="chat-messages" style="flex: 1; padding: 15px; overflow-y: auto; background-color: #f9fafb;">
                    <div style="display: flex; justify-content: flex-start; margin-bottom: 10px;">
                        <div style="background-color: #e5e7eb; color: #1f2937; padding: 10px 15px; border-radius: 12px; border-top-left-radius: 0; max-width: 85%; font-size: 14px; line-height: 1.5;">
                            Hello! I'm Vivavn's AI assistant. I can help you with Vietnamese products today. 🇻🇳
                        </div>
                    </div>
                </div>

                <div style="padding: 15px; border-top: 1px solid #e5e7eb; display: flex; align-items: center; background: white;">
                    <input type="text" id="user-input" placeholder="Type your question..." style="flex: 1; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; font-size: 14px;">
                    <button id="send-btn" disabled style="background-color: #38a169; color: white; padding: 10px 12px; margin-left: 8px; border-radius: 8px; border: none; cursor: pointer; opacity: 0.5; transition: opacity 0.2s;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 15 2 11 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(chatContainer);
        console.log("✅ HTML injected to DOM");

        // ============================================================
        // 2. LOGIC XỬ LÝ SỰ KIỆN
        // ============================================================
        const API_URL = "https://vivavn-chatbot-backend.onrender.com/chat";
        const chatBox = document.getElementById('chat-box');
        const messagesContainer = document.getElementById('chat-messages');
        const inputField = document.getElementById('user-input');
        const sendButton = document.getElementById('send-btn');
        const toggleBtn = document.getElementById('chat-toggle-btn');
        const closeBtn = document.getElementById('chat-close-btn');

        function toggleChat() {
            if (chatBox.style.display === 'none' || chatBox.style.display === '') {
                chatBox.style.display = 'flex';
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    inputField.focus();
                }, 50);
            } else {
                chatBox.style.display = 'none';
            }
        }

        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        inputField.addEventListener('input', () => {
            const isEmpty = inputField.value.trim() === '';
            sendButton.disabled = isEmpty;
            sendButton.style.opacity = isEmpty ? '0.5' : '1';
            sendButton.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
        });

        inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        sendButton.addEventListener('click', sendMessage);

        function appendMessage(sender, text) {
            const isUser = sender === 'user';
            const align = isUser ? 'flex-end' : 'flex-start';
            const bg = isUser ? '#38a169' : '#e5e7eb';
            const color = isUser ? 'white' : '#1f2937';
            const radius = isUser ? 'border-bottom-right-radius: 0' : 'border-top-left-radius: 0';

            let iconPrefix = '';
            if (!isUser) {
                 const lower = text.toLowerCase();
                 if (lower.includes('sorry') || lower.includes('error')) iconPrefix = '⚠️ ';
                 else if (lower.includes('price') || lower.includes('cost')) iconPrefix = '💰 ';
                 else iconPrefix = '✅ ';
            }

            let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

            const html = `<div style="display: flex; justify-content: ${align}; margin-bottom: 10px;">
                    <div style="background-color: ${bg}; color: ${color}; padding: 10px 15px; border-radius: 12px; ${radius}; max-width: 85%; font-size: 14px; line-height: 1.5; word-wrap: break-word;">
                        ${iconPrefix}${formattedText}
                    </div>
                </div>`;

            messagesContainer.insertAdjacentHTML('beforeend', html);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        async function sendMessage() {
            const text = inputField.value.trim();
            if (!text) return;
            appendMessage('user', text);
            inputField.value = '';
            sendButton.disabled = true;
            sendButton.style.opacity = '0.5';

            const loadingId = 'loading-' + Date.now();
            messagesContainer.insertAdjacentHTML('beforeend', `<div id="${loadingId}" style="margin-bottom: 10px; font-style: italic; font-size: 13px; color: #666;">Bot is typing...</div>`);

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                document.getElementById(loadingId)?.remove();

                if (!res.ok) throw new Error("Server Error");
                const data = await res.json();
                appendMessage('bot', data.reply || "No reply data");

            } catch (error) {
                document.getElementById(loadingId)?.remove();
                appendMessage('bot', "⚠️ Connection error. Please try again.");
            } finally {
                sendButton.disabled = false;
                sendButton.style.opacity = '1';
                inputField.focus();
            }
        }
    }

    // --- PHẦN QUAN TRỌNG NHẤT: KIỂM TRA TRẠNG THÁI DOM ---
    // Thay vì chỉ nghe DOMContentLoaded, ta kiểm tra xem nó đã xảy ra chưa
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // Nếu trang đã tải xong rồi, chạy ngay lập tức
        initVivavnChatbot();
    } else {
        // Nếu chưa, thì mới lắng nghe sự kiện
        document.addEventListener("DOMContentLoaded", initVivavnChatbot);
    }

})();