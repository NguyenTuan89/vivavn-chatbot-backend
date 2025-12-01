(function() {
    // --- 1. HÀM KHỞI TẠO CHÍNH (LOGIC CỦA EM) ---
    function initVivaChatbot() {
        // Chống trùng lặp: Nếu bot đã hiện rồi thì thôi, không tạo thêm
        if (document.getElementById('viva-chatbot-container')) {
            console.log("⚠️ Chatbot already exists. Skipping.");
            return;
        }

        console.log("🚀 VivaVN Chatbot: STARTING INJECTION...");

        // --- A. TẠO HTML ---
        var div = document.createElement('div');
        div.id = 'viva-chatbot-container';
        // Dùng CSS cứng (Hard-coded) để không phụ thuộc Tailwind
        div.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; font-family: sans-serif;";

        div.innerHTML = `
            <style>
                /* CSS Nội bộ đảm bảo hiển thị đúng 100% */
                .viva-btn { width: 60px; height: 60px; background: #38a169; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; transition: transform 0.3s; }
                .viva-btn:hover { transform: scale(1.1); background: #2f855a; }
                .viva-box { display: none; position: absolute; bottom: 80px; right: 0; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); flex-direction: column; border: 1px solid #e5e7eb; overflow: hidden; }
                .viva-header { background: #38a169; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
                .viva-msgs { flex: 1; padding: 15px; overflow-y: auto; background: #f9fafb; display: flex; flex-direction: column; gap: 10px; }
                .viva-input-area { padding: 15px; border-top: 1px solid #eee; display: flex; gap: 5px; background: white; }
                .viva-input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; outline: none; }
                .viva-send { background: #38a169; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }

                /* Tin nhắn */
                .msg-row { display: flex; width: 100%; }
                .msg-row.user { justify-content: flex-end; }
                .msg-row.bot { justify-content: flex-start; }
                .msg-bubble { padding: 10px 14px; border-radius: 10px; max-width: 80%; font-size: 14px; line-height: 1.4; }
                .msg-bubble.user { background: #38a169; color: white; border-bottom-right-radius: 0; }
                .msg-bubble.bot { background: #e5e7eb; color: #333; border-bottom-left-radius: 0; }
            </style>

            <!-- Nút Chat Tròn -->
            <button id="viva-toggle" class="viva-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>

            <!-- Hộp Chat -->
            <div id="viva-box" class="viva-box">
                <div class="viva-header">
                    <span>🌱 VivaVN Assistant</span>
                    <button id="viva-close" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">&times;</button>
                </div>
                <div id="viva-messages" class="viva-msgs">
                    <div class="msg-row bot">
                        <div class="msg-bubble bot">Chào bạn! Tôi là trợ lý ảo của VivaVN. Bạn cần tìm sản phẩm xanh nào? 🌿</div>
                    </div>
                </div>
                <div class="viva-input-area">
                    <input type="text" id="viva-input" class="viva-input" placeholder="Nhập câu hỏi...">
                    <button id="viva-send" class="viva-send">➤</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);
        console.log("✅ HTML Injected into DOM");

        // --- B. GẮN SỰ KIỆN (LOGIC JS) ---
        var toggleBtn = document.getElementById('viva-toggle');
        var box = document.getElementById('viva-box');
        var closeBtn = document.getElementById('viva-close');
        var sendBtn = document.getElementById('viva-send');
        var input = document.getElementById('viva-input');
        var msgs = document.getElementById('viva-messages');

        function toggleChat() {
            var isHidden = box.style.display === 'none' || box.style.display === '';
            box.style.display = isHidden ? 'flex' : 'none';
            if (isHidden) input.focus();
        }

        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        async function sendMessage() {
            var txt = input.value.trim();
            if (!txt) return;

            // 1. Hiện tin user
            msgs.innerHTML += `<div class="msg-row user"><div class="msg-bubble user">${txt}</div></div>`;
            input.value = '';
            msgs.scrollTop = msgs.scrollHeight;

            // 2. Hiện loading
            var loadingId = 'loading-' + Date.now();
            msgs.innerHTML += `<div id="${loadingId}" class="msg-row bot"><div class="msg-bubble bot" style="color:gray;font-style:italic;">Đang suy nghĩ...</div></div>`;
            msgs.scrollTop = msgs.scrollHeight;

            try {
                console.log("📡 Calling API...");
                // GỌI API BACKEND
                var res = await fetch("https://vivavn-chatbot-backend.onrender.com/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: txt })
                });

                var data = await res.json();
                document.getElementById(loadingId).remove();

                var reply = data.reply || "Xin lỗi, server đang bận.";
                reply = reply.replace(/\n/g, '<br>'); // Xuống dòng
                reply = reply.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:blue;text-decoration:underline;">$1</a>'); // Link

                msgs.innerHTML += `<div class="msg-row bot"><div class="msg-bubble bot">${reply}</div></div>`;
            } catch (err) {
                console.error(err);
                document.getElementById(loadingId).remove();
                msgs.innerHTML += `<div class="msg-row bot"><div class="msg-bubble bot" style="color:red;">Lỗi kết nối: ${err.message}</div></div>`;
            }
            msgs.scrollTop = msgs.scrollHeight;
        }

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // --- 2. CƠ CHẾ KÍCH HOẠT THÔNG MINH (QUAN TRỌNG NHẤT) ---
    // Kiểm tra xem trang đã tải xong chưa.
    // Nếu xong rồi (complete/interactive) -> CHẠY NGAY.
    // Nếu chưa (loading) -> Đợi sự kiện.
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initVivaChatbot();
    } else {
        document.addEventListener('DOMContentLoaded', initVivaChatbot);
    }

})();
```

**Bước 5:** Bấm **Commit changes** (Nút xanh lá).

---

### BƯỚC CUỐI CÙNG: CẬP NHẬT WORDPRESS ĐỂ KÉO CODE MỚI

Vào WordPress > Widget Custom HTML, sửa lại số phiên bản `v=` thành một số khác (ví dụ `2024`) để ép trình duyệt tải file mới em vừa sửa trên GitHub.

```html
<!-- CHATBOT VIVAVN -->
<!-- 1. Thư viện Tailwind (để hỗ trợ các phần khác nếu cần) -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- 2. Gọi file script (Thay đổi số v= để ép update) -->
<script src="https://cdn.jsdelivr.net/gh/NguyenTuan89/vivavn-chatbot-backend@main/chatbot.js?v=FINAL_FIX_2024"></script>