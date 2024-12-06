from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'title', 'name_analyst', 'description', 'created_at')
    list_filter = ('department', 'name_analyst', 'created_at')
