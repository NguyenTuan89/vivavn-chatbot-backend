(function() {
    function initVivaChatbot() {
        if (document.getElementById('viva-chatbot-container')) return;

        console.log("🚀 VivaVN Chatbot: KAI PERSONA ACTIVATED...");

        // --- A. LANGUAGE & CONFIG ---
        var userLang = (navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase();

        var greetings = {
            // TIẾNG ANH (MẶC ĐỊNH) - KAI PERSONA
            'en': {
                welcome: "Hello! 👋 My name is <strong>Kai</strong>, VivaVN's chatbot. What do you need help with? 🤖<br><br><i>If you don't know English, please ask in your language!</i> 🌍",
                cta: "Hi! I'm Kai. Need help?"
            },
            // CÁC NGÔN NGỮ KHÁC
            'vi': {
                welcome: "Xin chào! 👋 Tôi là <strong>Kai</strong>, chatbot của VivaVN. Bạn cần tôi giúp gì? 🤖<br><br>Hãy hỏi tôi bằng bất kỳ ngôn ngữ nào! 🇻🇳",
                cta: "Bạn cần hỗ trợ?"
            },
            'fr': { welcome: "Bonjour! Je suis Kai. Comment puis-je vous aider ? 🇫🇷", cta: "Besoin d'aide?" },
            'ja': { welcome: "こんにちは！Kaiです。何かお手伝いしましょうか？ 🇯🇵", cta: "助けが必要ですか？" },
            'zh': { welcome: "你好！我是Kai。有什么可以帮你的吗？ 🇨🇳", cta: "需要帮忙吗？" },
            'ko': { welcome: "안녕하세요! Kai입니다. 무엇을 도와드릴까요? 🇰🇷", cta: "도와 드릴까요?" },
        };

        // Logic: Nếu không tìm thấy ngôn ngữ, dùng 'en' (Kai)
        var langData = greetings[userLang] || greetings['en'];

        // --- B. CREATE CONTAINER ---
        var div = document.createElement('div');
        div.id = 'viva-chatbot-container';
        div.style.cssText = "position: fixed; bottom: 0; right: 0; width: 0; height: 0; overflow: visible; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;";

        div.innerHTML = `
            <style>
                /* --- BUTTON STYLES --- */
                .viva-btn {
                    position: fixed; bottom: 20px; right: 20px;
                    width: 65px; height: 65px;
                    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
                    border-radius: 50%;
                    box-shadow: 0 8px 24px rgba(56, 161, 105, 0.4);
                    border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    color: white; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    pointer-events: auto;
                }
                .viva-btn:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 12px 30px rgba(56, 161, 105, 0.6); }

                /* --- RIPPLE EFFECT --- */
                .viva-btn::before, .viva-btn::after {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 50%; border: 2px solid #38a169; opacity: 0; z-index: -1;
                }
                .viva-btn::before { animation: viva-ripple 2s infinite; }
                .viva-btn::after { animation: viva-ripple 2s infinite 1s; }
                @keyframes viva-ripple { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }

                /* --- BADGE --- */
                .viva-badge {
                    position: absolute; top: -2px; right: -2px;
                    background-color: #ef4444; color: white;
                    font-size: 12px; font-weight: bold;
                    width: 22px; height: 22px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; animation: viva-bounce 2s infinite; z-index: 10;
                }
                @keyframes viva-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

                /* --- CTA BUBBLE --- */
                .viva-cta {
                    position: fixed; bottom: 35px; right: 95px;
                    background: white; color: #333; padding: 8px 16px;
                    border-radius: 20px; border-bottom-right-radius: 4px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    font-size: 14px; font-weight: 600; white-space: nowrap;
                    pointer-events: auto; opacity: 0; transform: translateX(20px);
                    animation: viva-fade-in 0.5s ease-out 1s forwards;
                }
                .viva-cta-close { margin-left: 8px; color: #999; cursor: pointer; font-size: 12px; }
                @keyframes viva-fade-in { to { opacity: 1; transform: translateX(0); } }

                /* --- CHAT BOX --- */
                .viva-box {
                    display: none; position: fixed; bottom: 95px; right: 20px;
                    width: 350px; height: 500px; background: white;
                    border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                    flex-direction: column; border: 1px solid #e5e7eb; overflow: hidden;
                    animation: viva-slide-up 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    pointer-events: auto; z-index: 99999;
                }
                @keyframes viva-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* --- MOBILE FIX (Updated: Normal Position) --- */
                /* Đã đưa về vị trí chuẩn: cách đáy 20px */
                @media (max-width: 768px) {
                    .viva-btn { bottom: 20px !important; right: 15px !important; }
                    .viva-cta { display: none; }
                    .viva-box { width: 300px !important; height: 60vh !important; bottom: 95px !important; right: 15px !important; }
                }

                /* Standard Styles */
                .viva-header { background: linear-gradient(to right, #38a169, #2f855a); color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 16px; }
                .viva-msgs { flex: 1; padding: 16px; overflow-y: auto; background: #f9fafb; display: flex; flex-direction: column; gap: 12px; }
                .viva-msgs::-webkit-scrollbar { display:none; }
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

            <div id="viva-cta" class="viva-cta">
                ${langData.cta} <span class="viva-cta-close" onclick="this.parentElement.style.display='none'">✕</span>
            </div>

            <button id="viva-toggle" class="viva-btn">
                <!-- ICON TIN NHẮN TRUYỀN THỐNG -->
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <div id="viva-badge" class="viva-badge">1</div>
            </button>

            <div id="viva-box" class="viva-box">
                <div class="viva-header">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>🌱 VivaVN Assistant (Kai)</span>
                    </div>
                    <button id="viva-close" style="background:none;border:none;color:white;opacity:0.8;font-size:24px;cursor:pointer;line-height:1;">&times;</button>
                </div>

                <div id="viva-messages" class="viva-msgs">
                    <div class="msg-row bot">
                        <div class="msg-bubble bot">${langData.welcome}</div>
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

        // --- C. EVENT LISTENERS ---
        var toggleBtn = document.getElementById('viva-toggle');
        var box = document.getElementById('viva-box');
        var cta = document.getElementById('viva-cta');
        var badge = document.getElementById('viva-badge');
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
                if(badge) badge.style.display = 'none';
                if(cta) cta.style.display = 'none';
            } else {
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
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