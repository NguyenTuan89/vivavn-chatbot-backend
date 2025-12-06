from google import genai
from utils.config import Config
from services.knowledge import KnowledgeBase
from services.google_ai import AIEngine
from services.history import HistoryManager  # <-- Thêm dòng này


class VivavnBot:
    def __init__(self):
        self.config = Config()
        self.client = genai.Client(api_key=self.config.GEMINI_API_KEY)
        self.history = HistoryManager()

        # Khởi tạo các bộ phận
        self.kb = KnowledgeBase(self.client, self.config.KNOWLEDGE_FILE)
        self.ai = AIEngine(self.config.GEMINI_API_KEY, self.config.MODEL_NAME)

    async def startup(self):
        # Quy trình bật máy: Upload file
        self.kb.upload()

    async def shutdown(self):
        # Quy trình tắt máy: Xóa file
        self.kb.cleanup()

    async def chat(self, user_message: str):
        # BƯỚC 1: GỌI AI TRƯỚC (Phải có cái này mới có câu trả lời)
        # Gán kết quả vào một biến, ví dụ 'bot_response'
        bot_response = await self.ai.generate_response(
            user_msg=user_message,
            knowledge_uri=self.kb.get_uri()
        )

        # BƯỚC 2: CÓ CÂU TRẢ LỜI RỒI MỚI LƯU LẠI
        self.history.save_chat(
            user_msg=user_message,
            bot_reply=bot_response,  # Lúc này biến bot_response đã có dữ liệu
            meta={"source": "website"}
        )

        # BƯỚC 3: TRẢ VỀ KẾT QUẢ
        return bot_response