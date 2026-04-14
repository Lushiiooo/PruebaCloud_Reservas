#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

print("=" * 60)
print("CREANDO TOKENS PARA USUARIOS")
print("=" * 60)

# Obtener o crear usuario admin
try:
    admin_user = User.objects.get(username='admin')
    print(f"\n✅ Usuario 'admin' encontrado")
except User.DoesNotExist:
    print(f"\n❌ Usuario 'admin' NO existe!")
    print("Créalo con:")
    print("  python manage.py createsuperuser")
    exit(1)

# Obtener o crear token para admin
token, created = Token.objects.get_or_create(user=admin_user)

if created:
    print(f"✅ Token CREADO para usuario 'admin'")
else:
    print(f"⏭️  Token ya existe para usuario 'admin'")

print(f"\n🔑 Token: {token.key}")
print(f"\n💾 El token está guardado en la BD")
print(f"\nPara usar: Authorization: Token {token.key}")
print("\n" + "=" * 60)
