# Generated migration file for test data
from django.db import migrations
from django.conf import settings
from django.contrib.auth.hashers import make_password
from decimal import Decimal
from datetime import datetime, timedelta
import pytz


def create_test_data(apps, schema_editor):
    # Get model classes
    Employee = apps.get_model("payroll", "Employee")
    AttendanceRecord = apps.get_model("payroll", "AttendanceRecord")
    Allowance = apps.get_model("payroll", "Allowance")
    SalaryDeduction = apps.get_model("payroll", "SalaryDeduction")
    User = apps.get_model(settings.AUTH_USER_MODEL)

    # Create superuser (admin)
    admin_user, created = User.objects.get_or_create(
        username="admin",
        defaults={
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin@company.com",
            "is_active": True,
            "is_staff": True,
            "is_superuser": True,
            "password": make_password("1"),
            "role": 4,  # ADMIN role if you're using the custom User model with roles
        },
    )

    # Create test users
    users_data = [
        {
            "username": "john_doe",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@company.com",
        },
        {
            "username": "jane_smith",
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@company.com",
        },
        {
            "username": "mike_johnson",
            "first_name": "Mike",
            "last_name": "Johnson",
            "email": "mike@company.com",
        },
        {
            "username": "sarah_wilson",
            "first_name": "Sarah",
            "last_name": "Wilson",
            "email": "sarah@company.com",
        },
        {
            "username": "david_brown",
            "first_name": "David",
            "last_name": "Brown",
            "email": "david@company.com",
        },
    ]

    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data["username"],
            defaults={
                "first_name": user_data["first_name"],
                "last_name": user_data["last_name"],
                "email": user_data["email"],
                "is_active": True,
                "password": make_password("1"),
            },
        )
        created_users.append(user)

    # Create employees
    employees_data = [
        {
            "user": created_users[0],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("5000.00"),
            "department": "Engineering",
            "details": "Senior Software Developer with 5 years experience",
            "is_active": True,
        },
        {
            "user": created_users[1],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("4500.00"),
            "department": "Marketing",
            "details": "Marketing Manager responsible for digital campaigns",
            "is_active": True,
        },
        {
            "user": created_users[2],
            "salary_type": 1,  # HOURLY
            "base_salary": Decimal("25.00"),
            "department": "Support",
            "details": "Customer Support Representative",
            "is_active": True,
        },
        {
            "user": created_users[3],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("6000.00"),
            "department": "Engineering",
            "details": "Lead Frontend Developer",
            "is_active": True,
        },
        {
            "user": created_users[4],
            "salary_type": 1,  # HOURLY
            "base_salary": Decimal("30.00"),
            "department": "Design",
            "details": "Senior UI/UX Designer",
            "is_active": False,  # Inactive employee for testing
        },
    ]

    created_employees = []
    for emp_data in employees_data:
        employee = Employee.objects.create(**emp_data)
        created_employees.append(employee)

    # Create attendance records for the past week
    manila_tz = pytz.timezone("Asia/Manila")
    base_date = datetime.now(manila_tz) - timedelta(days=7)  #

    for employee in created_employees[:4]:  # Skip inactive employee
        for day in range(7):
            current_date = base_date + timedelta(days=day)

            # Skip weekends for some variety
            if current_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                continue

            # Time in (morning)
            time_in = current_date.replace(
                hour=8 + (day % 2),  # Vary between 8-9 AM
                minute=0 + (day * 5) % 60,  # Vary minutes
                second=0,
                microsecond=0,
            )

            AttendanceRecord.objects.create(
                employee=employee,
                timestamp=time_in,
                attendance_type=1,  # TIME_IN
            )

            # Time out (evening)
            time_out = time_in.replace(
                hour=17 + (day % 2),  # Vary between 5-6 PM
                minute=0 + (day * 7) % 60,  # Vary minutes
            )

            AttendanceRecord.objects.create(
                employee=employee,
                timestamp=time_out,
                attendance_type=2,  # TIME_OUT
            )

    # Create allowances
    allowances_data = [
        # John Doe allowances
        {
            "employee": created_employees[0],
            "value": Decimal("500.00"),
            "description": "Monthly meal allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[0],
            "value": Decimal("200.00"),
            "description": "Transportation allowance",
            "allowance_type": 2,
            "is_taxable": True,
        },
        {
            "employee": created_employees[0],
            "value": Decimal("1000.00"),
            "description": "Performance bonus Q4",
            "allowance_type": 4,
            "is_taxable": True,
        },
        # Jane Smith allowances
        {
            "employee": created_employees[1],
            "value": Decimal("450.00"),
            "description": "Monthly meal allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[1],
            "value": Decimal("300.00"),
            "description": "Medical allowance",
            "allowance_type": 3,
            "is_taxable": False,
        },
        # Mike Johnson allowances
        {
            "employee": created_employees[2],
            "value": Decimal("300.00"),
            "description": "Meal allowance for hourly employee",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[2],
            "value": Decimal("150.00"),
            "description": "Transportation allowance",
            "allowance_type": 2,
            "is_taxable": True,
        },
        # Sarah Wilson allowances
        {
            "employee": created_employees[3],
            "value": Decimal("600.00"),
            "description": "Senior developer meal allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("250.00"),
            "description": "Transportation allowance",
            "allowance_type": 2,
            "is_taxable": True,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("1500.00"),
            "description": "Lead developer bonus",
            "allowance_type": 4,
            "is_taxable": True,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("400.00"),
            "description": "Medical allowance",
            "allowance_type": 3,
            "is_taxable": False,
        },
    ]

    for allowance_data in allowances_data:
        Allowance.objects.create(**allowance_data)

    # Create salary deductions
    deductions_data = [
        # John Doe deductions
        {
            "employee": created_employees[0],
            "value": Decimal("750.00"),
            "deduction_type": 1,
        },  # TAX
        {
            "employee": created_employees[0],
            "value": Decimal("200.00"),
            "deduction_type": 2,
        },  # HEALTH
        {
            "employee": created_employees[0],
            "value": Decimal("300.00"),
            "deduction_type": 3,
        },  # SOCIAL SECURITY
        # Jane Smith deductions
        {
            "employee": created_employees[1],
            "value": Decimal("675.00"),
            "deduction_type": 1,
        },  # TAX
        {
            "employee": created_employees[1],
            "value": Decimal("180.00"),
            "deduction_type": 2,
        },  # HEALTH
        {
            "employee": created_employees[1],
            "value": Decimal("270.00"),
            "deduction_type": 3,
        },  # SOCIAL SECURITY
        # Mike Johnson deductions (hourly employee)
        {
            "employee": created_employees[2],
            "value": Decimal("400.00"),
            "deduction_type": 1,
        },  # TAX (estimated monthly)
        {
            "employee": created_employees[2],
            "value": Decimal("150.00"),
            "deduction_type": 2,
        },  # HEALTH
        {
            "employee": created_employees[2],
            "value": Decimal("200.00"),
            "deduction_type": 3,
        },  # SOCIAL SECURITY
        # Sarah Wilson deductions
        {
            "employee": created_employees[3],
            "value": Decimal("900.00"),
            "deduction_type": 1,
        },  # TAX
        {
            "employee": created_employees[3],
            "value": Decimal("220.00"),
            "deduction_type": 2,
        },  # HEALTH
        {
            "employee": created_employees[3],
            "value": Decimal("360.00"),
            "deduction_type": 3,
        },  # SOCIAL SECURITY
        {
            "employee": created_employees[3],
            "value": Decimal("50.00"),
            "deduction_type": 4,
        },  # OTHERS (parking fee)
        # David Brown deductions (inactive employee)
        {
            "employee": created_employees[4],
            "value": Decimal("450.00"),
            "deduction_type": 1,
            "is_active": False,
        },  # TAX (inactive)
        {
            "employee": created_employees[4],
            "value": Decimal("180.00"),
            "deduction_type": 2,
            "is_active": False,
        },  # HEALTH (inactive)
    ]

    for deduction_data in deductions_data:
        SalaryDeduction.objects.create(**deduction_data)


def reverse_test_data(apps, schema_editor):
    # Get model classes
    Employee = apps.get_model("payroll", "Employee")
    AttendanceRecord = apps.get_model("payroll", "AttendanceRecord")
    Allowance = apps.get_model("payroll", "Allowance")
    SalaryDeduction = apps.get_model("payroll", "SalaryDeduction")
    User = apps.get_model(settings.AUTH_USER_MODEL)

    # Delete all test data (be careful in production!)
    test_usernames = [
        "john_doe",
        "jane_smith",
        "mike_johnson",
        "sarah_wilson",
        "david_brown",
        "admin",
    ]

    # Delete related records first
    employees = Employee.objects.filter(user__username__in=test_usernames)
    AttendanceRecord.objects.filter(employee__in=employees).delete()
    Allowance.objects.filter(employee__in=employees).delete()
    SalaryDeduction.objects.filter(employee__in=employees).delete()

    # Delete employees
    employees.delete()

    # Delete test users (including admin)
    User.objects.filter(username__in=test_usernames).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("payroll", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_test_data, reverse_test_data),
    ]
