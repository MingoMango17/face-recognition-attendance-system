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
    path("attendance/", AttendanceRecordView.as_view(), name="attendances")
]
