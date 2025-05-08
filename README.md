Dưới đây là phần **Hướng dẫn chạy ứng dụng** bạn có thể thêm vào file README.md của dự án, được định dạng rõ ràng theo markdown:

```markdown
##  Hướng Dẫn Cài Đặt và Chạy Ứng Dụng

### Yêu Cầu Hệ Thống
- Python 3.9+
- MySQL 8.0+
- Django 4.2

### Cài Đặt Ban Đầu
1. **Clone repository**:
git clone https://github.com/your-username/facetechs.git
cd facetechs
```


### Cấu Hình Database
1. Tạo database trong MySQL:
```sql
CREATE DATABASE facetechDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Cập nhật thông tin database trong file `.env` (tạo mới nếu chưa có):
```ini
DB_NAME=facetechDB
DB_USER=root
DB_PASSWORD="password"
DB_HOST=localhost
DB_PORT=3306
```

### Chạy Ứng Dụng
1. **Áp dụng migrations**:
```bash
python manage.py makemigrations
python manage.py migrate
```

2. **Tạo superuser (quản trị viên)**:
```bash
python manage.py createsuperuser
```

3. **Khởi động server**:
```bash
python manage.py runserver
```

Truy cập ứng dụng tại: http://localhost:8000


