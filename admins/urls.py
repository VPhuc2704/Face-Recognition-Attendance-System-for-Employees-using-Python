from django.urls import path
from .views import AdminCreateAttendanceView, AdminUserViewSet
# from admins.views import EmployeeViewSet

admin_user = AdminUserViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
admin_user_detail = AdminUserViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'delete': 'destroy',
})
urlpatterns = [
    path('users', admin_user, name='admin-add-users'),
    path('users/<int:pk>', admin_user_detail, name='admin-update-users'),
    path('createAttend', AdminCreateAttendanceView.as_view(), name='attendance_history'),
]
