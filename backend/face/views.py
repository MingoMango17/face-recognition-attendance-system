from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .services import get_facedb
import base64
from io import BytesIO
from PIL import Image


class FaceRecognitionView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        facedb = get_facedb()
        data = request.data

        image_data = data.get("image")
        if not image_data:
            return Response(
                {"error": {"message": "image is required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if image_data.startswith("data:image"):
                # Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                image_data = image_data.split(",")[1]

            # Decode base64 to bytes
            image_bytes = base64.b64decode(image_data)

            # Convert to PIL Image if your embedding function expects that
            image = Image.open(BytesIO(image_bytes))

            # Pass the processed image to your embedding function
            embed_img = facedb.embedding_func(
                image
            )

            similar_results = facedb.check_similar(embeddings=embed_img, threshold=90)

            if similar_results and similar_results[0]:
                return Response(
                    {
                        "data": {
                            "message": "face is found",
                            "similar_face_id": similar_results[0],
                        },
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {"data": {"message": "no similar face found"}},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print(f"Error processing image: {str(e)}")  # For debugging
            return Response(
                {"error": {"message": f"Processing error: {str(e)}"}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AddFaceView(APIView):
    def post(self, request):
        facedb = get_facedb()
        data = request.data
        image_data = data.get("image")

        if not image_data:
            return Response(
                {"error": {"message": "image is required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Handle base64 image data
            if image_data.startswith("data:image"):
                # Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                image_data = image_data.split(",")[1]

            # Decode base64 to bytes
            image_bytes = base64.b64decode(image_data)

            # Convert to PIL Image if your embedding function expects that
            image = Image.open(BytesIO(image_bytes))

            added = facedb.add("jun", img=image)

            return Response(
                {
                    "data": {
                        "message": "Face is added",
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print(f"Error processing image: {str(e)}")  # For debugging
            return Response(
                {"error": {"message": f"Processing error: {str(e)}"}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
