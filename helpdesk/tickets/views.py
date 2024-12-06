from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth import login as django_login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Ticket
from django.urls import path
from . import views
import json
from django.views.decorators.csrf import csrf_exempt



def cadastro(request):
    if request.method == "GET":
        return render(request, 'registerpage.html')
    else: 
        nome = request.POST.get('nome')
        email = request.POST.get('email')
        senha = request.POST.get('senha')
        check_senha = request.POST.get('check_senha')

        user = User.objects.filter(username=nome).first()

        if user:
            return HttpResponse('Usuário já cadastrado!')
        
        user2 = User.objects.create_user(username=nome, email=email, password=senha)
        user2.save()

        return render(request, 'index.html')

def login(request):
    if request.method == "GET":
        return render(request, 'login.html')
    else:
        nome = request.POST.get('nome')
        senha = request.POST.get('senha')
        usuario = User.objects.get(email=nome)

        user = authenticate(username=usuario.username, password=senha)

        if user:
            django_login(request, user)
            return render(request, 'index.html')
        else:
            return HttpResponse('Usuário ou senha incorretos!')

@login_required(login_url='/auth/login/')
def index(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Verifica se é uma requisição AJAX
        tickets = Ticket.objects.all().values('user', 'department', 'title', 'status', 'nameAnalista')
        return JsonResponse(list(tickets), safe=False)
    else:
        return render(request, 'index.html')

def api_tickets(request):
    tickets = Ticket.objects.all().values('user', 'department', 'title', 'status', 'name_analyst', 'description', 'created_at')
    return JsonResponse(list(tickets), safe=False)
@csrf_exempt
def assign_analyst(request, ticket_id):
    if request.method == "POST":
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            data = json.loads(request.body)
            ticket.name_analyst = data.get('name_analyst')
            ticket.status = 'atendendo'  # Atualizando o status
            ticket.save()

            return JsonResponse({'status': 'success', 'message': 'Analista atribuído com sucesso'})
        except Ticket.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Ticket não encontrado'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)

@login_required(login_url='/auth/login/')
def open_ticket_view(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        department = request.POST.get('department')
        name_analyst = request.POST.get('name_analyst')
        description = request.POST.get('description')
        
        # Crie um novo ticket e salve no banco de dados
        ticket = Ticket(title=title, department=department, name_analyst=name_analyst, description=description)
        ticket.save()
        
        return JsonResponse({'status': 'success', 'ticket_id': ticket.id})
    return render(request, 'openticket.html')


def list_tickets(request):
    tickets = Ticket.objects.all()
    return render(request, 'list_tickets.html', {'tickets': tickets})

    

