
from employees.models import Employee
from django.conf import settings
import os
import face_recognition

def load_known_faces():
    known_face_encodings = []
    known_face_ids = []

    employees = Employee.objects.exclude(employeeImg='')
    
    for emp in employees:
        try:
            image_path = emp.employeeImg.path
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)

            if encodings:
                known_face_encodings.append(encodings[0])
                known_face_ids.append(emp.id)
            else:
                print(f"Không tìm thấy khuôn mặt trong ảnh của nhân viên: {emp.full_name}")
        except Exception as e:
            print(f"Lỗi xử lý ảnh của {emp.full_name}: {e}")

    return known_face_encodings, known_face_ids