import sqlite3
from datetime import datetime
import json


class HistoryManager:
    def __init__(self, db_path="vivavn_chat.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Khởi tạo bảng nếu chưa có (Chạy 1 lần đầu)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Tạo bảng lưu lịch sử
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME,
                user_message TEXT,
                bot_reply TEXT,
                metadata TEXT  -- Lưu thêm thông tin phụ (ví dụ: độ trễ, model dùng...)
            )
        ''')
        conn.commit()
        conn.close()

    def save_chat(self, user_msg, bot_reply, meta=None):
        """Lưu cuộc hội thoại vào sổ cái"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        meta_json = json.dumps(meta) if meta else "{}"

        cursor.execute('''
            INSERT INTO chat_logs (timestamp, user_message, bot_reply, metadata)
            VALUES (?, ?, ?, ?)
        ''', (timestamp, user_msg, bot_reply, meta_json))

        conn.commit()
        conn.close()
        print(f"💾 Đã lưu log chat lúc {timestamp}")

    def get_recent_chats(self, limit=10):
        """Xem lại 10 tin nhắn gần nhất (Dùng để debug)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM chat_logs ORDER BY id DESC LIMIT ?', (limit,))
        rows = cursor.fetchall()
        conn.close()
        return rows





