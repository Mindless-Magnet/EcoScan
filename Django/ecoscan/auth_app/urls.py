from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.auth_login, name='auth_login'),    
    path('signup/', views.signup, name='auth_signup'),
    
]
