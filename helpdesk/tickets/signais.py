from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from tickets.models import Profile  # Importe o modelo Profile corretamente
image_picture = '../static/img/placeholder-image.jpg'
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        instance.profile.profile_picture = image_picture
        instance.profile.save()
    
    instance.profile.save()
