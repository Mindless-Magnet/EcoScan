# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('auth/', views.auth_view, name='auth'),
    path('auth/login/', views.login_api, name='login_api'),
    path('auth/signup/', views.signup_api, name='signup_api'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
]