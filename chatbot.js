(function () {
    // Bỏ qua mọi lỗi hệ thống, ép chạy bằng mọi giá
    console.log("🚀 VivaVN Chatbot: Initializing...");

    // Hàm tạo giao diện
    function renderChatbot() {
        if (document.getElementById("viva-chatbot-container")) return; // Đã có thì thôi

        var div = document.createElement("div");
        div.id = "viva-chatbot-container";
        div.innerHTML = `
            <style>
                #viva-chatbot-container { position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; font-family: sans-serif; }
                #chat-toggle-btn {
                    width: 60px; height: 60px; background: #38a169; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.3s;
                }
                #chat-toggle-btn:hover { transform: scale(1.1); }
                #chat-box {
                    display: none; position: absolute; bottom: 80px; right: 0; width: 350px; height: 500px;
                    background: white; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.2);
                    flex-direction: column; border: 1px solid #e5e7eb; overflow: hidden;
                }
                #chat-messages { flex: 1; padding: 15px; overflow-y: auto; background: #f9fafb; }
                #user-input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; outline: none; }
            </style>
            <button id="chat-toggle-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>

            <div id="chat-box">
                <div style="background: #38a169; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <strong>Vivavn Support 🌱</strong>
                    <button id="chat-close" style="background:none; border:none; color:white; font-size: 18px; cursor: pointer;">✕</button>
                </div>
                <div id="chat-messages">
                    <div style="background: #e5e7eb; padding: 10px; border-radius: 10px; display: inline-block; font-size: 14px;">
                        Hello! I'm Vivavn's AI assistant. How can I help you? 🇻🇳
                    </div>
                </div>
                <div style="padding: 15px; border-top: 1px solid #eee; display: flex; gap: 5px; background: white;">
                    <input type="text" id="user-input" placeholder="Type here...">
                    <button id="send-btn" style="background: #38a169; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">➤</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        // Logic Bật/Tắt
        var box = document.getElementById("chat-box");
        var toggle = document.getElementById("chat-toggle-btn");
        var close = document.getElementById("chat-close");
        var input = document.getElementById("user-input");
        var send = document.getElementById("send-btn");
        var msgs = document.getElementById("chat-messages");

        function toggleChat() {
            var isHidden = box.style.display === "none" || box.style.display === "";
            box.style.display = isHidden ? "flex" : "none";
            if(isHidden) input.focus();
        }

        toggle.onclick = toggleChat;
        close.onclick = toggleChat;

        // Logic Gửi tin
        async function sendMsg() {
            var txt = input.value.trim();
            if(!txt) return;

            // Add User Msg
            msgs.innerHTML += `<div style="text-align: right; margin: 10px 0;"><div style="background: #38a169; color: white; padding: 10px; border-radius: 10px; display: inline-block; text-align: left;">${txt}</div></div>`;
            input.value = "";
            msgs.scrollTop = msgs.scrollHeight;

            // Fake bot typing
            var loading = document.createElement("div");
            loading.innerHTML = `<small style="color:gray;">Bot is typing...</small>`;
            msgs.appendChild(loading);

            try {
                var res = await fetch("https://vivavn-chatbot-backend.onrender.com/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: txt })
                });
                var data = await res.json();
                loading.remove();

                // Add Bot Msg
                var botText = data.reply || "Sorry, I encountered an error.";
                // Format link
                botText = botText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:blue; text-decoration:underline;">$1</a>').replace(/\n/g, '<br>');

                msgs.innerHTML += `<div style="text-align: left; margin: 10px 0;"><div style="background: #e5e7eb; padding: 10px; border-radius: 10px; display: inline-block;">${botText}</div></div>`;
            } catch (e) {
                loading.remove();
                msgs.innerHTML += `<div style="color: red; font-size: 12px;">Connection error. Please try again.</div>`;
            }
            msgs.scrollTop = msgs.scrollHeight;
        }

        send.onclick = sendMsg;
        input.onkeypress = (e) => { if(e.key === "Enter") sendMsg(); }
    }

    // Cố gắng chạy ngay lập tức
    if (document.readyState !== 'loading') {
        renderChatbot();
    } else {
        document.addEventListener('DOMContentLoaded', renderChatbot);
    }
    // Thêm một lần kiểm tra backup sau 2 giây (phòng trường hợp bị chặn lúc đầu)
    setTimeout(renderChatbot, 2000);
})();