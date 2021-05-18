from django.urls import path
from .views import index, recording

urlpatterns = [
    path('', index, name='index'),
    path('recording/<str:status>', recording, name='recording'),
]