from .models import AuditLog
from threading import Thread
from django.core.mail import EmailMessage, get_connection
from django.conf import settings

def log_action(user, action, description=''):
    AuditLog.objects.create(user=user, action=action, description=description)
    
def send_async_email(subject, message, to_email):
    """
    Envía un email en segundo plano. Si falla, no rompe el request.
    """
    def _send():
        try:
            conn = get_connection(timeout=getattr(settings, 'EMAIL_TIMEOUT', 15))
            EmailMessage(subject, message, settings.DEFAULT_FROM_EMAIL, [to_email], connection=conn).send()
        except Exception:
            pass

    if to_email:
        Thread(target=_send, daemon=True).start()