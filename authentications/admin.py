from django.contrib import admin

# Register your models here.
from .models import User
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'firstName', 'lastName', 'role', 'is_staff', 'is_superuser')
    fields = ('email', 'firstName', 'lastName', 'role', 'is_staff', 'is_superuser') 
    search_fields = ('email', 'firstName', 'lastName')

    def save_model(self, request, obj, form, change):
       
        if obj.role == "admin":
            obj.is_staff = True
            obj.is_superuser = False 
        else:
            obj.is_staff = False
            obj.is_superuser = False 

        super().save_model(request, obj, form, change)


admin.site.register(User, UserAdmin)