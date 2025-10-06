from pathlib import Path
import os
import environ
import sys

BASE_DIR = Path(__file__).resolve().parent.parent

RUNNING_ON_RENDER = "RENDER" in os.environ

env = environ.Env(DEBUG=(bool, True))
if not RUNNING_ON_RENDER and os.path.exists(BASE_DIR / ".env"):
    environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env('SECRET_KEY', default='dev-only-key-no-usar-en-produccion')
DEBUG = env.bool('DEBUG', default=True)

ALLOWED_HOSTS = ["localhost", "127.0.0.1", ".onrender.com"]


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'dashboard.apps.DashboardConfig',
    'user.apps.UserConfig',

    'phonenumber_field',
    'crispy_forms',
    'crispy_bootstrap5',
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'brewmanager.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [

        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'brewmanager.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT', default='3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_ALL_TABLES'",
        },
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

CRISPY_TEMPLATE_PACK = 'bootstrap5'


LANGUAGE_CODE = 'es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


LOGIN_REDIRECT_URL = 'dashboard-index'
LOGIN_URL = 'user-login'


if RUNNING_ON_RENDER or os.environ.get("LOG_TO_STDOUT"):
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "handlers": {
            "console": {"class": "logging.StreamHandler", "stream": sys.stdout},
        },
        "root": {"handlers": ["console"], "level": "INFO"},
        "loggers": {
            "django": {"handlers": ["console"], "level": "INFO", "propagate": True},
        },
    }
else:
    LOG_DIR = BASE_DIR / "logs"
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "handlers": {
            "file": {
                "level": "INFO",
                "class": "logging.FileHandler",
                "filename": str(LOG_DIR / "auditoria.log"),
            },
            "console": {"class": "logging.StreamHandler", "stream": sys.stdout},
        },
        "root": {"handlers": ["file", "console"], "level": "INFO"},
        "loggers": {
            "django": {"handlers": ["file", "console"], "level": "INFO", "propagate": True},
        },
    }

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
}
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://brewmanager-viu.vercel.app",
]        

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
]

CSRF_TRUSTED_ORIGINS = [
    "https://*.onrender.com",
    "http://localhost:3000",
    "https://*.vercel.app",
    "http://127.0.0.1:3000",
    "https://brewmanager-viu.vercel.app",
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SAMESITE = "None"

EMAIL_BACKEND      = env('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST         = env('EMAIL_HOST',    default='smtp.sendgrid.net')
EMAIL_PORT         = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS      = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER    = env('EMAIL_HOST_USER')       
EMAIL_HOST_PASSWORD= env('EMAIL_HOST_PASSWORD')  
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)
EMAIL_TIMEOUT      = env.int('EMAIL_TIMEOUT', default=15)

FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:3000')

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
