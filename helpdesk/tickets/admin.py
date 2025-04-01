from django.contrib import admin
from .models import Ticket, FAQ, Profile, EmailAnalista

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'department', 'title', 'name_analyst', 'description', 'created_at', 'resolved_at', 'status')
    list_filter = ('department', 'name_analyst', 'created_at', 'resolved_at', 'status')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'profile_picture']  
    search_fields = ['user__username'] 
    list_filter = ['user']

@admin.register(EmailAnalista)
class EmailAnalistaAdmin(admin.ModelAdmin):
    list_display = ['email_analista']