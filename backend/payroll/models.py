from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import pytz

User = get_user_model()


def manila_now():
    manila_tz = pytz.timezone("Asia/Manila")
    return timezone.now().astimezone(manila_tz)


class Employee(models.Model):
    HOURLY = 1
    MONTHLY = 2

    SALARY_TYPE = (
        (HOURLY, "HOURLY"),
        (MONTHLY, "MONTHLY"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    salary_type = models.IntegerField(choices=SALARY_TYPE, default=HOURLY)
    hire_date = models.DateField(auto_now_add=True)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    department = models.CharField(max_length=128, null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    embedded_picture_id = models.CharField(max_length=128, null=True, blank=False)

    def __str__(self):
        return f"{self.user.get_full_name()}"


class AttendanceRecord(models.Model):
    TIME_IN = 1
    TIME_OUT = 2

    ATTENDANCE_TYPE = (
        (TIME_IN, "TIME IN"),
        (TIME_OUT, "TIME OUT"),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=manila_now)
    attendance_type = models.IntegerField(
        choices=ATTENDANCE_TYPE, blank=False, null=False
    )

    @classmethod
    def create_attendance(cls, employee, timestamp=None):
        if timestamp is None:
            timestamp = manila_now()

        today = timestamp.date()

        # Get the latest record for this employee today
        latest_record = (
            cls.objects.filter(employee=employee, timestamp__date=today)
            .order_by("-timestamp")
            .first()
        )

        if latest_record:
            attendance_type = (
                cls.TIME_OUT
                if latest_record.attendance_type == cls.TIME_IN
                else cls.TIME_IN
            )
        else:
            attendance_type = cls.TIME_IN

        return cls.objects.create(
            employee=employee, timestamp=timestamp, attendance_type=attendance_type
        )


class Leave(models.Model):
    PAID_LEAVE = 0
    SICK = 1
    MATERNITY = 2
    LEAVE_WITHOUT_PAY = 3
    HALF_DAY_LEAVE = 4

    LEAVE_TYPES = (
        (PAID_LEAVE, "PAID_LEAVE"),
        (SICK, "SICK"),
        (MATERNITY, "MATERNITY"),
        (LEAVE_WITHOUT_PAY, "LEAVE WITHOUT PAY"),
        (HALF_DAY_LEAVE, "HALF DAY LEAVE"),
    )

    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="leaves"
    )
    leave_type = models.IntegerField(choices=LEAVE_TYPES, blank=False, null=False)
    details = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_approved = models.BooleanField(default=False)


class Allowance(models.Model):
    MEAL = 0
    TRANSPORTATION = 1
    MEDICAL = 2
    BONUS = 3

    ALLOWANCE_TYPE = (
        (MEAL, "MEAL ALLOWANCE"),
        (TRANSPORTATION, "TRANSPORTATION ALLOWANCE"),
        (MEDICAL, "MEDICAL ALLOWANCE"),
        (BONUS, "BONUS"),
    )

    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="allowances"
    )
    value = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    allowance_type = models.IntegerField(
        choices=ALLOWANCE_TYPE, blank=False, null=False
    )
    is_taxable = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Allowance for {self.employee.user.username}"


class SalaryDeduction(models.Model):
    LOAN = 0
    HEALTH = 1
    SOCIAL_SECURITY = 2
    OTHERS = 3

    DEDUCTION_TYPE = (
        (LOAN, "LOAN"),
        (HEALTH, "HEALTH INSURANCE"),
        (SOCIAL_SECURITY, "SOCIAL SECURITY"),
        (OTHERS, "OTHERS"),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deduction_type = models.IntegerField(
        choices=DEDUCTION_TYPE, blank=False, null=False
    )
    is_active = models.BooleanField(default=True)


class Payslip(models.Model):
    """Individual employee payslip for a specific payroll period"""

    DRAFT = 1
    GENERATED = 2
    APPROVED = 3
    PAID = 4
    CANCELLED = 5

    STATUS_CHOICES = (
        (DRAFT, "Draft"),
        (GENERATED, "Generated"),
        (APPROVED, "Approved"),
        (PAID, "Paid"),
        (CANCELLED, "Cancelled"),
    )

    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    SEMI_MONTHLY = "semi_monthly"
    MONTHLY = "monthly"

    PAYFREQUENCY_CHOICES = (
        (WEEKLY, "Weekly"),
        (BIWEEKLY, "Biweekly"),
        (SEMI_MONTHLY, "Semi Monthly"),
        (MONTHLY, "Monthly"),
    )

    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="payslips"
    )

    # Attendance data
    total_working_days = models.IntegerField(default=0)
    days_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    regular_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # Final amounts
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    withholding_tax = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )

    # Status and metadata
    status = models.IntegerField(choices=STATUS_CHOICES, default=DRAFT)

    start_date = models.DateField()
    end_date = models.DateField()

    # Timestamps
    generated_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    pay_frequency = models.CharField(choices=PAYFREQUENCY_CHOICES, default=MONTHLY)

    class Meta:
        unique_together = ("employee", "start_date", "end_date")
        ordering = ["employee__user__last_name"]

    def __str__(self):
        return f"Payslip - {self.employee.user.get_full_name()}"


class PayslipAllowance(models.Model):
    payslip = models.ForeignKey(
        Payslip, on_delete=models.CASCADE, related_name="payslip_allowances"
    )
    allowance_type = models.IntegerField(choices=Allowance.ALLOWANCE_TYPE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)


class PayslipDeduction(models.Model):
    payslip = models.ForeignKey(
        Payslip, on_delete=models.CASCADE, related_name="payslip_deductions"
    )
    deduction_type = models.IntegerField(choices=SalaryDeduction.DEDUCTION_TYPE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
