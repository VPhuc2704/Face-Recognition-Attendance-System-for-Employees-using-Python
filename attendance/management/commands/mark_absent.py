from datetime import date
from django.core.management.base import BaseCommand
from attendance.models import Attendance
from employees.models import Employee

class Command(BaseCommand):
    help = 'Đánh dấu nhân viên vắng mặt nếu chưa check-in trước 10:00 sáng'

    def handle(self, *args, **kwargs):
        today = date.today()
        all_employees = Employee.objects.filter(status="Active")
        for employee in all_employees:
            if not Attendance.objects.filter(employeeId=employee, date=today).exists():
                Attendance.objects.create(
                    employeeId=employee,
                    date=today,
                    status="Absent",
                )
        self.stdout.write(self.style.SUCCESS('Đã đánh dấu vắng mặt cho các nhân viên chưa check-in.'))