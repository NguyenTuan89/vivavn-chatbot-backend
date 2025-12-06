(function() {
    // --- 1. CORE INITIALIZATION FUNCTION ---
    function initVivaChatbot() {
        // Prevent duplicates
        if (document.getElementById('viva-chatbot-container')) return;

        console.log("🚀 VivaVN Chatbot: STARTING INJECTION (Ads Safe Mode)...");

        // --- A. LANGUAGE DETECTION ---
        var userLang = (navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase();
        var greetings = {
            'en': "Hello! 👋 I’m the virtual assistant of VivaVN. Ask me in your language! 🌿",
            'vi': "Xin chào! 👋 Tôi là trợ lý ảo VivaVN. Hãy hỏi tôi bằng tiếng Việt nhé! 🌿",
            'fr': "Bonjour! 👋 Je suis l'assistant de VivaVN. Posez votre question en français ! 🌿",
            'ja': "こんにちは！👋 VivaVNのアシスタントです。日本語で質問してください！🌿",
            'zh': "你好！👋 我是VivaVN的虚拟助手。请用中文向我提问！🌿",
            'ko': "안녕하세요! 👋 VivaVN 가상 비서입니다. 한국어로 질문해 주세요! 🌿",
            'de': "Hallo! 👋 Ich bin der virtuelle Assistent von VivaVN. Fragen Sie mich auf Deutsch! 🌿"
        };
        var welcomeMsg = greetings[userLang] || greetings['en'];

        // --- B. CREATE ZERO-FOOTPRINT CONTAINER ---
        var div = document.createElement('div');
        div.id = 'viva-chatbot-container';

        // KỸ THUẬT: Đưa Container về 0x0 pixel để Google Ads không phát hiện ra sự chiếm dụng không gian
        div.style.cssText = "position: fixed; bottom: 0; right: 0; width: 0; height: 0; overflow: visible; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;";

        div.innerHTML = `
            <style>
                /* --- ELEMENT POSITIONING (TỰ ĐỊNH VỊ) --- */

                /* 1. Nút Chat (Desktop) */
                .viva-btn {
                    position: fixed; /* Tự định vị, không phụ thuộc Container 0x0 */
                    bottom: 20px;
                    right: 20px;
                    width: 60px; height: 60px;
                    background: #38a169;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                    border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    transition: transform 0.3s;
                    pointer-events: auto; /* Bật lại tương tác chuột */
                }
                .viva-btn:hover { transform: scale(1.1); background: #2f855a; }

                /* 2. Hộp Chat (Desktop) */
                .viva-box {
                    display: none;
                    position: fixed; /* Tự định vị */
                    bottom: 90px;
                    right: 20px;
                    width: 350px; height: 500px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    flex-direction: column;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    animation: viva-slide-up 0.3s ease-out;
                    pointer-events: auto;
                }

                /* --- MOBILE OPTIMIZATION (NÉ QUẢNG CÁO) --- */
                @media (max-width: 768px) {
                    /* Đẩy nút chat lên cao hẳn 110px.
                       Quảng cáo Google thường cao 50-90px.
                       Khoảng dư này đảm bảo an toàn tuyệt đối. */
                    .viva-btn {
                        bottom: 110px !important;
                        right: 15px !important;
                    }

                    .viva-box {
                        width: 300px !important;
                        height: 60vh !important; /* Chiều cao linh hoạt */
                        bottom: 175px !important; /* Nằm trên nút chat */
                        right: 15px !important;
                    }
                }

                /* --- STANDARD STYLES --- */
                @keyframes viva-slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .viva-header { background: #38a169; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 16px; }
                .viva-msgs { flex: 1; padding: 16px; overflow-y: auto; background: #f9fafb; display: flex; flex-direction: column; gap: 12px; }
                .viva-msgs::-webkit-scrollbar { width: 6px; }
                .viva-msgs::-webkit-scrollbar-track { background: transparent; }
                .viva-msgs::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 10px; }
                .viva-input-area { padding: 12px; border-top: 1px solid #eee; display: flex; gap: 8px; background: white; }
                .viva-input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14px; }
                .viva-input:focus { border-color: #38a169; }
                .viva-send { background: #38a169; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .viva-send:hover { background: #2f855a; }

                .msg-row { display: flex; width: 100%; }
                .msg-row.user { justify-content: flex-end; }
                .msg-row.bot { justify-content: flex-start; }
                .msg-bubble { padding: 10px 14px; border-radius: 14px; max-width: 80%; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
                .msg-bubble.user { background: #38a169; color: white; border-bottom-right-radius: 2px; }
                .msg-bubble.bot { background: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; border-bottom-left-radius: 2px; }
                .msg-bubble a { color: #2563eb; text-decoration: underline; font-weight: 500; }
            </style>

            <button id="viva-toggle" class="viva-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>

            <div id="viva-box" class="viva-box">
                <div class="viva-header">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>🌱 VivaVN Assistant</span>
                    </div>
                    <button id="viva-close" style="background:none;border:none;color:white;opacity:0.8;font-size:24px;cursor:pointer;line-height:1;">&times;</button>
                </div>

                <div id="viva-messages" class="viva-msgs">
                    <div class="msg-row bot">
                        <div class="msg-bubble bot">${welcomeMsg}</div>
                    </div>
                </div>

                <div class="viva-input-area">
                    <input type="text" id="viva-input" class="viva-input" placeholder="Type a message...">
                    <button id="viva-send" class="viva-send">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
                <div style="font-size:10px; text-align:center; color:#9ca3af; padding-bottom:5px; background:white;">Powered by Vivavn team</div>
            </div>
        `;
        document.body.appendChild(div);
        console.log("✅ VivaVN Chatbot: HTML Injected into DOM successfully");

        // --- C. EVENT LISTENERS ---
        var toggleBtn = document.getElementById('viva-toggle');
        var box = document.getElementById('viva-box');
        var closeBtn = document.getElementById('viva-close');
        var sendBtn = document.getElementById('viva-send');
        var input = document.getElementById('viva-input');
        var msgs = document.getElementById('viva-messages');

        function toggleChat() {
            var isHidden = box.style.display === 'none' || box.style.display === '';
            box.style.display = isHidden ? 'flex' : 'none';
            if (isHidden) {
                input.focus();
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            } else {
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
            }
        }

        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        async function sendMessage() {
            var txt = input.value.trim();
            if (!txt) return;

            msgs.innerHTML += `<div class="msg-row user"><div class="msg-bubble user">${txt}</div></div>`;
            input.value = '';
            msgs.scrollTop = msgs.scrollHeight;

            var loadingId = 'loading-' + Date.now();
            msgs.innerHTML += `<div id="${loadingId}" class="msg-row bot"><div class="msg-bubble bot" style="color:#6b7280;font-style:italic;">Thinking...</div></div>`;
            msgs.scrollTop = msgs.scrollHeight;

            try {
                var res = await fetch("https://vivavn-chatbot-backend.onrender.com/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: txt })
                });

                if (!res.ok) throw new Error("Server Error");
                var data = await res.json();
                document.getElementById(loadingId).remove();

                var reply = (data.reply || "").replace(/\n/g, '<br>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                msgs.innerHTML += `<div class="msg-row bot"><div class="msg-bubble bot">${reply}</div></div>`;
            } catch (err) {
                document.getElementById(loadingId).remove();
                msgs.innerHTML += `<div class="msg-row bot"><div class="msg-bubble bot" style="color:red;">Connection Error.</div></div>`;
            }
            msgs.scrollTop = msgs.scrollHeight;
        }

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', function(e) { if (e.key === 'Enter') sendMessage(); });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initVivaChatbot();
    } else {
        document.addEventListener('DOMContentLoaded', initVivaChatbot);
    }
})();
```

### BƯỚC THỰC HIỆN CỨNG RẮN

1.  **Commit & Push** file này lên Repo Public của em (`vivavn-assets` hoặc cái nào em đang dùng).
2.  **Cập nhật WordPress:** Đổi version thành `?v=ADS_SAFE_01`.
    ```html
    <script src="https://cdn.jsdelivr.net/gh/NguyenTuan89/vivavn-assets@main/chatbot.js?v=ADS_SAFE_01"></script>