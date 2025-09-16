from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import *
from .models import Employee, SalaryDeduction


class EmployeeView(APIView):
    def get(self, request):

        employees = Employee.objects.filter(is_active=True)
        serializer = EmployeeSerializer(employees, many=True)

        return Response(serializer.data)


class DeductionView(APIView):
    def get(self, request):
        employee_id = request.query_params.get("employee_id", None)
        if employee_id:
            deductions = SalaryDeduction.objects.filter(
                employee=employee_id, is_active=True
            )
            serializer = DeductionSerializer(deductions, many=True)
            return Response(serializer.data)
        return Response({"error": "employee_id needed"})
