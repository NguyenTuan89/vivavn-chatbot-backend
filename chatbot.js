(function () {
    // 1. Định nghĩa hàm khởi tạo (Logic chính)
    function initChatbot() {
        // Chống trùng lặp: Nếu đã có bot rồi thì thôi
        if (document.getElementById("viva-chatbot-container")) return;

        console.log("🚀 VivaVN Chatbot: Starting initialization...");

        // --- PHẦN HTML & CSS (Giữ nguyên logic của em) ---
        var chatContainer = document.createElement("div");
        chatContainer.id = "viva-chatbot-container";
        chatContainer.className = "fixed bottom-4 right-4 z-[2147483647] font-sans"; // Tailwind classes
        chatContainer.innerHTML = `
            <button id="chat-toggle-btn" class="bg-[#38a169] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl cursor-pointer hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>

            <div id="chat-box" class="hidden absolute bottom-20 right-0 w-[350px] max-w-[90vw] h-[500px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
                <div class="bg-[#38a169] p-4 flex justify-between items-center text-white">
                    <span class="font-bold flex items-center gap-2">🌱 Vivavn Support</span>
                    <button id="chat-close-btn" class="hover:text-gray-200 text-xl font-bold">&times;</button>
                </div>

                <div id="chat-messages" class="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
                    <div class="flex justify-start">
                        <div class="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[85%] text-sm">
                            Xin chào! Tôi là trợ lý ảo AI của Vivavn. Tôi có thể giúp gì cho bạn về các sản phẩm Eco? 🌿
                        </div>
                    </div>
                </div>

                <div class="p-3 border-t bg-white flex gap-2">
                    <input type="text" id="user-input" placeholder="Nhập câu hỏi..." class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#38a169]">
                    <button id="send-btn" class="bg-[#38a169] text-white px-4 py-2 rounded-lg hover:bg-[#2f855a] transition-colors">
                        ➤
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(chatContainer);

        // --- PHẦN JAVASCRIPT LOGIC (QUAN TRỌNG) ---
        // Lấy elements sau khi đã append vào DOM
        var toggleBtn = document.getElementById("chat-toggle-btn");
        var chatBox = document.getElementById("chat-box");
        var closeBtn = document.getElementById("chat-close-btn");
        var sendBtn = document.getElementById("send-btn");
        var userInput = document.getElementById("user-input");
        var messagesDiv = document.getElementById("chat-messages");

        // Logic Bật/Tắt
        function toggleChat() {
            chatBox.classList.toggle("hidden");
            if (!chatBox.classList.contains("hidden")) {
                userInput.focus();
            }
        }

        toggleBtn.addEventListener("click", toggleChat);
        closeBtn.addEventListener("click", toggleChat);

        // Logic Gửi tin (Call API)
        async function sendMessage() {
            var text = userInput.value.trim();
            if (!text) return;

            // 1. Hiển thị tin nhắn user
            messagesDiv.innerHTML += `
                <div class="flex justify-end">
                    <div class="bg-[#38a169] text-white p-3 rounded-lg rounded-br-none max-w-[85%] text-sm">
                        ${text}
                    </div>
                </div>`;
            userInput.value = "";
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // 2. Hiển thị loading
            var loadingId = "loading-" + Date.now();
            messagesDiv.innerHTML += `
                <div id="${loadingId}" class="flex justify-start">
                    <div class="bg-gray-200 text-gray-500 p-3 rounded-lg rounded-bl-none text-xs italic">
                        Đang suy nghĩ...
                    </div>
                </div>`;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            try {
                // GỌI API BACKEND CỦA EM
                var response = await fetch("https://vivavn-chatbot-backend.onrender.com/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text }) // API của em đang nhận key là "message" đúng không?
                });

                var data = await response.json();
                document.getElementById(loadingId).remove();

                // 3. Hiển thị tin nhắn Bot
                var botReply = data.reply || "Xin lỗi, hệ thống đang bận.";

                // Format link Markdown [text](url) thành thẻ <a> (nếu cần)
                botReply = botReply.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 underline font-bold">$1</a>');
                // Format xuống dòng
                botReply = botReply.replace(/\n/g, '<br>');

                messagesDiv.innerHTML += `
                    <div class="flex justify-start">
                        <div class="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[85%] text-sm">
                            ${botReply}
                        </div>
                    </div>`;

            } catch (err) {
                console.error("Chatbot Error:", err);
                document.getElementById(loadingId).remove();
                messagesDiv.innerHTML += `<div class="text-red-500 text-xs p-2">Lỗi kết nối server.</div>`;
            }
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        sendBtn.addEventListener("click", sendMessage);
        userInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") sendMessage();
        });

        console.log("✅ VivaVN Chatbot: Events attached successfully!");
    }

    // 2. Cơ chế "Check tàu" (Kiểm tra trạng thái load trang)
    if (document.readyState === "loading") {
        // Nếu trang đang tải, thì đợi
        document.addEventListener("DOMContentLoaded", initChatbot);
    } else {
        // Nếu trang đã tải xong rồi, CHẠY NGAY LẬP TỨC
        initChatbot();
    }
})();