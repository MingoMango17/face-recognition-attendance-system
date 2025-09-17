from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from .serializers import *
from .models import Employee, SalaryDeduction, Allowance
import json


class EmployeeView(APIView):
    def get(self, request):

        employees = Employee.objects.filter(is_active=True)
        serializer = EmployeeSerializer(employees, many=True)

        return Response(serializer.data)

    def post(self, request):
        data = request.data

        # User Data
        first_name = data.get("first_name", None)
        last_name = data.get("last_name", None)
        username = data.get("username", None)
        password = data.get("password", None)

        # Employee Data
        department = data.get("department", None)
        salary_type = data.get("salary_type", None)
        salary = data.get("salary", None)

        # Deduction data
        deductions = data.get("deductions", None)

        # Allowance data
        allowances = data.get("allowances", None)

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    first_name=first_name,
                    last_name=last_name,
                    username=username,
                    password=password,
                )

                employee = Employee.objects.create(
                    user=user,
                    department=department,
                    salary_type=salary_type,
                    salary=salary,
                )

                deductions_to_add = []
                for deduction in deductions:
                    deduction_type = deduction.get("deduction_type")
                    value = deduction.get("value")
                    deductions_to_add.append(
                        SalaryDeduction(
                            deduction_type=deduction_type,
                            value=value,
                            employee=employee,
                        )
                    )

                SalaryDeduction.objects.bulk_create(deductions_to_add)

                allowance_to_add = []
                for allowance in allowances:
                    allowance_type = allowance.get("allowance_type")
                    value = allowance.get("value")
                    is_taxable = allowance.get("is_taxable")
                    allowance_to_add.append(
                        Allowance(
                            allowance_type=allowance_type,
                            value=value,
                            employee=employee,
                            is_taxable=is_taxable,
                        )
                    )
                Allowance.objects.bulk_create(allowance_to_add)

            return Response({"message": "Employee added"}, status=200)
        except:
            return Response(
                {"error": "There was an error"}, status=status.HTTP_400_BAD_REQUEST
            )


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


# class AddEmployeeView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
