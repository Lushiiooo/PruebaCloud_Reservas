#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api_reservas.models import MenuItem
from decimal import Decimal

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

for nombre, categoria, descripcion, precio in menu_items:
    MenuItem.objects.get_or_create(
        nombre=nombre,
        defaults={
            'categoria': categoria,
            'descripcion': descripcion,
            'precio': precio,
            'disponible': True
        }
    )

print('✅ 10 items de menú creados exitosamente')
print(f'Total items en BD: {MenuItem.objects.count()}')
