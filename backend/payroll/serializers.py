from rest_framework.serializers import ModelSerializer
from .models import *

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class EmployeeSerializer(ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Employee
        fields = '__all__'
        
class DeductionSerializer(ModelSerializer):
    class Meta:
        model = SalaryDeduction
        fields = '__all__'