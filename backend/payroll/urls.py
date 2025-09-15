from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.SimpleRouter()

urlpatterns = [
    path("", include(router.urls)),
    path("employees/", EmployeeView.as_view(), name="employees"),
]
