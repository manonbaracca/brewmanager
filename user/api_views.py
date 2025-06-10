from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from .forms import CrearUserForm
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

class RegisterAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        form = CrearUserForm(request.data)
        if form.is_valid():
            form.save()
            return Response({'detail': 'Usuario creado'}, status=status.HTTP_201_CREATED)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    u = request.user
    return Response({
        'id': u.id,
        'username': u.username,
        'is_superuser': u.is_superuser,
    })
