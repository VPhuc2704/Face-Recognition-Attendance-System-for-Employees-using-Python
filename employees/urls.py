from django.urls import path
from employees.views import EmployeeProfileWiew
urlpatterns = [
  path('profile', EmployeeProfileWiew.as_view(), name='employee'),
]
