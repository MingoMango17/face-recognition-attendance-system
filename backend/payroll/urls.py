from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.SimpleRouter()

urlpatterns = [
    path("", include(router.urls)),
    path("employees/", EmployeeView.as_view(), name="employees"),
    path(
        "employees/<int:employee_id>/", EmployeeView.as_view(), name="employee-detail"
    ),
    path("deductions/", DeductionView.as_view(), name="deductions"),
    path("allowances/", AllowanceView.as_view(), name="allowances"),
    path("leaves/", LeaveView.as_view(), name="leaves"),
    path("attendance/", AttendanceRecordView.as_view(), name="attendances"),
    path("payslips/", PayslipView.as_view(), name="payslip-list"),
    path("payslips/<int:payslip_id>/", PayslipView.as_view(), name="payslip-detail"),
    # Payslip generation endpoints
    path("payslips/generate/", PayslipGenerateView.as_view(), name="payslip-generate"),
    # Statistics endpoint
    path("payslips/stats/", PayslipStatsView.as_view(), name="payslip-stats"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("mark-attendance/", MarkAttendanceView.as_view(), name="mark-attendance"),
    path("delete-all/", delete_all_data_view, name="delete-all-data"),
]
