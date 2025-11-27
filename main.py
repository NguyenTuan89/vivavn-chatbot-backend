from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel # <--- THÊM CÁI NÀY
from services.bot_manager import VivavnBot

"""uvicorn main:app --reload --port 5000"""

# Định nghĩa cái khuôn dữ liệu (Schema)
class ChatRequest(BaseModel):
    message: str

bot = VivavnBot()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await bot.startup()
    yield
    await bot.shutdown()

app = FastAPI(lifespan=lifespan)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest): # <--- NHẬN OBJECT, KHÔNG NHẬN CHUỖI
    # Lấy message từ trong cái bọc JSON ra
    return await bot.chat(request.message)

@app.get("/logs")
async def view_logs():
    # Lấy 20 tin nhắn gần nhất
    recent_chats = bot.history.get_recent_chats(limit=20)
    return {"history": recent_chats}