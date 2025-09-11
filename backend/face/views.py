from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from facedb import FaceDB

facedb = FaceDB(
    path="facedata",
)


class FaceRecognitionView(APIView):

    def get(self, request):
        data = request.data
        if hasattr(data, "image"):
            embed_img = facedb.embedding_func(data.get("image"))
            similar_results = facedb.check_similar(embeddings=embed_img)

            if similar_results:
                return Response(
                    {
                        data: {
                            "message": "face is found",
                        },
                    },
                    status=status.HTTP_200_OK,
                )

            return Response({}, status=status.HTTP_200_OK)

        return Response(
            {"error": {"message": "image is required"}},
            status=status.HTTP_400_BAD_REQUEST,
        )
