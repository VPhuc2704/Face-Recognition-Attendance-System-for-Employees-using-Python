
from django.db import models
# Create your models here.
from django.db import models

# Create your models here.
from employees.models import Employee
from datetime import time # Thêm dòng này
class Attendance(models.Model):
    # id = models.AutoField(primary_key=True)
    employeeId = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    check_in_location = models.CharField(max_length=255, null=True, blank=True)
    check_out_location = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=10, choices=[('Present', 'Có mặt'),('Late','Trễ giờ'), ('Absent', 'Vắng mặt')], default='Present')
    reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Attendance record for {self.employeeId.user.full_name} - {self.date} -{self.check_in.strftime('%Y-%m-%d %H:%M:%S')}"
    
    def save(self, *args, **kwargs):
        if not self.status:
            if not self.check_in:
                self.status = 'Absent'
            elif self.check_in.time() > time(hour=8, minute=0 , second=0):
                self.status = 'Late'
            else:
                self.status = 'Present'
        super().save(*args, **kwargs)