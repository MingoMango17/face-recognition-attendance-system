from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from .serializers import *
from .models import (
    Employee,
    Payslip,
    AttendanceRecord,
    Allowance,
    SalaryDeduction,
    Leave,
)
from .serializers import PayslipSerializer
import json

from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime
from decimal import Decimal
from django.db import transaction

# import calendar
from datetime import timedelta


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
            # "department",
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
                    # department=department,
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
                employee_fields = ["salary_type", "base_salary"]
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
        date = request.query_params.get("date")
        attendance = AttendanceRecord.objects.filter(timestamp__date=date)
        serializer = AttendanceRecordSerializer(attendance, many=True)

        return Response(serializer.data, status=200)

class PayslipView(APIView):
    """
    Main payslip view for listing, creating, updating, and deleting payslips
    """

    def get(self, request):
        """List all payslips with optional filtering"""
        payslips = Payslip.objects.select_related("employee__user").all()

        # Apply filters
        status_filter = request.query_params.get("status")
        department_filter = request.query_params.get("department")
        employee_filter = request.query_params.get("employee")
        period_filter = request.query_params.get("period")  # Format: YYYY-MM

        if status_filter:
            payslips = payslips.filter(status=status_filter)

        if department_filter:
            payslips = payslips.filter(employee__department=department_filter)

        if employee_filter:
            payslips = payslips.filter(employee_id=employee_filter)

        if period_filter:
            try:
                year, month = period_filter.split("-")
                payslips = payslips.filter(
                    start_date__year=year, start_date__month=month
                )
            except ValueError:
                pass

        serializer = PayslipSerializer(payslips, many=True)
        return Response(serializer.data, status=200)

    def patch(self, request, payslip_id=None):
        """Update a specific payslip"""
        if not payslip_id:
            return Response({"error": "payslip_id required"}, status=400)

        try:
            payslip = Payslip.objects.get(id=payslip_id)
        except Payslip.DoesNotExist:
            return Response({"error": "Payslip not found"}, status=404)

        # Only allow updates for DRAFT and GENERATED status
        if payslip.status not in [Payslip.DRAFT, Payslip.GENERATED]:
            return Response(
                {"error": "Cannot update payslip with current status"}, status=400
            )

        data = request.data

        # Update allowed fields
        if "status" in data:
            new_status = int(data["status"])
            if self._is_valid_status_transition(payslip.status, new_status):
                payslip.status = new_status
                if new_status == Payslip.APPROVED:
                    payslip.approved_at = timezone.now()
            else:
                return Response({"error": "Invalid status transition"}, status=400)

        if "total_working_days" in data:
            payslip.total_working_days = data["total_working_days"]

        if "start_date" in data:
            payslip.start_date = data["start_date"]

        if "end_date" in data:
            payslip.end_date = data["end_date"]

        # Recalculate payslip if basic data changed
        if any(
            field in data for field in ["total_working_days", "start_date", "end_date"]
        ):
            self._calculate_payslip_amounts(payslip)

        payslip.save()

        serializer = PayslipSerializer(payslip)
        return Response(serializer.data, status=200)

    def delete(self, request, payslip_id=None):
        """Delete a payslip (only DRAFT and GENERATED status)"""
        if not payslip_id:
            return Response({"error": "payslip_id required"}, status=400)

        try:
            payslip = Payslip.objects.get(id=payslip_id)
        except Payslip.DoesNotExist:
            return Response({"error": "Payslip not found"}, status=404)

        # Only allow deletion for DRAFT and GENERATED status
        if payslip.status not in [Payslip.DRAFT, Payslip.GENERATED]:
            return Response(
                {"error": "Cannot delete payslip with current status"}, status=400
            )

        payslip.delete()
        return Response({"message": "Payslip deleted successfully"}, status=200)

    def _is_valid_status_transition(self, current_status, new_status):
        """Check if status transition is valid"""
        valid_transitions = {
            Payslip.DRAFT: [Payslip.GENERATED],
            Payslip.GENERATED: [Payslip.APPROVED, Payslip.CANCELLED],
            Payslip.APPROVED: [Payslip.PAID, Payslip.CANCELLED],
            Payslip.PAID: [],
            Payslip.CANCELLED: [],
        }
        return new_status in valid_transitions.get(current_status, [])

    def _calculate_payslip_amounts(self, payslip, pay_frequency="monthly"):
        """Calculate gross and net salary for a payslip based on pay frequency"""
        employee = payslip.employee

        # Calculate base salary based on type and frequency
        if employee.salary_type == Employee.HOURLY:
            base_amount = employee.base_salary * payslip.regular_hours
        elif employee.salary_type == Employee.MONTHLY:
            # For monthly employees, calculate daily rate and multiply by days worked
            daily_rate = employee.base_salary / payslip.total_working_days
            base_amount = daily_rate * payslip.days_worked
            print(
                f"Monthly employee - Daily rate: {daily_rate}, Days worked: {payslip.days_worked}, Base amount: {base_amount}"
            )
        else:
            # For other salary types, use the existing conversion logic
            base_amount = self._convert_monthly_to_pay_period(
                employee.base_salary, pay_frequency, payslip
            )

        print(f"Base amount for {pay_frequency} pay: {base_amount}")

        # Calculate allowances based on salary type and frequency
        allowances = Allowance.objects.filter(employee=employee, is_active=True)
        total_allowances = Decimal("0")

        for allowance in allowances:
            if employee.salary_type == Employee.MONTHLY:
                # For monthly employees, calculate daily allowance rate
                daily_allowance_rate = allowance.value / payslip.total_working_days
                allowance_amount = daily_allowance_rate * payslip.days_worked
                print(
                    f"Allowance - Daily rate: {daily_allowance_rate}, Amount: {allowance_amount}"
                )
            elif employee.salary_type == Employee.HOURLY:
                allowance_amount = allowance.value
            else:
                allowance_amount = self._convert_monthly_to_pay_period(
                    allowance.value, pay_frequency, payslip
                )
            total_allowances += allowance_amount

        # Calculate gross salary
        payslip.gross_salary = base_amount + total_allowances

        # Calculate deductions based on salary type and frequency
        deductions = SalaryDeduction.objects.filter(employee=employee, is_active=True)
        total_deductions = Decimal("0")

        for deduction in deductions:
            if employee.salary_type == Employee.MONTHLY:
                # For monthly employees, calculate daily deduction rate
                daily_deduction_rate = deduction.value / payslip.total_working_days
                deduction_amount = daily_deduction_rate * payslip.days_worked
                print(
                    f"Deduction - Daily rate: {daily_deduction_rate}, Amount: {deduction_amount}"
                )
            elif employee.salary_type == Employee.HOURLY:
                deduction_amount = deduction.value
            else:
                deduction_amount = self._convert_monthly_to_pay_period(
                    deduction.value, pay_frequency, payslip
                )
            total_deductions += deduction_amount

        # Calculate net salary
        payslip.net_salary = payslip.gross_salary - total_deductions


