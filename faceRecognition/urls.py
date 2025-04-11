from django.urls import path
from .views import FaceRecognitionView
urlpatterns = [
   path("check_in", FaceRecognitionView.as_view(), name="face_recognition_employee"),
]
