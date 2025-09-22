from django.urls import path
from .views import *

urlpatterns = [
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("refresh/", refresh_token_view, name="refresh"),
    path("verify/", verify_token, name="verify"),
    path("change-password/", change_admin_password, name="change-pass"),
    path("delete-data/", delete_all_data_view, name="delete-data")
]
