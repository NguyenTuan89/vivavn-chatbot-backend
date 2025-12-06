"""
**Nhiệm vụ:** Chỉ lo việc Upload file, lấy URI, và Xóa file khi tắt server.
**Tại sao Senior làm thế:** Tách biệt phần "Dữ liệu" ra khỏi phần "Xử lý".
Sau này em muốn đổi từ upload 1 file Markdown sang upload 10 file PDF,
em chỉ cần sửa đúng Class này, các chỗ khác không bị ảnh hưởng.
"""

from google import genai

class KnowledgeBase:
    def __init__(self, client: genai.Client, file_path: str):
        self.client = client
        self.file_path = file_path
        self.uploaded_file = None

        """
        self.client: Đây là "Cánh tay phải" để giao tiếp với Google. Nếu không lưu vào self, các hàm khác như upload() 
        hay cleanup() sẽ không có công cụ để làm việc.

        self.file_path: Đây là "Nhiệm vụ" cần làm (đường dẫn file). Lưu vào self để khi khởi tạo thì đưa file vào, 
        còn hàm upload sau này chỉ việc chạy mà không cần hỏi lại "file nào?".

        self.uploaded_file: Đây là "Kết quả" sau khi làm việc. Quan trọng nhất. 
        Nếu upload xong mà không lưu lại cái "Biên lai" (Object File), 
        thì sau này hàm cleanup() sẽ không biết phải xóa file nào, hàm get_uri() không biết lấy địa chỉ ở đâu.
        """

    def upload(self):
        print(f"📂 Đang tải kiến thức từ {self.file_path}...")
        try:
            self.uploaded_file = self.client.files.upload(file=self.file_path) # Hàm này trả về một đối tượng File. Đối tượng File mà Google trả về là metadata của file đã upload, gồm: name, uri, mime_type...
            print(f"✅ Upload xong. URI: {self.uploaded_file.uri}")
        except Exception as e:
            print(f"❌ Lỗi Upload: {e}")
            raise e

    def cleanup(self):
        if self.uploaded_file:
            self.client.files.delete(name=self.uploaded_file.name) #Hàm này không chỉ xóa file rồi im lặng, mà nó trả về một object thuộc class DeleteFileResponse. Đây là một object chứa thông tin về kết quả xóa file như: File đã được xóa chưa?
            print("🧹 Đã dọn dẹp file kiến thức.")

    def get_uri(self):
        return self.uploaded_file.uri if self.uploaded_file else None