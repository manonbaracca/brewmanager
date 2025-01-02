from django.contrib import admin
from django.urls import path, include
from user import views as user_view
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from user.views import custom_logout 
from dashboard import views
"""
URL configuration for stockify project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('dashboard.urls')),
    path ('register/', user_view.register, name= 'user-register'),
    path ('profile/', user_view.profile, name= 'user-profile'),
    path ('', auth_views.LoginView.as_view(template_name='user/login.html'), name= 'user-login'),
    path('logout/', custom_logout, name='user-logout'), 
    path ('profile/update/', user_view.profile_update, name= 'user-profile-update'),
    path('staff/delete/<int:pk>/', views.staff_delete, name='dashboard-staff-delete'),
    path('pedidos/detalles/<int:pk>/', views.pedido_detalles, name='dashboard-pedido-detalles'),
    path('pedidos/delete/<int:pk>/', views.pedido_delete, name='dashboard-pedido-delete'),


    ]
