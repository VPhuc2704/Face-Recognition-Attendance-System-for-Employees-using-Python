# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
create frontend/.env
```js
VITE_API_URL=http://localhost:8000/api
VITE_MEDIA_URL=http://localhost:8000
```
=======
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

