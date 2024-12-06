from django.db import models

class Ticket(models.Model):
    # Campo para o nome do usuário
    user = models.CharField(max_length=200, null=True, blank=True)  # Representa o usuário
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
    name_analyst = models.CharField(max_length=200, default='Sem Analista', blank=True)
    description = models.TextField()  # Verifique se este campo existe
    created_at = models.DateTimeField(auto_now_add=True)  # Verifique se este campo existe

    def __str__(self):
        return self.title
