from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import render, redirect,  get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib import auth
from django.contrib.auth import login as django_login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Ticket, Profile, EmailAnalista
import json
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Q, ExpressionWrapper, DurationField, F, Avg
from .models import Ticket, Protocol, FAQ
from datetime import datetime
from django.utils.dateparse import parse_date
from django.core.paginator import Paginator
from .forms import ProfileForm, FAQForm
from email_notifications.views import send_email
import threading
from django.contrib.auth.views import PasswordResetView, PasswordResetDoneView, PasswordResetCompleteView, PasswordResetConfirmView
from a_rtchat.models import ChatGroup, GroupMessage
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.core.serializers.json import DjangoJSONEncoder
import json



def cadastro(request):
    emails_analistas = EmailAnalista.objects.all()
    if request.method == "GET":
        return render(request, 'registerpage.html')
    else: 
        nome = request.POST.get('nome')
        email = request.POST.get('email')
        senha = request.POST.get('senha')
        check_senha = request.POST.get('check_senha')

        user = User.objects.filter(username=nome).first()

        if user:
            messages.success(request, 'Usuario ja cadastrado')
            return redirect('/register/')
        
        if User.objects.filter(email=email).exists():
            messages.success(request, 'Usuario ja cadastrado')
            return redirect('/register/')
        
        user2 = User.objects.create_user(username=nome, email=email, password=senha)
        if email in [analista.email_analista for analista in emails_analistas]:
            user2.is_staff = True
        
        user2.save()

        return redirect('/login/')

def login(request):
    if request.method == "GET":
        return render(request, 'login.html')
    else:
        nome = request.POST.get('nome')
        senha = request.POST.get('senha')
        usuario = User.objects.filter(email=nome).first()

        if usuario :
            user = authenticate(username=usuario.username, password=senha)

            if user:
                django_login(request, user)
                return redirect('/')
            else:
                messages.success(request, 'Usuario existe, senha incorretos')
                return redirect('/login/')
        else:
            messages.success(request, 'Usuario nao encontrado')
            return redirect('/login/')

def logout(request):
    auth.logout(request)
    return redirect('/')

