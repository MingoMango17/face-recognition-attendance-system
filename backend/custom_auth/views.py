# views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Manual login view that creates JWT tokens.
    Expected payload: {"username": "user", "password": "pass"}
    """
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user_id": user.id,
                "username": user.username,
                "full_name": f"{user.first_name} {user.last_name}",
                "role": user.get_role_display(),
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Manual token refresh view.
    Expected payload: {"refresh": "refresh_token_here"}
    """
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        return Response(
            {"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        refresh = RefreshToken(refresh_token)
        return Response(
            {
                "access": str(refresh.access_token),
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
def logout_view(request):
    """
    Logout view that blacklists the refresh token.
    Expected payload: {"refresh": "refresh_token_here"}
    """
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        return Response(
            {"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"message": "Successfully logged out"}, status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """
    Verify if an access token is valid.
    Uses IsAuthenticated permission class to validate the token automatically.
    Expected header: Authorization: Bearer <access_token>
    """

    user = request.user

    return Response(
        {
            "valid": True,
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": f"{user.first_name} {user.last_name}",
            "role": user.get_role_display(),
            "is_staff": user.is_staff,
            "is_active": user.is_active,
        },
        status=status.HTTP_200_OK,
    )