class PayslipGenerateView(APIView):
    """
    Generate payslips for specific employees with Philippine withholding tax calculation
    """

    # Philippine withholding tax brackets for 2023 (updated rates)
    # These are annual brackets - will be converted based on pay frequency
    WITHHOLDING_TAX_BRACKETS = [
        # (min_income, max_income, base_tax, tax_rate, excess_over)
        (0, 250000, 0, 0.00, 0),                    # 0% for income up to 250,000
        (250000, 400000, 0, 0.20, 250000),         # 20% for excess over 250,000
        (400000, 800000, 30000, 0.25, 400000),     # 25% for excess over 400,000
        (800000, 2000000, 130000, 0.30, 800000),   # 30% for excess over 800,000
        (2000000, 8000000, 490000, 0.32, 2000000), # 32% for excess over 2,000,000
        (8000000, float('inf'), 2410000, 0.35, 8000000), # 35% for excess over 8,000,000
    ]

    def post(self, request):
        """Generate payslips for selected employees"""
        data = request.data

        employee_ids = data.get("employee_ids", [])
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        total_working_days = data.get("total_working_days")
        auto_calculate_attendance = data.get("auto_calculate_attendance", False)
        pay_frequency = data.get("pay_frequency", "monthly")

        if not all([employee_ids, start_date, end_date, total_working_days]):
            return Response(
                {
                    "error": "employee_ids, start_date, end_date, and total_working_days are required"
                },
                status=400,
            )

        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"}, status=400
            )

        generated_payslips = []
        errors = []

        with transaction.atomic():
            for employee_id in employee_ids:
                try:
                    employee = Employee.objects.get(id=employee_id, is_active=True)

                    # Check if payslip already exists for this period
                    existing_payslip = Payslip.objects.filter(
                        employee=employee,
                        start_date__gte=start_date,
                        end_date__lte=end_date,
                    ).first()

                    if existing_payslip:
                        errors.append(
                            f"Payslip already exists for {employee.user.get_full_name()}"
                        )
                        continue

                    # Calculate attendance data
                    attendance_data = self._calculate_attendance(
                        employee, start_date, end_date, auto_calculate_attendance
                    )

                    print("attendance_data", attendance_data)

                    # Create payslip
                    payslip = Payslip.objects.create(
                        employee=employee,
                        start_date=start_date,
                        end_date=end_date,
                        total_working_days=total_working_days,
                        days_worked=attendance_data["days_worked"],
                        total_hours=attendance_data["total_hours"],
                        regular_hours=attendance_data["regular_hours"],
                        gross_salary=Decimal("0"),  # Will be calculated
                        net_salary=Decimal("0"),  # Will be calculated
                        withholding_tax=Decimal("0"),  # Will be calculated
                        status=Payslip.DRAFT,
                        pay_frequency=pay_frequency,
                    )

                    # Calculate amounts including withholding tax
                    self._calculate_payslip_amounts(payslip, pay_frequency)
                    payslip.save()

                    generated_payslips.append(payslip.id)

                except Employee.DoesNotExist:
                    errors.append(f"Employee with ID {employee_id} not found")
                except Exception as e:
                    errors.append(
                        f"Error generating payslip for employee {employee_id}: {str(e)}"
                    )

        response_data = {
            "message": f"Generated {len(generated_payslips)} payslips",
            "generated_payslips": generated_payslips,
        }

        if errors:
            response_data["errors"] = errors

        return Response(response_data, status=400)

    def _calculate_payslip_amounts(self, payslip, pay_frequency="monthly"):
        """Calculate gross and net salary for a payslip based on pay frequency"""
        employee = payslip.employee

        # Calculate base salary based on type and frequency
        if employee.salary_type == Employee.HOURLY:
            base_amount = employee.base_salary * payslip.regular_hours
        else:
            base_amount = self._convert_monthly_to_pay_period(
                employee.base_salary, pay_frequency, payslip
            )

        print(f"Base amount for {pay_frequency} pay: {base_amount}")

        # Calculate allowances based on frequency
        allowances = Allowance.objects.filter(employee=employee, is_active=True)
        total_allowances = Decimal("0")

        for allowance in allowances:
            if employee.salary_type == Employee.MONTHLY:
                allowance_amount = self._convert_monthly_to_pay_period(
                    allowance.value, pay_frequency, payslip
                )
            else:
                allowance_amount = allowance.value
            total_allowances += allowance_amount

        # Calculate gross salary
        payslip.gross_salary = base_amount + total_allowances

        # Calculate non-tax deductions
        deductions = SalaryDeduction.objects.filter(employee=employee, is_active=True)
        total_deductions = Decimal("0")

        for deduction in deductions:
            if employee.salary_type == Employee.MONTHLY:
                deduction_amount = self._convert_monthly_to_pay_period(
                    deduction.value, pay_frequency, payslip
                )
            else:
                deduction_amount = deduction.value
            total_deductions += deduction_amount

        # Calculate withholding tax
        payslip.withholding_tax = self._calculate_withholding_tax(
            payslip.gross_salary, pay_frequency, employee
        )

        # Calculate net salary (gross - deductions - withholding tax)
        payslip.net_salary = payslip.gross_salary - total_deductions - payslip.withholding_tax

    def _calculate_withholding_tax(self, gross_salary, pay_frequency, employee):
        """
        Calculate Philippine withholding tax based on current tax brackets
        Uses annualized method for accuracy
        """
        # Convert gross salary to annual amount for tax calculation
        annual_gross = self._convert_to_annual_amount(gross_salary, pay_frequency)
        
        # Get year-to-date earnings to determine proper tax bracket
        # This is important for progressive tax calculation
        ytd_gross = self._get_ytd_gross_salary(employee, gross_salary)
        
        print(f"Annual gross: {annual_gross}, YTD gross: {ytd_gross}")

        # Calculate annual withholding tax using progressive brackets
        annual_tax = self._calculate_progressive_tax(annual_gross)
        
        # Convert back to pay period amount
        period_tax = self._convert_annual_to_pay_period(annual_tax, pay_frequency)
        
        # Ensure tax is not negative
        return max(Decimal("0"), period_tax)

    def _calculate_progressive_tax(self, annual_income):
        """Calculate tax using Philippine progressive tax brackets"""
        total_tax = Decimal("0")
        
        for min_income, max_income, base_tax, tax_rate, excess_over in self.WITHHOLDING_TAX_BRACKETS:
            if annual_income <= min_income:
                break
                
            if annual_income <= max_income:
                # Income falls within this bracket
                taxable_excess = annual_income - excess_over
                bracket_tax = base_tax + (taxable_excess * Decimal(str(tax_rate)))
                total_tax = bracket_tax
                break
            elif annual_income > max_income and max_income != float('inf'):
                # Income exceeds this bracket, continue to next
                continue
            else:
                # Highest bracket
                taxable_excess = annual_income - excess_over
                bracket_tax = base_tax + (taxable_excess * Decimal(str(tax_rate)))
                total_tax = bracket_tax
                break
        
        return total_tax

    def _convert_to_annual_amount(self, amount, pay_frequency):
        """Convert pay period amount to annual amount"""
        if pay_frequency == "weekly":
            return amount * 52
        elif pay_frequency == "biweekly":
            return amount * 26
        elif pay_frequency == "semi_monthly":
            return amount * 24
        else:  # monthly
            return amount * 12

    def _convert_annual_to_pay_period(self, annual_amount, pay_frequency):
        """Convert annual amount to pay period amount"""
        if pay_frequency == "weekly":
            return annual_amount / 52
        elif pay_frequency == "biweekly":
            return annual_amount / 26
        elif pay_frequency == "semi_monthly":
            return annual_amount / 24
        else:  # monthly
            return annual_amount / 12

    def _get_ytd_gross_salary(self, employee, current_gross):
        """
        Get year-to-date gross salary for the employee
        This helps ensure proper tax bracket application
        """
        from django.db.models import Sum
        
        current_year = datetime.now().year
        
        ytd_payslips = Payslip.objects.filter(
            employee=employee,
            start_date__year=current_year,
            status__in=[Payslip.APPROVED, Payslip.PAID]
        ).aggregate(
            total_gross=Sum('gross_salary')
        )
        
        ytd_gross = ytd_payslips['total_gross'] or Decimal("0")
        
        # Add current payslip gross
        return ytd_gross + current_gross

    def _convert_monthly_to_pay_period(self, monthly_amount, pay_frequency, payslip):
        """Convert monthly amount to appropriate pay period amount"""

        if pay_frequency == "weekly":
            # Monthly ÷ 4.33 weeks per month (52 weeks ÷ 12 months)
            period_amount = monthly_amount / Decimal("4.33")
        elif pay_frequency == "biweekly":
            # Monthly ÷ 2.17 (26 pay periods ÷ 12 months)
            period_amount = monthly_amount / Decimal("2.17")
        elif pay_frequency == "semi_monthly":
            # Paid twice per month (24 pay periods per year)
            period_amount = monthly_amount / Decimal("2")
        else:  # monthly (default)
            period_amount = monthly_amount

        return period_amount

    def _calculate_attendance(
        self, employee, start_date, end_date, auto_calculate=False
    ):
        """Calculate attendance data for the period"""

        # Calculate total working days in the period (excluding weekends)
        current_date = start_date
        total_period_working_days = 0
        while current_date <= end_date:
            if current_date.weekday() < 5:  # Monday to Friday
                total_period_working_days += 1
            current_date += timedelta(days=1)

        if auto_calculate:
            # Calculate from attendance records
            attendance_records = AttendanceRecord.objects.filter(
                employee=employee,
                timestamp__date__gte=start_date,
                timestamp__date__lte=end_date,
            ).order_by("timestamp")

            # Group by date and calculate daily hours
            daily_hours = {}
            current_date = None
            time_in = None

            for record in attendance_records:
                record_date = record.timestamp.date()

                if record.attendance_type == AttendanceRecord.TIME_IN:
                    time_in = record.timestamp
                    current_date = record_date
                elif record.attendance_type == AttendanceRecord.TIME_OUT and time_in:
                    if record_date == current_date:
                        hours_worked = (
                            record.timestamp - time_in
                        ).total_seconds() / 3600
                        daily_hours[record_date] = (
                            daily_hours.get(record_date, 0) + hours_worked
                        )
                    time_in = None

            total_hours = sum(daily_hours.values())
            days_worked = len(daily_hours)

        else:
            # Assume employee worked all working days in the period
            days_worked = total_period_working_days
            total_hours = days_worked * 8  # Assuming 8 hours per day

        # Subtract approved leave days
        approved_leaves = Leave.objects.filter(
            employee=employee,
            is_approved=True,
            start_date__lte=end_date,
            end_date__gte=start_date,
        )

        if not auto_calculate:
            total_hours = days_worked * 8

        print(
            f"Period working days: {total_period_working_days}, Days worked: {days_worked}"
        )

        return {
            "total_hours": Decimal(str(total_hours)),
            "regular_hours": Decimal(str(min(total_hours, 8 * days_worked))),
            "days_worked": Decimal(str(days_worked)),
        }

