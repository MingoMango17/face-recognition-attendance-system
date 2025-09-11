from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.SimpleRouter()
# router.register(r'recognize/', FaceRecognitionView)

urlpatterns = [
    path(r"recognize/", FaceRecognitionView.as_view(), name="face-recognize"),
    path(r"add/", AddFaceView.as_view(), name="face-add"),
    # path('', include(router.urls))
]
