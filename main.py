import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from services.bot_manager import VivavnBot

# --- CẤU HÌNH LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- DATA MODELS ---
class ChatRequest(BaseModel):
    message: str


# --- KHỞI TẠO ---
bot = VivavnBot()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Bật Bot (Upload knowledge cũ lên Google)
    await bot.startup()
    logger.info("✅ Bot đã khởi động và sẵn sàng.")

    yield

    # 2. Tắt Bot (Dọn dẹp file trên Cloud)
    await bot.shutdown()


app = FastAPI(lifespan=lifespan)

# --- CẤU HÌNH CORS (BẮT BUỘC ĐỂ DASHBOARD CHẠY ĐƯỢC) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 1. API CHAT (Dành cho khách hàng) ---
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response_text = await bot.chat(request.message)
        return {"reply": response_text}
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        return {"reply": "Xin lỗi, Bot đang gặp sự cố nhỏ."}


# --- 2. API HISTORY (Dành cho Admin Dashboard) ---
@app.get("/history")
async def history_endpoint(admin_secret: str = Header(None)):
    # Lấy mật khẩu từ Header để bảo mật (Khớp với file HTML Dashboard)
    if admin_secret != "VivavnAdmin888":
        raise HTTPException(status_code=403, detail="Sai mật khẩu Admin!")

    # Lấy 50 tin nhắn gần nhất từ SQLite
    logs = bot.history.get_recent_chats(limit=50)
    return {"count": len(logs), "logs": logs}