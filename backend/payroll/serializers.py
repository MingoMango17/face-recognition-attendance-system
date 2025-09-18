from rest_framework.serializers import ModelSerializer
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

    class Meta:
        model = Employee
        fields = "__all__"


class DeductionSerializer(ModelSerializer):
    class Meta:
        model = SalaryDeduction
        fields = "__all__"

class AllowanceSerializer(ModelSerializer):
    class Meta:
        model = Allowance
        fields = "__all__"