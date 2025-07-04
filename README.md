# Face Recognition Attendance System

Hệ thống điểm danh nhân viên bằng nhận diện khuôn mặt, giúp tự động hóa quy trình điểm danh, nâng cao hiệu quả quản lý nhân sự và đảm bảo tính minh bạch, chính xác.

## Tính năng chính

- Đăng ký, quản lý thông tin nhân viên
- Điểm danh tự động bằng nhận diện khuôn mặt (Face Recognition)
- Quản lý lịch sử điểm danh, xuất báo cáo
- Phân quyền quản trị viên và nhân viên

## Công nghệ sử dụng

- **Backend:** Python, Django, Django REST Framework, MySQL
- **Frontend:** React (Vite, TypeScript), TailwindCSS
- **Nhận diện khuôn mặt:** OpenCV, dlib/face_recognition
- **Triển khai:** Docker, Docker Compose

## Hướng dẫn cài đặt & chạy ứng dụng

### Yêu cầu hệ thống

- Python 3.9+
- Node.js 16+
- MySQL 8.0+

### Cài đặt thủ công

#### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

- Tạo database MySQL và cập nhật file `.env`:
  ```ini
  DB_NAME=facetechDB
  DB_USER=root
  DB_PASSWORD=your_password
  DB_HOST=localhost
  DB_PORT=3306
  ```

- Chạy migrations và tạo tài khoản quản trị:
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  python manage.py createsuperuser
  ```

- Khởi động server:
  ```bash
  python manage.py runserver
  ```

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

- Ứng dụng sẽ chạy tại:  
  - Backend: http://localhost:8000  
  - Frontend: http://localhost:3000

## Hướng dẫn nhanh để chạy dự án

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/VPhuc2704/Face-Recognition-Attendance-System-for-Employees-using-Python.git
   cd Face-Recognition-Attendance-System-for-Employees-using-Python
   ```

2. **Cài đặt backend và frontend:**
   - Làm theo hướng dẫn ở mục "Cài đặt thủ công" phía trên cho backend và frontend.

3. **Tài khoản quản trị:**
   - Sau khi migrate, tạo superuser bằng lệnh:
     ```bash
     python manage.py createsuperuser
     ```

4. **Cấu hình file môi trường:**
   - Đảm bảo đã tạo file `.env` cho backend với thông tin database như hướng dẫn.
   - Tạo file `frontend/.env` với nội dung:
     ```env
     VITE_API_URL=http://localhost:8000/api
     VITE_MEDIA_URL=http://localhost:8000
     ```