class PayslipStatsView(APIView):
    """
    Get payslip statistics and summary data
    """

    def get(self, request):
        """Get payslip statistics"""
        # Get filter parameters
        period_filter = request.query_params.get("period")  # Format: YYYY-MM
        department_filter = request.query_params.get("department")

        payslips = Payslip.objects.all()

        if period_filter:
            try:
                year, month = period_filter.split("-")
                payslips = payslips.filter(
                    start_date__year=year, start_date__month=month
                )
            except ValueError:
                pass

        if department_filter:
            payslips = payslips.filter(employee__department=department_filter)

        # Calculate statistics
        stats = payslips.aggregate(
            total_count=Count("id"),
            total_gross=Sum("gross_salary"),
            total_net=Sum("net_salary"),
            draft_count=Count("id", filter=Q(status=Payslip.DRAFT)),
            generated_count=Count("id", filter=Q(status=Payslip.GENERATED)),
            approved_count=Count("id", filter=Q(status=Payslip.APPROVED)),
            paid_count=Count("id", filter=Q(status=Payslip.PAID)),
            cancelled_count=Count("id", filter=Q(status=Payslip.CANCELLED)),
        )

        # Convert None values to 0
        for key, value in stats.items():
            if value is None:
                stats[key] = 0

        return Response(stats, status=200)
