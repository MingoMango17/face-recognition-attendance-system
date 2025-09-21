# Generated migration file for Philippine test data with leaves
from django.db import migrations
from django.conf import settings
from django.contrib.auth.hashers import make_password
from decimal import Decimal
from datetime import datetime, timedelta, date
import pytz


def create_test_data(apps, schema_editor):
    # Get model classes
    Employee = apps.get_model("payroll", "Employee")
    AttendanceRecord = apps.get_model("payroll", "AttendanceRecord")
    Allowance = apps.get_model("payroll", "Allowance")
    SalaryDeduction = apps.get_model("payroll", "SalaryDeduction")
    Leave = apps.get_model("payroll", "Leave")
    User = apps.get_model(settings.AUTH_USER_MODEL)

    # Create superuser (admin)
    admin_user, created = User.objects.get_or_create(
        username="admin",
        defaults={
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin@company.com.ph",
            "is_active": True,
            "is_staff": True,
            "is_superuser": True,
            "password": make_password("admin123"),
            "role": 4,
        },
    )

    # Create test users with Philippine names
    users_data = [
        {
            "username": "jose_rizal",
            "first_name": "Jose",
            "last_name": "Rizal",
            "email": "jose.rizal@company.com.ph",
        },
        {
            "username": "maria_clara",
            "first_name": "Maria Clara",
            "last_name": "Santos",
            "email": "maria.santos@company.com.ph",
        },
        {
            "username": "juan_dela_cruz",
            "first_name": "Juan",
            "last_name": "Dela Cruz",
            "email": "juan.delacruz@company.com.ph",
        },
        {
            "username": "ana_marie_lopez",
            "first_name": "Ana Marie",
            "last_name": "Lopez",
            "email": "ana.lopez@company.com.ph",
        },
        {
            "username": "miguel_reyes",
            "first_name": "Miguel",
            "last_name": "Reyes",
            "email": "miguel.reyes@company.com.ph",
        },
        {
            "username": "carmen_villanueva",
            "first_name": "Carmen",
            "last_name": "Villanueva",
            "email": "carmen.villanueva@company.com.ph",
        },
        {
            "username": "ricardo_santos",
            "first_name": "Ricardo",
            "last_name": "Santos",
            "email": "ricardo.santos@company.com.ph",
        },
        {
            "username": "elena_garcia",
            "first_name": "Elena",
            "last_name": "Garcia",
            "email": "elena.garcia@company.com.ph",
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
                "password": make_password("password123"),
            },
        )
        created_users.append(user)

    # Create employees with Philippine salary ranges and departments
    employees_data = [
        {
            "user": created_users[0],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("45000.00"),  # Senior Developer
            "department": "Information Technology",
            "details": "Senior Full Stack Developer specializing in Django and React",
            "is_active": True,
        },
        {
            "user": created_users[1],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("35000.00"),  # Marketing Manager
            "department": "Marketing",
            "details": "Digital Marketing Manager handling social media and campaigns",
            "is_active": True,
        },
        {
            "user": created_users[2],
            "salary_type": 1,  # HOURLY
            "base_salary": Decimal("250.00"),  # Customer Support
            "department": "Customer Service",
            "details": "Customer Support Specialist for technical assistance",
            "is_active": True,
        },
        {
            "user": created_users[3],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("50000.00"),  # Lead Developer
            "department": "Information Technology",
            "details": "Lead Frontend Developer and Team Lead",
            "is_active": True,
        },
        {
            "user": created_users[4],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("40000.00"),  # UI/UX Designer
            "department": "Design",
            "details": "Senior UI/UX Designer for mobile and web applications",
            "is_active": True,
        },
        {
            "user": created_users[5],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("28000.00"),  # HR Coordinator
            "department": "Human Resources",
            "details": "HR Coordinator handling recruitment and employee relations",
            "is_active": True,
        },
        {
            "user": created_users[6],
            "salary_type": 1,  # HOURLY
            "base_salary": Decimal("200.00"),  # Junior Developer
            "department": "Information Technology",
            "details": "Junior Backend Developer - Python/Django",
            "is_active": True,
        },
        {
            "user": created_users[7],
            "salary_type": 2,  # MONTHLY
            "base_salary": Decimal("32000.00"),  # Accountant
            "department": "Finance",
            "details": "Staff Accountant handling accounts payable and receivable",
            "is_active": False,  # Inactive employee for testing
        },
    ]

    created_employees = []
    for emp_data in employees_data:
        employee = Employee.objects.create(**emp_data)
        created_employees.append(employee)

    # Create leave records first (August 1 to now)
    manila_tz = pytz.timezone("Asia/Manila")
    start_date = date(2024, 8, 1)
    end_date = date.today()
    
    leaves_data = [
        # Jose Rizal leaves
        {
            "employee": created_employees[0],
            "leave_type": 0,  # PAID_LEAVE
            "details": "Family vacation to Bohol",
            "start_date": date(2024, 8, 15),
            "end_date": date(2024, 8, 16),
            "is_approved": True,
        },
        {
            "employee": created_employees[0],
            "leave_type": 1,  # SICK
            "details": "Flu symptoms and fever",
            "start_date": date(2024, 9, 10),
            "end_date": date(2024, 9, 10),
            "is_approved": True,
        },
        # Maria Clara leaves
        {
            "employee": created_employees[1],
            "leave_type": 2,  # MATERNITY
            "details": "Maternity leave for second child",
            "start_date": date(2024, 8, 20),
            "end_date": date(2024, 10, 20),
            "is_approved": True,
        },
        # Juan Dela Cruz leaves
        {
            "employee": created_employees[2],
            "leave_type": 4,  # HALF_DAY_LEAVE
            "details": "Medical appointment in the afternoon",
            "start_date": date(2024, 8, 5),
            "end_date": date(2024, 8, 5),
            "is_approved": True,
        },
        {
            "employee": created_employees[2],
            "leave_type": 1,  # SICK
            "details": "Food poisoning",
            "start_date": date(2024, 9, 22),
            "end_date": date(2024, 9, 22),
            "is_approved": True,
        },
        # Ana Marie Lopez leaves
        {
            "employee": created_employees[3],
            "leave_type": 0,  # PAID_LEAVE
            "details": "Wedding anniversary celebration in Palawan",
            "start_date": date(2024, 8, 28),
            "end_date": date(2024, 8, 30),
            "is_approved": True,
        },
        # Miguel Reyes leaves
        {
            "employee": created_employees[4],
            "leave_type": 3,  # LEAVE_WITHOUT_PAY
            "details": "Emergency family matter in province",
            "start_date": date(2024, 9, 5),
            "end_date": date(2024, 9, 7),
            "is_approved": True,
        },
        # Carmen Villanueva leaves
        {
            "employee": created_employees[5],
            "leave_type": 1,  # SICK
            "details": "Migraine and need rest",
            "start_date": date(2024, 8, 12),
            "end_date": date(2024, 8, 12),
            "is_approved": True,
        },
        {
            "employee": created_employees[5],
            "leave_type": 0,  # PAID_LEAVE
            "details": "Attending training seminar in Manila",
            "start_date": date(2024, 9, 18),
            "end_date": date(2024, 9, 19),
            "is_approved": True,
        },
        # Ricardo Santos leaves
        {
            "employee": created_employees[6],
            "leave_type": 4,  # HALF_DAY_LEAVE
            "details": "Bank appointment for loan application",
            "start_date": date(2024, 8, 8),
            "end_date": date(2024, 8, 8),
            "is_approved": True,
        },
    ]

    # Create leave records
    created_leaves = []
    for leave_data in leaves_data:
        leave_record = Leave.objects.create(**leave_data)
        created_leaves.append(leave_record)

    # Create a set of dates when employees have approved leaves
    leave_dates = {}
    for leave in created_leaves:
        if leave.employee not in leave_dates:
            leave_dates[leave.employee] = set()
        
        # Add all dates in the leave range
        current_date = leave.start_date
        while current_date <= leave.end_date:
            leave_dates[leave.employee].add(current_date)
            current_date += timedelta(days=1)

    # Create attendance records from August 1 to now (excluding leave dates)
    current_date = start_date
    
    # Active employees only (excluding inactive employee)
    active_employees = created_employees[:7]
    
    while current_date <= end_date:
        # Skip weekends
        if current_date.weekday() < 5:  # Monday = 0, Friday = 4
            for employee in active_employees:
                # Check if employee has leave on this date
                has_leave = employee in leave_dates and current_date in leave_dates[employee]
                
                if not has_leave:
                    # Convert date to datetime with timezone
                    base_datetime = datetime.combine(current_date, datetime.min.time())
                    base_datetime = manila_tz.localize(base_datetime)
                    
                    # Time in (morning) - vary arrival times
                    arrival_variation = hash(f"{employee.id}_{current_date}") % 60  # Deterministic variation
                    time_in = base_datetime.replace(
                        hour=8,  # Standard 8 AM
                        minute=arrival_variation % 30,  # 0-29 minutes late
                        second=0,
                        microsecond=0,
                    )

                    AttendanceRecord.objects.create(
                        employee=employee,
                        timestamp=time_in,
                        attendance_type=1,  # TIME_IN
                    )

                    # Time out (evening) - 8-9 hours later
                    work_hours = 8 + (arrival_variation % 2)  # 8 or 9 hours
                    time_out = time_in + timedelta(hours=work_hours)

                    AttendanceRecord.objects.create(
                        employee=employee,
                        timestamp=time_out,
                        attendance_type=2,  # TIME_OUT
                    )
        
        current_date += timedelta(days=1)

    # Create allowances with Philippine context
    allowances_data = [
        # Jose Rizal allowances
        {
            "employee": created_employees[0],
            "value": Decimal("3000.00"),
            "description": "Monthly rice allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[0],
            "value": Decimal("2000.00"),
            "description": "Transportation allowance (jeepney/taxi)",
            "allowance_type": 2,
            "is_taxable": True,
        },
        {
            "employee": created_employees[0],
            "value": Decimal("8000.00"),
            "description": "13th month bonus equivalent",
            "allowance_type": 4,
            "is_taxable": True,
        },
        # Maria Clara allowances
        {
            "employee": created_employees[1],
            "value": Decimal("2500.00"),
            "description": "Monthly meal allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[1],
            "value": Decimal("1500.00"),
            "description": "HMO medical coverage",
            "allowance_type": 3,
            "is_taxable": False,
        },
        # Juan Dela Cruz allowances
        {
            "employee": created_employees[2],
            "value": Decimal("2000.00"),
            "description": "Meal allowance for hourly worker",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[2],
            "value": Decimal("1200.00"),
            "description": "Transportation (MRT/Bus)",
            "allowance_type": 2,
            "is_taxable": True,
        },
        # Ana Marie Lopez allowances
        {
            "employee": created_employees[3],
            "value": Decimal("3500.00"),
            "description": "Lead developer meal allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("2500.00"),
            "description": "Transportation allowance",
            "allowance_type": 2,
            "is_taxable": True,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("10000.00"),
            "description": "Team leadership bonus",
            "allowance_type": 4,
            "is_taxable": True,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("2000.00"),
            "description": "HMO family coverage",
            "allowance_type": 3,
            "is_taxable": False,
        },
        # Miguel Reyes allowances
        {
            "employee": created_employees[4],
            "value": Decimal("3000.00"),
            "description": "Designer meal allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[4],
            "value": Decimal("1800.00"),
            "description": "Creative tools allowance",
            "allowance_type": 2,
            "is_taxable": True,
        },
        # Carmen Villanueva allowances
        {
            "employee": created_employees[5],
            "value": Decimal("2200.00"),
            "description": "HR staff meal allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[5],
            "value": Decimal("1300.00"),
            "description": "Transportation allowance",
            "allowance_type": 2,
            "is_taxable": True,
        },
        # Ricardo Santos allowances
        {
            "employee": created_employees[6],
            "value": Decimal("2000.00"),
            "description": "Junior developer meal allowance",
            "allowance_type": 1,
            "is_taxable": False,
        },
        {
            "employee": created_employees[6],
            "value": Decimal("1000.00"),
            "description": "Learning materials allowance",
            "allowance_type": 2,
            "is_taxable": True,
        },
    ]

    for allowance_data in allowances_data:
        Allowance.objects.create(**allowance_data)

    # Create salary deductions based on Philippine tax and contribution rates
    deductions_data = [
        # Jose Rizal deductions (₱45,000 monthly)
        {
            "employee": created_employees[0],
            "value": Decimal("4500.00"),  # Income tax (approximate)
            "deduction_type": 0,
        },  # LOAN
        {
            "employee": created_employees[0],
            "value": Decimal("1800.00"),  # PhilHealth (1.5% employee share, capped)
            "deduction_type": 1,
        },  # HEALTH
        {
            "employee": created_employees[0],
            "value": Decimal("1620.00"),  # SSS (3.6% employee share)
            "deduction_type": 2,
        },  # SOCIAL
        {
            "employee": created_employees[0],
            "value": Decimal("100.00"),  # Pag-IBIG (1%)
            "deduction_type": 3,
        },  # OTHERS
        
        # Maria Clara deductions (₱35,000 monthly)
        {
            "employee": created_employees[1],
            "value": Decimal("2800.00"),  # Income tax
            "deduction_type": 0,
        },
        {
            "employee": created_employees[1],
            "value": Decimal("1575.00"),  # PhilHealth
            "deduction_type": 1,
        },
        {
            "employee": created_employees[1],
            "value": Decimal("1260.00"),  # SSS
            "deduction_type": 2,
        },
        {
            "employee": created_employees[1],
            "value": Decimal("100.00"),  # Pag-IBIG
            "deduction_type": 3,
        },
        
        # Juan Dela Cruz deductions (hourly, estimated ₱20,000 monthly)
        {
            "employee": created_employees[2],
            "value": Decimal("800.00"),  # Income tax
            "deduction_type": 0,
        },
        {
            "employee": created_employees[2],
            "value": Decimal("900.00"),  # PhilHealth
            "deduction_type": 1,
        },
        {
            "employee": created_employees[2],
            "value": Decimal("720.00"),  # SSS
            "deduction_type": 2,
        },
        {
            "employee": created_employees[2],
            "value": Decimal("100.00"),  # Pag-IBIG
            "deduction_type": 3,
        },
        
        # Ana Marie Lopez deductions (₱50,000 monthly)
        {
            "employee": created_employees[3],
            "value": Decimal("6000.00"),  # Income tax
            "deduction_type": 2,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("1800.00"),  # PhilHealth (capped)
            "deduction_type": 3,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("1800.00"),  # SSS (capped at ₱20,000 salary base)
            "deduction_type": 2,
        },
        {
            "employee": created_employees[3],
            "value": Decimal("100.00"),  # Pag-IBIG
            "deduction_type": 3,
        },
        
        # Miguel Reyes deductions (₱40,000 monthly)
        {
            "employee": created_employees[4],
            "value": Decimal("3600.00"),  # Income tax
            "deduction_type": 2,
        },
        {
            "employee": created_employees[4],
            "value": Decimal("1800.00"),  # PhilHealth
            "deduction_type": 3,
        },
        {
            "employee": created_employees[4],
            "value": Decimal("1440.00"),  # SSS
            "deduction_type": 2,
        },
        {
            "employee": created_employees[4],
            "value": Decimal("100.00"),  # Pag-IBIG
            "deduction_type": 3,
        },
        
        # Carmen Villanueva deductions (₱28,000 monthly)
        {
            "employee": created_employees[5],
            "value": Decimal("1400.00"),  # Income tax
            "deduction_type": 0,
        },
        {
            "employee": created_employees[5],
            "value": Decimal("1260.00"),  # PhilHealth
            "deduction_type": 1,
        },
        {
            "employee": created_employees[5],
            "value": Decimal("1008.00"),  # SSS
            "deduction_type": 2,
        },
        {
            "employee": created_employees[5],
            "value": Decimal("100.00"),  # Pag-IBIG
            "deduction_type": 3,
        },
        
        # Ricardo Santos deductions (hourly, estimated ₱16,000 monthly)
        {
            "employee": created_employees[6],
            "value": Decimal("400.00"),  # Income tax (minimal)
            "deduction_type": 0,
        },
        {
            "employee": created_employees[6],
            "value": Decimal("720.00"),  # PhilHealth
            "deduction_type": 1,
        },
        {
            "employee": created_employees[6],
            "value": Decimal("576.00"),  # SSS
            "deduction_type": 2,
        },
        {
            "employee": created_employees[6],
            "value": Decimal("100.00"),  # Pag-IBIG
            "deduction_type": 3,
        },
        
        # Elena Garcia deductions (inactive employee)
        {
            "employee": created_employees[7],
            "value": Decimal("2200.00"),  # Income tax (inactive)
            "deduction_type": 0,
            "is_active": False,
        },
        {
            "employee": created_employees[7],
            "value": Decimal("1440.00"),  # PhilHealth (inactive)
            "deduction_type": 1,
            "is_active": False,
        },
    ]

    for deduction_data in deductions_data:
        SalaryDeduction.objects.create(**deduction_data)


