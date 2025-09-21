from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import *


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        # fields = '__all__'
        exclude = [
            "password",
            "is_superuser",
            "last_login",
            "is_staff",
            "groups",
            "user_permissions",
            "phone_number",
        ]


class EmployeeSerializer(ModelSerializer):
    user = UserSerializer()
    name = SerializerMethodField()

    class Meta:
        model = Employee
        fields = "__all__"

    def get_name(self, obj):
        first_name = obj.user.first_name
        last_name = obj.user.last_name

        return f"{first_name} {last_name}"


class DeductionSerializer(ModelSerializer):
    class Meta:
        model = SalaryDeduction
        fields = "__all__"


class AllowanceSerializer(ModelSerializer):
    class Meta:
        model = Allowance
        fields = "__all__"


class LeaveSerializer(ModelSerializer):
    employee = EmployeeSerializer()
    class Meta:
        model = Leave
        fields = "__all__"


class AttendanceRecordSerializer(ModelSerializer):
    employee = EmployeeSerializer()
    class Meta:
        model = AttendanceRecord
        fields = "__all__"