@login_required(login_url='/login/')
def index(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Verifica se é uma requisição AJAX
        tickets = Ticket.objects.all().values('user', 'department', 'title', 'status', 'nameAnalista')
        return JsonResponse(list(tickets), safe=False)
    else:
        return render(request, 'index.html')


@login_required(login_url='/auth/login/')
def api_tickets(request):
    user = request.user
    tickets = Ticket.objects.filter(user=user.username).order_by('-created_at').values('user', 'department', 'title', 'status', 'name_analyst', 'description', 'created_at')
    return JsonResponse(list(tickets), safe=False)

@login_required(login_url='/login/')
def analista(request):
    if request.user.is_staff:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Verifica se é uma requisição AJAX
            tickets = Ticket.objects.all().values('user', 'department', 'title', 'status', 'nameAnalista')
            return JsonResponse(list(tickets), safe=False)
        else:
            return render(request, 'admin.html')
    else:
        return HttpResponse('Acesso negado.')

def api_tickets(request):
    tickets = Ticket.objects.select_related('user', 'name_analyst').all()
    data = []
    for ticket in tickets:
        data.append({
            'id': ticket.id,
            'title': ticket.title,
            'department': ticket.department,
            'description': ticket.description,
            'protocol': ticket.protocol_instance.protocol,
            'status': ticket.status,
            'user': ticket.user.username.split(' ')[0],  # Adiciona o primeiro nome do usuário
            'profile_picture': ticket.user.profile.profile_picture.url if ticket.user.profile.profile_picture else "../static/img/placeholder-image.jpg",  # Adiciona o nome do usuário
            'name_analyst__username': ticket.name_analyst.username if ticket.name_analyst else "Não atribuído",
            'created_at': ticket.created_at.strftime('%d/%m/%Y'),
        })
    print(tickets)
    return JsonResponse(data, safe=False)
@csrf_exempt
def atender_ticket(request, ticket_id):
    if request.method == "POST":
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            ticket.name_analyst = request.user
            ticket.status = 'atendendo'  # Atualizando o status
            ticket.save()
            messages.success(request, 'Voce agora esta atendendo esse ticket')
            return redirect('/')
        except Ticket.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Ticket não encontrado'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)
@csrf_exempt
def assign_analyst(request, ticket_id):
    if request.method == "POST":
        analista1 = request.POST['analista']
        if analista1 == '':
            messages.warning(request, 'Selecione um analista')
            return redirect('/')
        try:
            usuario = User.objects.get(id=analista1)
            print(f'{analista1} e {usuario}')

            ticket = Ticket.objects.get(id=ticket_id)
            ticket.name_analyst = usuario  # Atualizar o analista
            ticket.status = 'atendendo'   # Atualizar o status
            ticket.save()

            # Adicionar mensagem de sucesso
            messages.success(request, 'O analista foi alterado com sucesso!')

            # Redirecionar para a página /index/
            return redirect('/')
        except User.DoesNotExist:
            messages.error(request, 'Usuário não encontrado.')
            return redirect('/')
        except Ticket.DoesNotExist:
            messages.error(request, 'Ticket não encontrado.')
            return redirect('/')
    messages.error(request, 'Método não permitido.')
    return redirect('/')

def send_email_async(subject, context, recipient_list):
    send_email(subject, context, recipient_list)

@csrf_exempt
def close_ticket(request, ticket_id,):
    if request.method == "POST":
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            ticket.status = 'encerrado'
            print("esse é meu ticket", ticket)
            ticket.resolved_at = datetime.now()
            ticket.save()
            #envio de email
            suject = 'Novo ticket criado - Procolo {protocol1}'
            context = {
                'message_title': 'Ticket Encerrado',
                'message_body': 'O ticket foi encerrado. Obrigado por utilizar o sistema de helpdesk.',
                'user_name': ticket.user.first_name,  # Nome do usuário relacionado ao ticket
            }
            
            recipient_list = [ticket.user.email] 
            email_thread = threading.Thread(target=send_email_async, args=(suject, context, recipient_list))
            email_thread.start()
            
            messages.success(request, 'Voce fechou esse ticket')
            return redirect('/')
        except Ticket.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Ticket não encontrado'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)


@login_required(login_url='/login/')
def open_ticket_view(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        department = request.POST.get('department')
        name_analyst_id = request.POST.get('name_analyst')
        description = request.POST.get('description')

        if request.user.is_authenticated:
            # Busca o analista selecionado (se aplicável)
            name_analyst = None
            if name_analyst_id:
                try:
                    name_analyst = User.objects.get(id=name_analyst_id, is_staff=True)
                except User.DoesNotExist:
                    return JsonResponse({'status': 'error', 'message': 'Analista não encontrado'}, status=404)

            # Crie um novo ticket e salve no banco de dados

            
            ticket = Ticket.objects.create(
                user=request.user, # Armazena o objeto de usuário em vez do username
                title=title,
                department=department,
                name_analyst=name_analyst,
                description=description,
            )
            protocol1 = generate_protocolo(ticket.id)
            protocol_instance = Protocol.objects.create(ticket_instance=ticket, protocol=protocol1)
            ticket.protocol_instance = protocol_instance
            

            # criando uma sala de chat para o ticket
            chatroom = ChatGroup.objects.create(
                group_name=protocol_instance.protocol, 
                groupchat_name=ticket.title,
                admin=ticket.name_analyst,
                is_private=False,
            )
            chatroom.users_online.set([ticket.user, ticket.name_analyst])
            chatroom.members.set([ticket.user, ticket.name_analyst])
            chatroom.save()
            ticket.save() 
            messages.success(request, 'ticket criado com sucesso')
            #envio de email
            suject = f'Novo ticket criado - Procolo {protocol1}'
            context = {
                'message_title': 'Novo Ticket Aberto',
                'message_body': 'Um novo ticket foi aberto na aplicação. Por favor, verifique os detalhes no sistema de helpdesk.',
                'user_name': 'Admin',  # ou outro nome conforme necessário
            }
            recipient_list = [user.email for user in User.objects.filter(is_staff=True)]
            email_thread = threading.Thread(target=send_email_async, args=(suject, context, recipient_list))
            email_thread.start()
            return JsonResponse({'status': 'success', 'ticket_id': ticket.id})
        else:
            return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    # Lista de analistas disponíveis (usuários staff)
    analysts = User.objects.filter(is_staff=True)
    return render(request, 'openticket.html', {'analysts': analysts})  # Usando 'analysts'

#Gerador de protocolos
def generate_protocolo(ticket_id):
    data_hora = datetime.now().strftime('%d%m%Y')
    protocol = f"{ticket_id}{data_hora}"
    return protocol

# def list_tickets(request):
#     tickets = Ticket.objects.all()
#     return render(request, 'list_tickets.html', {'tickets': tickets})

# Tickest do usuário logado
@login_required(login_url='/auth/login/')
def list_tickets(request):
    if not request.user.is_staff:
        tickets = Ticket.objects.filter(user=request.user)
        return render(request, 'list_tickets.html', {'tickets': tickets})
    else:
        return HttpResponse('Acesso negado.')


    tickets = Ticket.objects.all()
    return render(request, 'list_tickets.html', {'tickets': tickets})

def get_staff_users(request):
    staff_users = User.objects.filter(is_staff=True).values('id', 'username')
    return JsonResponse(list(staff_users), safe=False)

def reports(request):
     # Obtendo as datas de filtro
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    # Base queryset
    tickets_queryset = Ticket.objects.all()
       # Aplicando os filtros de data, se fornecidos
    if start_date:
        start_date_parsed = parse_date(start_date)
        if start_date_parsed:
            tickets_queryset = tickets_queryset.filter(created_at__gte=start_date_parsed)

    if end_date:
        end_date_parsed = parse_date(end_date)
        if end_date_parsed:
            # Adicionando o final do dia à data final
            end_date_parsed = datetime.combine(end_date_parsed, datetime.max.time())
            tickets_queryset = tickets_queryset.filter(created_at__lte=end_date_parsed)

    total_tickets = tickets_queryset.count()
     # Paginação
    paginator = Paginator(tickets_queryset, 5)  # 10 tickets por página
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    # Dados agregados para o gráfico de tickets por status
    
    tickets_by_status = tickets_queryset.values('status').annotate(num_of_tickets=Count('id'))

    tickets_status_data = json.dumps({
        'labels': [t['status'] for t in tickets_by_status],
        'data': [t['num_of_tickets'] for t in tickets_by_status],
    }, cls=DjangoJSONEncoder)
    # Calcular a média de resolução
    resolved_tickets = tickets_queryset.filter(resolved_at__isnull=False)  # Apenas tickets resolvidos
    
    average_resolution_time = resolved_tickets.annotate(
        resolution_time=ExpressionWrapper(
            F('resolved_at') - F('created_at'),
            output_field=DurationField()
        )
    ).aggregate(avg_resolution_time=Avg('resolution_time'))['avg_resolution_time']
    # Converter o tempo médio para horas (ou minutos) para exibição
    avg_resolution_time = None
    if average_resolution_time:
        avg_resolution_time = average_resolution_time.total_seconds() / 3600  # Converter para horas

    # Dados agregados para o gráfico de tickets por departamento
    tickets_by_department = tickets_queryset.values('department').annotate(count=Count('id'))
    tickets_department_data = json.dumps({
        'labels': [t['department'] for t in tickets_by_department],
        'data': [t['count'] for t in tickets_by_department],
    }, cls=DjangoJSONEncoder)

    # Dados adicionais para os cards
    avg_response_time = 5     
    return render(request, 'reports.html', {
        'tickets_status_data': tickets_status_data,
        'tickets_department_data': tickets_department_data,
        'tables': page_obj,
        'total_tickets': total_tickets,
        'avg_response_time': avg_response_time,
        'avg_resolution_time': avg_resolution_time,
    })

@login_required(login_url='/')
def update_profile(request):
    context = {}
    if request.method == 'POST':
        user = request.user
        profile = user.profile
        form = ProfileForm(request.POST, request.FILES, instance=profile)

        if form.is_valid():
            profile = form.save(commit=False)
            user.username = request.POST.get('fullName', user.username)
            user.email = request.POST.get('email', user.email)
            user.save()
            profile.save()
            context['success_message'] = 'Perfil atualizado com sucesso!'
        else:
            context['error_message'] = 'Erro ao atualizar o perfil! Verifique os dados informados.'

    if 'form' not in context:
        context['form'] = ProfileForm(instance=request.user.profile)
    return render(request, 'edit_profile.html', context)


@login_required(login_url='/edit_profile')
def validate_password(request):
    context = {}
    if request.method == 'POST':
        password = request.POST.get('password')
        user = authenticate(username=request.user.username, password=password)
        if user:
            context['show_modal'] = True
        else:
            context['error_message'] = 'Senha incorreta!'
    return render(request, 'edit_profile.html', context)

@login_required(login_url='/edit_profile')
def update_password(request):
    context = {}
    if request.method == 'POST':
        new_password = request.POST.get('new_password')
        repeat_password = request.POST.get('repeat_password')
        if new_password != repeat_password:
            context['show_modal'] = True
            context['error_message'] = 'As senhas não coincidem!'
        else:
            request.user.set_password(new_password)
            request.user.save()
            context['success_message'] = 'Senha alterada com sucesso!'
    return render(request, 'edit_profile.html', context)

def faq_list(request):
    faqs = FAQ.objects.all()
    return render(request, 'faq_list.html', {'faqs': faqs})

def faq_feedback(request, faq_id):
    if request.method == "POST":
        faq = get_object_or_404(FAQ, id=faq_id)
        feedback_type = request.POST.get('feedback_type')
        if feedback_type == 'useful':
            faq.useful_count += 1
        elif feedback_type == 'not_useful':
            faq.not_useful_count += 1
        faq.save()
        return JsonResponse({'status': 'success', 'useful_count': faq.useful_count, 'not_useful_count': faq.not_useful_count})
    return JsonResponse({'status': 'error'}, status=400)

def add_faq(request):
    if request.method == 'POST':
        form = FAQForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('faq_list')  
    else:
        form = FAQForm()
    return render(request, 'add_faq.html', {'form': form})

def faq_delete(request, faq_id):
    if request.method == 'DELETE':
        faq = get_object_or_404(FAQ, id=faq_id)
        faq.delete()
        return JsonResponse({'message': 'FAQ deleted successfully.'})


class MyPasswordResetConfirm(PasswordResetConfirmView):
    '''
    Requer password_reset_confirm.html
    '''
    def form_valid(self, form):
        user = form.save()
        user.is_active = True
        user.save()
        return super().form_valid(form)

    
class MyPasswordResetComplete(PasswordResetCompleteView):
    '''
    Requer password_reset_complete.html
    '''
    ...

class MyPasswordReset(PasswordResetView):
    email_template_name = 'password_reset_email.html'
    subject_template_name = 'password_reset_subject.txt'
    success_url = '/password_reset/done/'
    html_email_template_name = 'password_reset_email.html'

    def send_mail(self, subject_template_name, email_template_name, context, from_email, to_email, html_email_template_name=None):

        subject = render_to_string(subject_template_name, context).strip()
        body = render_to_string(email_template_name, context)

        html_content = None
        if html_email_template_name:
            html_content = render_to_string(html_email_template_name, context)
       
        email = EmailMultiAlternatives(
            subject=subject,
            body=body,  
            from_email=from_email,
            to=[to_email],
        )
        if html_content:
            email.attach_alternative(html_content, "text/html")
            
        email.send()

class MyPasswordResetDone(PasswordResetDoneView):
    '''
    Requer
    password_reset_done.html
    '''
    ...
