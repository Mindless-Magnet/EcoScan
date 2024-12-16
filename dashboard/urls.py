# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.app, name='app'),
    path('scan/', views.scan, name='scan'),
    path('product/<str:barcode>/', views.product_detail, name='product_detail'),
]