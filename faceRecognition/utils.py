
from employees.models import Employee
from django.conf import settings
import os
import face_recognition

def load_user_faces(user):
    try:
        employees = Employee.objects.get(user=user)
        image_path = employees.employeeImg.path
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            return encodings[0], employees.id
        else:
            print(f"Không tìm thấy khuôn mặt trong ảnh của nhân viên: {employees.full_name}")
            return None, None

    except Exception as e:
        print(f"Lỗi xử lý ảnh của {employees.full_name}: {e}")
        return None, None