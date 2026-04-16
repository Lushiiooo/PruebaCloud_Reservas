#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api_reservas.models import Orden
from api_reservas.serializers import OrdenSerializer

# Test 1: Crear orden simple "Para Retirar"
print("=" * 60)
print("TEST: Creando orden 'Para Retirar'")
print("=" * 60)

orden_data = {
    'nombre_cliente': 'Test User',
    'telefono': '1234567890',
    'tipo': 'Para Retirar',
    'mesa': None,
    'fecha_hora_retiro': None,
}

print("\nDatos enviados:")
print(json.dumps(orden_data, indent=2))

serializer = OrdenSerializer(data=orden_data)

if serializer.is_valid():
    print("\n✅ Validación exitosa")
    orden = serializer.save()
    print(f"✅ Orden creada con ID: {orden.id}")
    print(f"   - Tipo: {orden.tipo}")
    print(f"   - Mesa: {orden.mesa}")
    print(f"   - Fecha/hora retiro: {orden.fecha_hora_retiro}")
else:
    print("\n❌ Errores de validación:")
    print(json.dumps(serializer.errors, indent=2))

# Test 2: Crear orden "Comer en Mesa"
print("\n" + "=" * 60)
print("TEST: Creando orden 'Comer en Mesa'")
print("=" * 60)

orden_data2 = {
    'nombre_cliente': 'Test User 2',
    'telefono': '9876543210',
    'tipo': 'Comer en Mesa',
    'mesa': 1,
    'fecha_hora_retiro': None,
}

print("\nDatos enviados:")
print(json.dumps(orden_data2, indent=2))

serializer2 = OrdenSerializer(data=orden_data2)

if serializer2.is_valid():
    print("\n✅ Validación exitosa")
    orden2 = serializer2.save()
    print(f"✅ Orden creada con ID: {orden2.id}")
    print(f"   - Tipo: {orden2.tipo}")
    print(f"   - Mesa: {orden2.mesa}")
else:
    print("\n❌ Errores de validación:")
    print(json.dumps(serializer2.errors, indent=2))

print("\n" + "=" * 60)
print("Tests completados")
print("=" * 60)
