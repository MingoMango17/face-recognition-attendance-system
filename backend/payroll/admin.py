from django.contrib import admin
from .models import *

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "department",
        "salary_type",
        "base_salary",
        "hire_date",
        "is_active",
    )
    list_filter = ("salary_type", "department", "is_active", "hire_date")
    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "department",
    )
    ordering = ("-hire_date",)

    def full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("employee", "timestamp", "attendance_type")
    list_filter = ("attendance_type", "timestamp")
    search_fields = (
        "employee__user__username",
        "employee__user__first_name",
        "employee__user__last_name",
    )
    date_hierarchy = "timestamp"


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date", "is_approved")
    list_filter = ("leave_type", "is_approved", "start_date")
    search_fields = (
        "employee__user__username",
        "employee__user__first_name",
        "employee__user__last_name",
    )
    date_hierarchy = "start_date"


@admin.register(Allowance)
class AllowanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "allowance_type", "value", "is_taxable", "is_active")
    list_filter = ("allowance_type", "is_taxable", "is_active")
    search_fields = (
        "employee__user__username",
        "employee__user__first_name",
        "employee__user__last_name",
    )


@admin.register(SalaryDeductions)
class SalaryDeductionsAdmin(admin.ModelAdmin):
    list_display = ("employee", "deduction_type", "value", "is_active")
    list_filter = ("deduction_type", "is_active")
    search_fields = (
        "employee__user__username",
        "employee__user__first_name",
        "employee__user__last_name",
    )


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "start_date",
        "end_date",
        "gross_salary",
        "net_salary",
        "status",
    )
    list_filter = ("status", "start_date")
    search_fields = (
        "employee__user__username",
        "employee__user__first_name",
        "employee__user__last_name",
    )
    date_hierarchy = "start_date"
    readonly_fields = ("generated_at",)
