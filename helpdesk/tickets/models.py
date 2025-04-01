from django.db import models
from django.contrib.auth.models import User

class Ticket(models.Model):
    # Campo para o nome do usuário
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tickets_created")  # Representa o usuário
    # Cargo ou departamento
    department = models.CharField(max_length=200, null=True, blank=True)  # Cargo
    # Título do ticket (antes 'problem')
    title = models.CharField(max_length=200, default='Título Padrão')
    # Status do ticket, com uma escolha de opções
    STATUS_CHOICES = [
        ('atendendo', 'Atendendo'),
        ('encerrado', 'Encerrado'),
        ('pendente', 'Pendente'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    # Nome do analista que está responsável pelo ticket
    name_analyst = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="tickets_assigned", null=True, blank=True, limit_choices_to={"is_staff": True}) # Representa o analista
    description = models.TextField()  # Verifique se este campo existe
    created_at = models.DateTimeField(auto_now_add=True)  # Verifique se este campo existe
    protocol_instance = models.OneToOneField('Protocol', on_delete=models.CASCADE, null=True, blank=True,related_name='ticket')

    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

#Model para a geração do protocolos
class Protocol(models.Model):
    ticket_instance = models.OneToOneField(Ticket, on_delete=models.CASCADE)
    protocol = models.CharField(max_length=10)

    def __str__(self):
        return self.protocol

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='img/profile_pictures/', blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    sector = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.user.username
    
class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    useful_count = models.PositiveIntegerField(default=0)
    not_useful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question
    
class EmailAnalista(models.Model):
    email_analista = models.CharField(max_length=50)
