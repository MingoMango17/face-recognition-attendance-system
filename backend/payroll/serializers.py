from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework import serializers
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


class PayslipSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Payslip
        fields = '__all__'
        read_only_fields = ["id", "generated_at"]


class PayslipCreateSerializer(serializers.Serializer):
    """Serializer for payslip generation requests"""

    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        help_text="List of employee IDs to generate payslips for",
    )
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    total_working_days = serializers.IntegerField(
        min_value=1, max_value=31, required=True
    )
    auto_calculate_attendance = serializers.BooleanField(default=False, required=False)


class PayslipUpdateSerializer(serializers.Serializer):
    """Serializer for payslip updates"""

    status = serializers.IntegerField(required=False)
    total_working_days = serializers.IntegerField(
        min_value=1, max_value=31, required=False
    )
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
