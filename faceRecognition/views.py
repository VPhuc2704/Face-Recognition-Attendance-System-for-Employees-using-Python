
from django.shortcuts import render
import cv2
import numpy as np
import face_recognition
from django.http import JsonResponse
from employees.models import Employee
from attendance.models import Attendance
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from employees.serializers import User
from faceRecognition.utils import load_known_faces
import logging

logger = logging.getLogger(__name__)

# @method_decorator(csrf_exempt, name='dispatch')
class FaceRecognitionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Kiểm tra request method
        if request.method != 'POST':
            return JsonResponse({"status": "error", "message": "Chỉ chấp nhận POST request"}, status=405)
        
        # Khởi tạo camera
        cap = None
        try:
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                return JsonResponse({"status": "error", "message": "Không thể mở camera"}, status=500)
            
            # Thiết lập độ phân giải camera
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            # Tải dữ liệu khuôn mặt đã biết
            known_face_encodings, known_face_ids = load_known_faces()
            if not known_face_encodings:
                return JsonResponse({"status": "error", "message": "Không có dữ liệu khuôn mặt"}, status=400)
            
            recognized_id = None
            max_attempts = 15  # Giảm số lần thử để tăng tốc độ
            attempt = 0
            
            while attempt < max_attempts and not recognized_id:
                ret, frame = cap.read()
                if not ret:
                    attempt += 1
                    continue
                
                # Chuyển đổi màu từ BGR (OpenCV) sang RGB (face_recognition)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Phát hiện khuôn mặt
                face_locations = face_recognition.face_locations(rgb_frame)
                if not face_locations:
                    attempt += 1
                    continue
                
                # Lấy đặc trưng khuôn mặt
                face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                
                for face_encoding in face_encodings:
                    # So sánh với các khuôn mặt đã biết
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
                    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                    
                    if True in matches:
                        best_match_index = np.argmin(face_distances)
                        if matches[best_match_index]:
                            recognized_id = known_face_ids[best_match_index]
                            break
                
                attempt += 1
            
            # Xử lý sau nhận diện
            if recognized_id:
                try:

                    employee = Employee.objects.get(id=recognized_id)
                    # Kiểm tra đã điểm danh chưa
                    today = now().date() # Lấy ngày hiện tại
                    if Attendance.objects.filter(employeeId_id=recognized_id, date=today).exists(): 
                        return JsonResponse({
                            "status": "warning",
                            "message": f"{employee.full_name()} đã điểm danh hôm nay."
                        })
                    
                    # Tạo bản ghi điểm danh
                    Attendance.objects.create(
                        employeeId_id=recognized_id,
                        date=today,
                        check_in=now(),
                        check_in_location="Phòng AI",
                        status="Present"
                    )
                    
                    return JsonResponse({
                        "status": "success",
                        "message": f"Điểm danh thành công cho {employee.full_name()}",
                        "employee":{
                            "employeeId": recognized_id,
                            "employee_name": employee.full_name(),
                            "department": employee.department.name if employee.department else None,
                            "position": employee.position.name if employee.position else None,
                            "employee_code": employee.employee_code,
                        },
                        "attendance":{
                            "check_in": now().strftime("%Y-%m-%d %H:%M:%S"),
                            "status": employee.status,
                        }
                    })
                
                except Employee.DoesNotExist:
                    return JsonResponse({
                        "status": "error",
                        "message": "Không tìm thấy nhân viên trong hệ thống"
                    }, status=404)
            
            return JsonResponse({
                "status": "fail",
                "message": "Không nhận diện được khuôn mặt hoặc không có khuôn mặt nào phù hợp"
            })
        
        except Exception as e:
            logger.error(f"Lỗi trong quá trình nhận diện: {str(e)}", exc_info=True)
            return JsonResponse({
                "status": "error",
                "message": f"Có lỗi xảy ra: {str(e)}"
            }, status=500)
        
        finally:
            # Giải phóng tài nguyên
            if cap is not None and cap.isOpened():
                cap.release()
            cv2.destroyAllWindows()