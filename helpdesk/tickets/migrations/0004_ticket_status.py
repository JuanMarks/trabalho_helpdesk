# Generated by Django 5.1.3 on 2024-12-03 13:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0003_rename_title_ticket_problem_alter_ticket_analyst_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='status',
            field=models.CharField(default='pendente', max_length=20),
        ),
    ]
