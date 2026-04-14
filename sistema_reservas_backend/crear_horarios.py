#!/usr/bin/env python
"""
Script para crear horarios iniciales del restaurante
Lunes a Viernes: 11:00 - 15:00 y 19:00 - 23:00
Sábado y Domingo: 11:00 - 23:00 (sin cierre)
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from datetime import time
from api_reservas.models import HorarioRestaurante

HORARIOS = [
    # Lunes a Viernes: Almuerzo 11-15, Cena 19-23
    {'dia': 'Lunes', 'apertura': '11:00', 'cierre': '23:00', 'cerrado': False},
    {'dia': 'Martes', 'apertura': '11:00', 'cierre': '23:00', 'cerrado': False},
    {'dia': 'Miércoles', 'apertura': '11:00', 'cierre': '23:00', 'cerrado': False},
    {'dia': 'Jueves', 'apertura': '11:00', 'cierre': '23:00', 'cerrado': False},
    {'dia': 'Viernes', 'apertura': '11:00', 'cierre': '23:00', 'cerrado': False},
    # Sábado y Domingo: Abierto todo el día 11-23
    {'dia': 'Sábado', 'apertura': '11:00', 'cierre': '23:00', 'cerrado': False},
    {'dia': 'Domingo', 'apertura': '11:00', 'cierre': '23:00', 'cerrado': False},
]

def crear_horarios():
    """Crear los horarios iniciales del restaurante"""
    for horario_data in HORARIOS:
        horario, created = HorarioRestaurante.objects.get_or_create(
            dia_semana=horario_data['dia'],
            defaults={
                'hora_apertura': time.fromisoformat(horario_data['apertura']),
                'hora_cierre': time.fromisoformat(horario_data['cierre']),
                'cerrado': horario_data['cerrado'],
            }
        )
        
        if created:
            print(f"✅ {horario_data['dia']}: {horario_data['apertura']} - {horario_data['cierre']}")
        else:
            print(f"⚠️  {horario_data['dia']} ya existe")

if __name__ == '__main__':
    print("\n🕐 Creando horarios del restaurante...\n")
    crear_horarios()
    print("\n✨ ¡Horarios creados exitosamente!\n")
