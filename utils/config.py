from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    # --- NHÓM 1: BẮT BUỘC PHẢI CÓ (Lấy từ .env) ---
    GEMINI_API_KEY: str

    # --- NHÓM 2: CÓ GIÁ TRỊ MẶC ĐỊNH (Không bắt buộc trong .env) ---
    # Đây là cái em đang THIẾU:
    MODEL_NAME: str = "gemini-3-pro-preview"

    # Tên file kiến thức (Lưu ý: Phải khớp với tên file thật em đang có)
    KNOWLEDGE_FILE: str = "vivavn_full_knowledge.md"

    # --- CẤU HÌNH PYDANTIC ---
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Khởi tạo và kiểm tra ngay lập tức
try:
    config = Config()
    print(f"✅ Cấu hình OK. Model: {config.MODEL_NAME} | File: {config.KNOWLEDGE_FILE}")
except Exception as e:
    print(f"❌ LỖI CẤU HÌNH: {e}")
    # In ra hướng dẫn sửa lỗi rõ ràng
    print("👉 Kiểm tra: File .env đã có GOOGLE_API_KEY chưa? File .env đã nằm ở thư mục gốc chưa?")
    raise e