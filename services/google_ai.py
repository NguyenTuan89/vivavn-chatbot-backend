from google import genai
from google.genai import types


class AIEngine:
    def __init__(self, api_key: str, model_name: str = "gemini-3-pro-preview"):
        """
        Khởi tạo bộ não AI.
        :param api_key: Chìa khóa để gọi Google.
        :param model_name: Tên model (mặc định dùng bản Flash-002 cho nhanh và khôn).
        """
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name

        # System Instruction: 'Luật chơi' cốt lõi cho Bot
        # (Em có thể tách cái này ra file config riêng nếu nó quá dài)
        self.system_instruct = """
        Bạn là trợ lý ảo của Vivavn. Dưới đây là file kiến thức chứa toàn bộ nội dung website. 
        Nhiệm vụ của bạn là trả lời bằng tiếng Anh thân thiện, ngắn gọn và chỉ dựa trên thông tin trong file đính kèm. 
        Với thông tin liên quan bạn hãy dẫn link bài viết để khách hàng có click vào đọc trực tiếp trong website vivavn
        """

    def generate_response(self, user_msg: str, knowledge_uri: str = None, tools: list = None):
        """
        Hàm xử lý chính: Nhận câu hỏi -> Gửi Google -> Trả về câu trả lời.
        """

        # BƯỚC 1: ĐÓNG GÓI GÓI HÀNG (PARTS)
        # Chúng ta dùng một danh sách (list) để chứa các phần của tin nhắn
        parts_list = []

        # A. Nếu có file kiến thức (RAG), nhét nó vào gói hàng trước
        if knowledge_uri:
            # Xác định loại file (Ở đây mặc định là Markdown .md vì em đang dùng knowledge.md)
            # Nếu sau này em dùng PDF, em cần truyền mime_type="application/pdf"
            parts_list.append(
                types.Part(
                    file_data=types.FileData(
                        file_uri=knowledge_uri,
                        mime_type="text/markdown"
                    )
                )
            )

        # B. Nhét câu hỏi của khách vào sau cùng
        parts_list.append(types.Part.from_text(text=user_msg))

        # BƯỚC 2: CẤU HÌNH (CONFIG)
        # Thiết lập các công cụ và luật chơi cho lần gọi này
        generate_config = types.GenerateContentConfig(
            system_instruction=self.system_instruct,
            tools=tools,  # Danh sách công cụ (như Google Maps) nếu có
            temperature=0.7,  # Độ sáng tạo (0.7 là mức cân bằng tốt nhất)
            # response_modalities=["TEXT"] # Bắt buộc trả về text (tránh lỗi format lạ)
        )

        # BƯỚC 3: GỌI API (CÓ XỬ LÝ LỖI)
        try:
            print(f"🤖 Bot đang suy nghĩ... (Model: {self.model_name})")

            # Tạo nội dung gửi đi
            contents = [
                types.Content(
                    role="user",
                    parts=parts_list
                )
            ]

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=generate_config
            )

            # Trả về văn bản kết quả
            return response.text

        except Exception as e:
            # Đây là tư duy Senior: Không bao giờ để app bị Crash (sập)
            # Nếu lỗi, hãy in lỗi ra log và trả về một câu xin lỗi lịch sự cho khách.
            print(f"❌ Lỗi nghiêm trọng trong AIEngine: {e}")
            return "Xin lỗi, hệ thống Vivavn đang quá tải một chút. Bạn vui lòng hỏi lại sau 30 giây nhé! 🙏"

