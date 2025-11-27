from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from services.bot_manager import VivavnBot


class ChatRequest(BaseModel):
    message: str


bot = VivavnBot()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await bot.startup()
    yield
    await bot.shutdown()


app = FastAPI(lifespan=lifespan)

# Cấu hình CORS (Đảm bảo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # --- PHẦN SỬA LỖI ĐÓNG GÓI JSON ---
    # 1. Chờ kết quả từ bot (chuỗi văn bản thô)
    response_text = await bot.chat(request.message)

    # 2. Đóng gói chuỗi văn bản đó vào một Dictionary có key "reply"
    # Đây là format mà code Javascript của em mong đợi
    return {"reply": response_text}


@app.get("/logs")
async def view_logs():
    # Lấy 20 tin nhắn gần nhất
    recent_chats = bot.history.get_recent_chats(limit=20)
    return {"history": recent_chats}