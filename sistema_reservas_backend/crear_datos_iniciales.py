#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api_reservas.models import Mesa, MenuItem
from decimal import Decimal

print("=" * 60)
print("INICIALIZANDO DATOS DEL SISTEMA DE RESERVAS")
print("=" * 60)

# ==================== CREAR MESAS ====================
print("\n📍 Creando mesas...")
mesas_data = [
    (1, 4, 'Interior'),
    (2, 2, 'Terraza'),
    (3, 6, 'Interior'),
]

for numero, capacidad, ubicacion in mesas_data:
    mesa, created = Mesa.objects.get_or_create(
        numero=numero,
        defaults={
            'capacidad': capacidad,
            'ubicacion': ubicacion
        }
    )
    if created:
        print(f"  ✅ Mesa {numero} - {capacidad} personas - {ubicacion}")
    else:
        print(f"  ⏭️  Mesa {numero} ya existe")

print(f"Total mesas en BD: {Mesa.objects.count()}")

# ==================== CREAR MENÚ ====================
print("\n🍽️  Creando menú...")
menu_items = [
    ('Hamburguesa Clásica', 'Hamburguesas', 'Hamburguesa con queso y vegetales', Decimal('8.99')),
    ('Hamburguesa Doble', 'Hamburguesas', 'Doble de carne con queso derretido', Decimal('10.99')),
    ('Pizza Margherita', 'Pizzas', 'Pizza clásica con tomate, mozzarella y albahaca', Decimal('12.99')),
    ('Pizza Pepperoni', 'Pizzas', 'Pizza con abundante pepperoni y queso', Decimal('13.99')),
    ('Hot Dog Clásico', 'Hot Dogs', 'Hot dog con mayonesa y mostaza', Decimal('5.99')),
    ('Hot Dog Especial', 'Hot Dogs', 'Hot dog con salsas surtidas y vegetales', Decimal('7.99')),
    ('Refresco Pequeño', 'Bebidas', 'Servido en vaso pequeño', Decimal('2.99')),
    ('Refresco Grande', 'Bebidas', 'Servido en vaso grande', Decimal('3.99')),
    ('Pastel de Chocolate', 'Postres', 'Delicioso pastel casero de chocolate', Decimal('4.99')),
    ('Flan', 'Postres', 'Flan tradicional con caramelo', Decimal('3.99')),
]

created_count = 0
for nombre, categoria, descripcion, precio in menu_items:
    item, created = MenuItem.objects.get_or_create(
        nombre=nombre,
        defaults={
            'categoria': categoria,
            'descripcion': descripcion,
            'precio': precio,
            'disponible': True
        }
    )
    if created:
        print(f"  ✅ {nombre} (${precio})")
        created_count += 1
    else:
        print(f"  ⏭️  {nombre} ya existe")

print(f"Total items de menú en BD: {MenuItem.objects.count()}")

print("\n" + "=" * 60)
print("✅ INICIALIZACIÓN COMPLETADA")
print("=" * 60)
print("\n📊 Resumen:")
print(f"  • Mesas: {Mesa.objects.count()}")
print(f"  • Items de Menú: {MenuItem.objects.count()}")
print("\n🚀 El sistema está listo para funcionar")
