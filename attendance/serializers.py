from .models import Attendance
from rest_framework import serializers  

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
        
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep.pop('working_hours', None)  
        return rep