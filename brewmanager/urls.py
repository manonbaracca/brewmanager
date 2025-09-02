from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('user.urls')),
    path('api/', include('dashboard.urls')),  
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token, name='api-token-auth'),

    re_path(
        r'^(?!api/|admin/|static/|media/).*$',
        TemplateView.as_view(template_name='index.html'),
        name='spa'
    ),
]
