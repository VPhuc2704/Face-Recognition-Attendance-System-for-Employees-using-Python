
from django.shortcuts import render
import cv2
import numpy as np
import face_recognition
from django.http import JsonResponse
import base64
from employees.models import Employee
from attendance.models import Attendance
from django.utils.timezone import now
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from employees.serializers import User
from faceRecognition.utils import load_known_faces
import logging

logger = logging.getLogger(__name__)

# @method_decorator(csrf_exempt, name='dispatch')
class FaceRecognitionView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        if request.method != 'POST':
            return JsonResponse({"status": "error", "message": "Chỉ chấp nhận POST request"}, status=405)
        try:
            image_base64 = request.data.get("image")
            if not image_base64:
                return JsonResponse({"status": "error", "message": "Không có dữ liệu hình ảnh"}, status=400)
            
            try:
                if "," in image_base64:
                    image_base64 = image_base64.split(",")[1]

                image_data = base64.b64decode(image_base64)
                np_arr = np.frombuffer(image_data, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                if frame is None:
                    return JsonResponse({"status": "error", "message": "Không thể xữ lý hình ảnh gửi lên"}, status=400) 
            except (base64.binascii.Error, ValueError) as DecodingError:
                return JsonResponse({
                    "status": "error",
                    "message": "Ảnh không hợp lệ hoặc không thể giải mã",
                    "debug": str(DecodingError)
                }, status=400)


            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            known_face_encodings, known_face_ids  = load_known_faces()
            if  known_face_encodings is None:
                return JsonResponse({"status": "error", "message": "Không có dữ liệu khuôn mặt"}, status=400)

            face_locations = face_recognition.face_locations(rgb_frame) # Phát hiện khuôn mặt trong ảnh
            if not face_locations:
                return JsonResponse({"status": "error", "message": "Không phát hiện khuôn mặt"}, status=400)
            

            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations) # Lấy đặc trưng khuôn mặt

            recognized_id = None
            max_attempts = 15  # Giảm số lần thử để tăng tốc độ
            attempt = 0

            while attempt < max_attempts and not recognized_id:
                
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
                    action = request.data.get("action", "")
                    if action not in ["check_in", "check_out"]:
                        return JsonResponse({
                            "status": "error",
                            "message": "Trường 'action' bắt buộc và chỉ chấp nhận 'check_in' hoặc 'check_out'"
                        }, status=400)
                    # Kiểm tra đã điểm danh chưa
                    today = now().date() # Lấy ngày hiện tại
                    # taor attendance nếu chưa có

                    attendance = Attendance.objects.filter(
                        employeeId_id=recognized_id,
                        date=today,
                    ).first()
                    if action == "check_in":
                        if not attendance:
                            attendance = Attendance.objects.create(
                                employeeId_id=recognized_id,
                                date=today,
                                check_in = now()
                            )
                            attendance.save()
                            return JsonResponse({
                                "status": "success",
                                "action": "check_in",
                                "message": f"{employee.full_name()} đã check-in thành công lúc {attendance.check_in.strftime('%H:%M:%S')}",
                                "employee": {
                                    "employeeId": recognized_id,
                                    "employee_name": employee.full_name(),
                                    "department": employee.department.name if employee.department else None,
                                    "position": employee.position.name if employee.position else None,
                                    "employee_code": employee.employee_code,
                                },
                                "attendance": {
                                    "check_in": attendance.check_in.strftime("%Y-%m-%d %H:%M:%S"),
                                    "status": attendance.status,
                                }
                            })
                        if not attendance.check_in:
                            attendance.check_in = now()
                            attendance.save()
                            return JsonResponse({
                                "status": "success",
                                "action": "check_in",
                                "message": f" {employee.full_name()} đã check-in thành công lúc {attendance.check_in.strftime('%H:%M:%S')}",
                                "employee":{
                                    "employeeId": recognized_id,
                                    "employee_name": employee.full_name(),
                                    "department": employee.department.name if employee.department else None,
                                    "position": employee.position.name if employee.position else None,
                                    "employee_code": employee.employee_code,
                                },
                                "attendance":{
                                    "check_in": now().strftime("%Y-%m-%d %H:%M:%S"),
                                    "status": attendance.status,
                                }
                            })
                        else:
                            return JsonResponse({
                                "status": "warning",
                                "message": f"{employee.full_name()} đã check-in hôm nay.",
                                "employee":{
                                    "employeeId": recognized_id,
                                    "employee_name": employee.full_name(),
                                    "department": employee.department.name if employee.department else None,
                                    "position": employee.position.name if employee.position else None,
                                    "employee_code": employee.employee_code,
                                },
                                "attendance":{
                                    "check_in": attendance.check_in.strftime("%Y-%m-%d %H:%M:%S"),
                                    "check_out": attendance.check_out.strftime("%Y-%m-%d %H:%M:%S") if attendance.check_out else None,
                                    "status": attendance.status,
                                }
                            })
                    elif action == "check_out":
                        if not attendance:
                            return JsonResponse({
                                "status": "error",
                                "message": f"{employee.full_name()} chưa check-in hôm nay nên không thể check-out"
                            }, status=400)
                        elif not attendance.check_out:
                            attendance.check_out = now()
                            attendance.save()
                            return JsonResponse({
                                "status": "success",
                                "action": "check_out",
                                "message": f"{employee.full_name()} đã check-out thành công lúc {attendance.check_out.strftime('%H:%M:%S')}",
                                "employee":{
                                    "employeeId": recognized_id,
                                    "employee_name": employee.full_name(),
                                    "department": employee.department.name if employee.department else None,
                                    "position": employee.position.name if employee.position else None,
                                    "employee_code": employee.employee_code,
                                },
                                "attendance":{
                                    "check_out": now().strftime("%Y-%m-%d %H:%M:%S"),
                                }
                            }) 
                        else:
                            return JsonResponse({
                                "status": "warning",
                                "message": f"{employee.full_name()} đã check out hôm nay.",
                                "employee":{
                                    "employeeId": recognized_id,
                                    "employee_name": employee.full_name(),
                                    "department": employee.department.name if employee.department else None,
                                    "position": employee.position.name if employee.position else None,
                                    "employee_code": employee.employee_code,
                                },
                                "attendance":{
                                    "check_in": attendance.check_in.strftime("%Y-%m-%d %H:%M:%S"),
                                    "check_out": attendance.check_out.strftime("%Y-%m-%d %H:%M:%S") if attendance.check_out else None,
                                    "status": attendance.status,
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