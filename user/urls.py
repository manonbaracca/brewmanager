from django.urls import path
from . import views as v       
from . import api_views as av  

urlpatterns = [
    path('health/db/', v.health_db, name='api-health-db'),
    path('csrf/',             v.csrf_api,               name='api-csrf'),
    path('register/',         v.register_api,           name='api-register'),
    path('login/',            v.login_api,              name='api-login'),
    path('login/verify/',     v.verify_otp_api,         name='api-login-verify'),
    path('logout/',           v.logout_api,             name='api-logout'),
    path('profile/',          v.profile_api,            name='api-profile'),
    path('profile/update/',   v.profile_update_api,     name='api-profile-update'),
    path('staff/',            v.staff_list_api,         name='api-staff-list'),
    path('staff/<int:pk>/',   v.staff_detail_api,       name='api-staff-detail'),
    path('user/',                     av.current_user,               name='api-current-user'),
    path('password-reset/request/',   av.password_reset_request_api, name='api-password-reset-request'),
    path('password-reset/confirm/',   av.password_reset_confirm_api, name='api-password-reset-confirm'),
    path('health/smtp/', v.health_smtp, name='api-health-smtp'),

]
