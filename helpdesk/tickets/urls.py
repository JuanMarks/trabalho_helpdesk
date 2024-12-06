from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.cadastro, name='registerpage'),
    path('login/', views.login, name='login'),
    path('index/', views.index, name='index'),
    path('openticket/', views.open_ticket_view, name='openticket'),
    path('list_tickets/', views.list_tickets, name='list_tickets'),
    path('api/tickets/', views.api_tickets, name='api_tickets'),
    path('api/tickets/assign_analyst/<int:ticket_id>/', views.assign_analyst, name='assign_analyst'),


]