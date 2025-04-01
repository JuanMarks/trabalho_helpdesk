from django.contrib import admin
from django.urls import path
from django.urls import include
from django.conf import settings 
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('tickets.urls')),
    path('chat/', include('a_rtchat.urls')),
    path('',include('tickets.urls')),
    path('email/', include('email_notifications.urls')),

]

if settings.DEBUG: urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)