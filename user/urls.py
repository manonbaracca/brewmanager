from django.urls import path, include
from .views import register_api, login_api, logout_api, profile_api,  profile_update_api, current_user_api, staff_list_api, staff_detail_api

urlpatterns = [
    path('register/', register_api, name='api-register'),
    path('login/',    login_api,    name='api-login'),
    path('logout/',   logout_api,   name='api-logout'),
    path('user/', current_user_api, name='api-current-user'),
    path('profile/', profile_api, name='api-profile'),
    path('profile/update/', profile_update_api, name='api-profile-update'),
    path('staff/', staff_list_api, name='api-staff-list'),
    path('staff/<int:pk>/',  staff_detail_api, name='api-staff-detail'),

]
