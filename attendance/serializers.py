from .models import Attendance, AttendanceConfig
from rest_framework import serializers  

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
        
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep.pop('working_hours', None)  
        return rep
class AttendanceConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceConfig
        fields = ['id','check_in_time', 'check_out_time', 'created_at', 'updated_at']