def reverse_test_data(apps, schema_editor):
    # Get model classes
    Employee = apps.get_model("payroll", "Employee")
    AttendanceRecord = apps.get_model("payroll", "AttendanceRecord")
    Allowance = apps.get_model("payroll", "Allowance")
    SalaryDeduction = apps.get_model("payroll", "SalaryDeduction")
    Leave = apps.get_model("payroll", "Leave")
    User = apps.get_model(settings.AUTH_USER_MODEL)

    # Delete all test data
    test_usernames = [
        "jose_rizal",
        "maria_clara", 
        "juan_dela_cruz",
        "ana_marie_lopez",
        "miguel_reyes",
        "carmen_villanueva",
        "ricardo_santos",
        "elena_garcia",
        "admin",
    ]

    # Delete related records first
    employees = Employee.objects.filter(user__username__in=test_usernames)
    AttendanceRecord.objects.filter(employee__in=employees).delete()
    Allowance.objects.filter(employee__in=employees).delete()
    SalaryDeduction.objects.filter(employee__in=employees).delete()
    Leave.objects.filter(employee__in=employees).delete()

    # Delete employees
    employees.delete()

    # Delete test users (including admin)
    User.objects.filter(username__in=test_usernames).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("payroll", "0003_payslip_pay_frequency"),  # Update this to your actual last migration
    ]

    operations = [
        migrations.RunPython(create_test_data, reverse_test_data),
    ]