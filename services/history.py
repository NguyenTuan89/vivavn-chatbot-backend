import sqlite3
import json
from datetime import datetime


class HistoryManager:
    def __init__(self, db_path="chatbot_memory.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Khởi tạo Database nếu chưa có"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        # Tạo bảng lưu lịch sử chat
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                user_msg TEXT,
                bot_reply TEXT,
                meta TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def save_chat(self, user_msg: str, bot_reply: str, meta: dict = None):
        """Lưu cuộc hội thoại vào DB"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Thời gian hiện tại
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            meta_json = json.dumps(meta) if meta else "{}"

            cursor.execute('''
                INSERT INTO chat_history (timestamp, user_msg, bot_reply, meta)
                VALUES (?, ?, ?, ?)
            ''', (now, user_msg, bot_reply, meta_json))

            conn.commit()
            conn.close()
            # print("💾 Đã lưu lịch sử chat.")
        except Exception as e:
            print(f"❌ Lỗi lưu history: {e}")

    def get_recent_chats(self, limit=20):
        """Lấy danh sách chat gần đây để hiển thị lên Admin Dashboard"""
        conn = sqlite3.connect(self.db_path)
        # Trả về kết quả dạng Dictionary thay vì Tuple
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM chat_history ORDER BY id DESC LIMIT ?
        ''', (limit,))

        rows = cursor.fetchall()
        conn.close()

        # Convert sang list dict để trả về JSON
        return [dict(row) for row in rows]