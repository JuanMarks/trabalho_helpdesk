from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.cadastro, name='registerpage'),
    path('logout', views.logout, name='logout'),
    path('login/', views.login, name='login'),
    path('analista/', views.analista, name='analista'),
    path('openticket/', views.open_ticket_view, name='openticket'),
    path('list_tickets/', views.list_tickets, name='list_tickets'),
    path('api/tickets/', views.api_tickets, name='api_tickets'),
    path('api/tickets/atender_ticket/<int:ticket_id>/', views.atender_ticket, name='atender_ticket'),
    path('api/tickets/assign_analyst/<int:ticket_id>/', views.assign_analyst, name='assign_analyst'),
    path('api/staff_users/', views.get_staff_users, name='staff_users'),
    path('reports/', views.reports, name='reports'),
    path('api/tickets/close_ticket/<int:ticket_id>/', views.close_ticket, name='close_ticket'),
    path('edit_profile/', views.update_profile, name='edit_profile'), 
    path('profile/<str:username>/', views.update_profile, name='profile'),
    path('validate_password/', views.validate_password, name='validate_password'), 
    path('update_profile/', views.update_profile, name='update_profile'), 
    path('update_password/', views.update_password, name='update_password'),
    path('faq_list/', views.faq_list, name='faq_list'),
    path('add/', views.add_faq, name='add_faq'),
    path('faq_list/<int:faq_id>/', views.faq_feedback, name='faq_feedback'),
    path('faq_list/delete/<int:faq_id>/', views.faq_delete, name='faq_delete'),
    path('reset/<uidb64>/<token>/', views.MyPasswordResetConfirm.as_view(template_name='password_reset_confirm.html'), name='password_reset_confirm'),  
    path('reset/done/', views.MyPasswordResetComplete.as_view(template_name='password_reset_complete.html'), name='password_reset_complete'),  
    path('password_reset/', views.MyPasswordReset.as_view(template_name='password_reset_form.html'), name='password_reset'), 
    path('password_reset/done/', views.MyPasswordResetDone.as_view(template_name='password_reset_done.html'), name='password_reset_done'),

]