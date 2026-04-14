from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import Mesa, Reserva


class MesaAPITestCase(APITestCase):
    def setUp(self):
        self.mesa1 = Mesa.objects.create(numero=1, capacidad=4, ubicacion='Interior')
        self.mesa2 = Mesa.objects.create(numero=2, capacidad=2, ubicacion='Terraza')
    
    def test_listar_mesas(self):
        response = self.client.get('/api/reservas/mesas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_crear_mesa(self):
        data = {'numero': 3, 'capacidad': 6, 'ubicacion': 'Interior'}
        response = self.client.post('/api/reservas/mesas/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Mesa.objects.count(), 3)


class ReservaAPITestCase(APITestCase):
    def setUp(self):
        self.mesa = Mesa.objects.create(numero=1, capacidad=4, ubicacion='Interior')
        self.fecha_futura = timezone.now().date() + timedelta(days=1)
        self.hora_futura = timezone.now().time()
    
    def test_crear_reserva_exitosa(self):
        data = {
            'nombre_cliente': 'Juan Pérez',
            'telefono': '1234567890',
            'fecha': self.fecha_futura,
            'hora': self.hora_futura,
            'mesa': self.mesa.id,
            'estado': 'Pendiente'
        }
        response = self.client.post('/api/reservas/reservas/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reserva.objects.count(), 1)
        self.assertEqual(response.data['nombre_cliente'], 'Juan Pérez')
    
    def test_crear_reserva_fecha_pasada(self):
        fecha_pasada = timezone.now().date() - timedelta(days=1)
        data = {
            'nombre_cliente': 'Juan Pérez',
            'telefono': '1234567890',
            'fecha': fecha_pasada,
            'hora': self.hora_futura,
            'mesa': self.mesa.id,
            'estado': 'Pendiente'
        }
        response = self.client.post('/api/reservas/reservas/', data, format='json')
        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_listar_reservas(self):
        Reserva.objects.create(
            nombre_cliente='Test User',
            telefono='1234567890',
            fecha=self.fecha_futura,
            hora=self.hora_futura,
            mesa=self.mesa
        )
        response = self.client.get('/api/reservas/reservas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_obtener_reserva_detallada(self):
        reserva = Reserva.objects.create(
            nombre_cliente='Test User',
            telefono='1234567890',
            fecha=self.fecha_futura,
            hora=self.hora_futura,
            mesa=self.mesa
        )
        response = self.client.get(f'/api/reservas/reservas/{reserva.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre_cliente'], 'Test User')
    
    def test_actualizar_reserva(self):
        reserva = Reserva.objects.create(
            nombre_cliente='Test User',
            telefono='1234567890',
            fecha=self.fecha_futura,
            hora=self.hora_futura,
            mesa=self.mesa
        )
        data = {'estado': 'Confirmada'}
        response = self.client.patch(f'/api/reservas/reservas/{reserva.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        reserva.refresh_from_db()
        self.assertEqual(reserva.estado, 'Confirmada')
    
    def test_eliminar_reserva(self):
        reserva = Reserva.objects.create(
            nombre_cliente='Test User',
            telefono='1234567890',
            fecha=self.fecha_futura,
            hora=self.hora_futura,
            mesa=self.mesa
        )
        response = self.client.delete(f'/api/reservas/reservas/{reserva.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Reserva.objects.count(), 0)
    
    def test_validacion_telefono_invalido(self):
        data = {
            'nombre_cliente': 'Juan Pérez',
            'telefono': '123',
            'fecha': self.fecha_futura,
            'hora': self.hora_futura,
            'mesa': self.mesa.id,
            'estado': 'Pendiente'
        }
        response = self.client.post('/api/reservas/reservas/', data, format='json')
        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)
