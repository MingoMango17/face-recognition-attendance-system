from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


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
    timestamp = models.DateTimeField(auto_now_add=True)
    attendance_type = models.IntegerField(
        choices=ATTENDANCE_TYPE, blank=False, null=False
    )


class Leave(models.Model):
    SICK = 1
    MATERNITY = 2
    LEAVE_WITHOUT_PAY = 3

    LEAVE_TYPES = (
        (SICK, "SICK"),
        (MATERNITY, "MATERNITY"),
        (LEAVE_WITHOUT_PAY, "LEAVE WITHOUT PAY"),
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
    MEAL = 1
    TRANSPORTATION = 2
    MEDICAL = 3
    BONUS = 4

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
    TAX = 1
    HEALTH = 2
    SOCIAL_SECURITY = 3
    OTHERS = 4

    DEDUCTION_TYPE = (
        (TAX, "TAX DEDUCTION"),
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

    # Status and metadata
    status = models.IntegerField(choices=STATUS_CHOICES, default=DRAFT)

    start_date = models.DateField()
    end_date = models.DateField()

    # Timestamps
    generated_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("employee", "start_date", "end_date") 
        ordering = ["employee__user__last_name"]

    def __str__(self):
        return f"Payslip - {self.employee.user.get_full_name()}"

class PayslipAllowance(models.Model):
    payslip = models.ForeignKey(Payslip, on_delete=models.CASCADE, related_name="payslip_allowances")
    allowance_type = models.IntegerField(choices=Allowance.ALLOWANCE_TYPE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

class PayslipDeduction(models.Model):
    payslip = models.ForeignKey(Payslip, on_delete=models.CASCADE, related_name="payslip_deductions")
    deduction_type = models.IntegerField(choices=SalaryDeduction.DEDUCTION_TYPE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)