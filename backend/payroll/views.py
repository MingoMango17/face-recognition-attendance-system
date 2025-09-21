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

        # Validate required fields
        required_fields = [
            "first_name",
            "last_name",
            "username",
            "password",
            "department",
            "salary_type",
            "base_salary",
        ]
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {"error": f"Missing required field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Extract data
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        username = data.get("username")
        password = data.get("password")
        department = data.get("department")
        salary_type = data.get("salary_type")
        base_salary = data.get("base_salary")
        deductions = data.get("deductions", [])  # Default to empty list
        allowances = data.get("allowances", [])  # Default to empty list

        try:
            with transaction.atomic():

                if User.objects.filter(username=username).exists():
                    return Response(
                        {"error": "Username already exists"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

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
                    base_salary=base_salary,
                )

                if deductions:
                    deductions_to_add = []
                    for deduction in deductions:
                        deduction_type = deduction.get("type")
                        value = deduction.get("amount")

                        if deduction_type is None:
                            raise ValueError(
                                "Invalid deduction data: missing deduction_type"
                            )

                        if value is None:
                            raise ValueError("Invalid deduction data: missing value")

                        deductions_to_add.append(
                            SalaryDeduction(
                                deduction_type=deduction_type,
                                value=value,
                                employee=employee,
                            )
                        )

                    if deductions_to_add:
                        SalaryDeduction.objects.bulk_create(deductions_to_add)

                # Handle allowances
                if allowances:
                    allowances_to_add = []
                    for allowance in allowances:
                        allowance_type = allowance.get("type")
                        value = allowance.get("amount")
                        is_taxable = allowance.get("taxable", False)

                        # Validate allowance data
                        if allowance_type is None or value is None:
                            raise ValueError(
                                "Invalid allowance data: missing allowance_type or value"
                            )

                        allowances_to_add.append(
                            Allowance(
                                allowance_type=allowance_type,
                                value=value,
                                employee=employee,
                                is_taxable=is_taxable,
                            )
                        )

                    if allowances_to_add:
                        Allowance.objects.bulk_create(allowances_to_add)

                return Response(
                    {"message": "Employee added successfully"},
                    status=status.HTTP_201_CREATED,
                )

        except ValueError as e:
            print(f"Validation error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request, employee_id=None):
        """
        Update an existing employee. Supports partial updates.
        URL should be: /employees/{employee_id}/
        """
        if not employee_id:
            return Response(
                {"error": "Employee ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = Employee.objects.get(id=employee_id, is_active=True)
        except Employee.DoesNotExist:
            return Response(
                {"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND
            )

        data = request.data

        try:
            with transaction.atomic():

                # Update User fields if provided
                user_fields = ["first_name", "last_name", "username"]
                user_updated = False

                for field in user_fields:
                    if field in data:
                        if field == "username":
                            # Check if new username already exists (excluding current user)
                            if (
                                User.objects.filter(username=data[field])
                                .exclude(id=employee.user.id)
                                .exists()
                            ):
                                return Response(
                                    {"error": "Username already exists"},
                                    status=status.HTTP_400_BAD_REQUEST,
                                )

                        setattr(employee.user, field, data[field])
                        user_updated = True

                # Update password if provided
                if "password" in data:
                    employee.user.set_password(data["password"])
                    user_updated = True

                if user_updated:
                    employee.user.save()

                # Update Employee fields if provided
                employee_fields = ["department", "salary_type", "base_salary"]
                employee_updated = False

                for field in employee_fields:
                    if field in data:
                        setattr(employee, field, data[field])
                        employee_updated = True

                if employee_updated:
                    employee.save()

                # Handle deductions update
                if "deductions" in data:
                    # Delete existing deductions
                    SalaryDeduction.objects.filter(employee=employee).delete()

                    # Add new deductions
                    deductions = data.get("deductions", [])
                    if deductions:
                        deductions_to_add = []
                        for deduction in deductions:
                            deduction_type = deduction.get("type")
                            value = deduction.get("amount")

                            if deduction_type is None:
                                raise ValueError(
                                    "Invalid deduction data: missing deduction_type"
                                )

                            if value is None:
                                raise ValueError(
                                    "Invalid deduction data: missing value"
                                )

                            deductions_to_add.append(
                                SalaryDeduction(
                                    deduction_type=deduction_type,
                                    value=value,
                                    employee=employee,
                                )
                            )

                        if deductions_to_add:
                            SalaryDeduction.objects.bulk_create(deductions_to_add)

                # Handle allowances update
                if "allowances" in data:
                    # Delete existing allowances
                    Allowance.objects.filter(employee=employee).delete()

                    # Add new allowances
                    allowances = data.get("allowances", [])
                    if allowances:
                        allowances_to_add = []
                        for allowance in allowances:
                            allowance_type = allowance.get("type")
                            value = allowance.get("amount")
                            is_taxable = allowance.get("taxable", False)

                            if allowance_type is None or value is None:
                                raise ValueError(
                                    "Invalid allowance data: missing allowance_type or value"
                                )

                            allowances_to_add.append(
                                Allowance(
                                    allowance_type=allowance_type,
                                    value=value,
                                    employee=employee,
                                    is_taxable=is_taxable,
                                )
                            )

                        if allowances_to_add:
                            Allowance.objects.bulk_create(allowances_to_add)

                # Return updated employee data
                serializer = EmployeeSerializer(employee)
                return Response(
                    {
                        "message": "Employee updated successfully",
                        "employee": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

        except ValueError as e:
            print(f"Validation error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, employee_id=None):
        """
        Soft delete an employee by setting is_active to False.
        URL should be: /employees/{employee_id}/
        """
        if not employee_id:
            return Response(
                {"error": "Employee ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = Employee.objects.get(id=employee_id, is_active=True)
        except Employee.DoesNotExist:
            return Response(
                {"error": "Employee not found or already deleted"},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = request.data
        try:
            employee.is_active = False
            employee.save()

            # Optionally deactivate the associated user account
            deactivate_user = data.get("deactivate_user", True)
            if deactivate_user:
                employee.user.is_active = False
                employee.user.save()

            # Return employee info
            serializer = EmployeeSerializer(employee)
            return Response(
                {
                    "message": "Employee deactivated successfully",
                    "employee": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": "An error occurred while deleting the employee"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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


class AllowanceView(APIView):
    def get(self, request):
        employee_id = request.query_params.get("employee_id", None)
        if employee_id:
            deductions = Allowance.objects.filter(employee=employee_id, is_active=True)
            serializer = AllowanceSerializer(deductions, many=True)
            return Response(serializer.data)
        return Response({"error": "employee_id needed"})


class LeaveView(APIView):
    def get(self, request):
        leaves = Leave.objects.all()

        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data, status=200)

    def post(self, request):
        data = request.data

        employee = data.get("employee")
        leave_type = data.get("leave_type")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        details = data.get("details")

        Leave.objects.create(
            employee_id=employee,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            details=details,
            is_approved=True,  # set to true alway
        )

        return Response({"message": "Leave is created"}, status=201)

    def delete(self, request):
        leave_id = request.query_params.get("leave_id")

        print("deleting ", request)
        if leave_id:
            Leave.objects.get(id=leave_id).delete()
            return Response({"Leave deleted"}, status=200)

        return Response({"leave_id required"}, status=400)


class AttendanceRecordView(APIView):
    def get(self, request):
        attendance = AttendanceRecord.objects.all()
        serializer = AttendanceRecordSerializer(attendance, many=True)

        return Response(serializer.data, status=200)
