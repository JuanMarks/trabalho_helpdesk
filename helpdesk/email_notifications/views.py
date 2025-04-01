from django.shortcuts import render
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth.models import User

def send_email(subject, context, recipient_list):
    try:
        # Busca os e-mails dos analistas diretamente
        if not recipient_list:
            print("Nenhum destinatário encontrado para envio de e-mail.")
            return False

        # Renderiza o template HTML com o contexto
        html_content = render_to_string('email.html', context)
        text_content = strip_tags(html_content)

        # Configuração do e-mail
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=recipient_list,
        )
        email.attach_alternative(html_content, "text/html")  # Adiciona o HTML como alternativa
        email.send()  # Envia o e-mail
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return False
    
def email(request):
    return render(request, 'email.html')
