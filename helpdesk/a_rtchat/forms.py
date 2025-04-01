from django.forms import ModelForm
from django import forms
from .models import *

class ChatmessageCreateForm(ModelForm):
    class Meta:
        model = GroupMessage
        fields = ['body']
        widgets = {
            'body' : forms.TextInput(attrs={ 'placeholder': 'Mande sua mensagem ...', 'style': 'color:black; font-size:12px; padding: 0.8em; width: 700px; max-width: 550px; margin-bottom:5px; border-radius:10px' , 'maxlength' : '300', 'autofocus': True }),
        }
        
        
class NewGroupForm(ModelForm):
    class Meta:
        model = ChatGroup
        fields = ['groupchat_name']
        widgets = {
            'groupchat_name' : forms.TextInput(attrs={
                'placeholder': 'Add name ...', 
                'class': ' p-4 text-black mt-4 align-self-stretch w-100' ,
                'maxlength' : '300', 
                'autofocus': True,
                }),
        }
        
        
class ChatRoomEditForm(ModelForm):
    class Meta:
        model = ChatGroup
        fields = ['groupchat_name']
        widgets = {
            'groupchat_name' : forms.TextInput(attrs={
                'class': 'p-4 text-xl font-bold mb-4 mt-4 align-self-stretch', 
                'maxlength' : '300', 
                }),
        }