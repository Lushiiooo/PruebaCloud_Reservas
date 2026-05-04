from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from .models import Mesa, HorarioRestaurante, Reserva, MenuItem, Orden, OrdenItem
from .serializers import MesaSerializer, HorarioRestauranteSerializer, ReservaSerializer, MenuItemSerializer, OrdenSerializer, OrdenItemSerializer
from .tasks import procesar_reserva

MENU_CACHE_KEY = 'menu:list:all'
MENU_STAFF_CACHE_KEY = 'menu:list:staff'
MENU_CACHE_TTL = 300  # 5 minutes


class MesaViewSet(viewsets.ModelViewSet):
    queryset = Mesa.objects.all()
    serializer_class = MesaSerializer
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        fecha = request.query_params.get('fecha')
        hora = request.query_params.get('hora')
        
        if not fecha or not hora:
            return Response(
                {'error': 'Parámetros fecha y hora requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            mesas_con_reservas = Reserva.objects.filter(
                fecha=fecha, 
                hora=hora,
                estado__in=['Pendiente', 'Confirmada']
            ).values_list('mesa_id', flat=True)
            
            mesas_disponibles = Mesa.objects.exclude(id__in=mesas_con_reservas)
            serializer = MesaSerializer(mesas_disponibles, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class HorarioRestauranteViewSet(viewsets.ModelViewSet):
    queryset = HorarioRestaurante.objects.all()
    serializer_class = HorarioRestauranteSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        """Manejar errors en actualización"""
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def partial_update(self, request, *args, **kwargs):
        """Manejar PATCH requests"""
        try:
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def hoy(self, request):
        """Retorna el horario de hoy (de acuerdo al día de la semana)"""
        from datetime import datetime
        dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        dia_hoy = dias[datetime.now().weekday()]
        
        try:
            horario = HorarioRestaurante.objects.get(dia_semana=dia_hoy)
            serializer = HorarioRestauranteSerializer(horario)
            return Response(serializer.data)
        except HorarioRestaurante.DoesNotExist:
            return Response(
                {'error': 'No se encontró horario para hoy'},
                status=status.HTTP_404_NOT_FOUND
            )


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enviar tarea a Celery para procesar la reserva en segundo plano.
        # Se intenta de forma asíncrona; un fallo del broker no afecta la respuesta.
        try:
            reserva_id = response.data.get('id')
            if reserva_id is not None:
                procesar_reserva.delay(reserva_id)
        except Exception:
            pass

        return response
    
    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer

    def _cache_key_for_user(self, is_staff):
        return MENU_STAFF_CACHE_KEY if is_staff else MENU_CACHE_KEY

    def _invalidate_menu_cache(self):
        """Invalida las claves de caché del menú sin borrar toda la caché."""
        keys_to_delete = [MENU_CACHE_KEY, MENU_STAFF_CACHE_KEY]

        # Invalidar caché de por_categoria para todas las categorías conocidas
        categorias = [choice[0] for choice in MenuItem.CATEGORIA_CHOICES] + ['all']
        for categoria in categorias:
            for role in ('public', 'staff'):
                keys_to_delete.append(f'menu:categoria:{categoria}:{role}')

        cache.delete_many(keys_to_delete)

    def get_queryset(self):
        # Admin ve todos los items, usuarios normales solo ven disponibles
        if self.request.user and self.request.user.is_staff:
            return MenuItem.objects.all()
        return MenuItem.objects.filter(disponible=True)
    
    def get_permissions(self):
        """
        POST, PUT, DELETE requieren ser admin
        GET es permitido para todos (filtrado por get_queryset)
        """
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

    def list(self, request, *args, **kwargs):
        is_staff = bool(request.user and request.user.is_staff)
        cache_key = self._cache_key_for_user(is_staff)

        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            cache.set(cache_key, response.data, MENU_CACHE_TTL)
        return response

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        self._invalidate_menu_cache()
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        self._invalidate_menu_cache()
        return response

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        self._invalidate_menu_cache()
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        self._invalidate_menu_cache()
        return response

    @action(detail=False, methods=['get'])
    def por_categoria(self, request):
        categoria = request.query_params.get('categoria')
        is_staff = bool(request.user and request.user.is_staff)

        cache_key = f'menu:categoria:{categoria or "all"}:{"staff" if is_staff else "public"}'
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        # Admin ve todos, usuarios normales solo disponibles
        if is_staff:
            if categoria:
                items = MenuItem.objects.filter(categoria=categoria)
            else:
                items = MenuItem.objects.all()
        else:
            if categoria:
                items = MenuItem.objects.filter(categoria=categoria, disponible=True)
            else:
                items = MenuItem.objects.filter(disponible=True)
        
        serializer = MenuItemSerializer(items, many=True)
        cache.set(cache_key, serializer.data, MENU_CACHE_TTL)
        return Response(serializer.data)

class OrdenViewSet(viewsets.ModelViewSet):
    queryset = Orden.objects.all()
    serializer_class = OrdenSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        try:
            orden = self.get_object()
            nuevo_estado = request.data.get('estado')
            
            if nuevo_estado not in dict(Orden.ESTADO_CHOICES):
                return Response(
                    {'error': f'Estado no válido: {nuevo_estado}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            orden.estado = nuevo_estado
            orden.save()
            serializer = OrdenSerializer(orden)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def agregar_items(self, request, pk=None):
        try:
            orden = self.get_object()
            items_data = request.data.get('items', [])
            
            for item_data in items_data:
                item_menu_id = item_data.get('item_menu_id')
                cantidad = item_data.get('cantidad', 1)
                
                try:
                    item_menu = MenuItem.objects.get(id=item_menu_id)
                except MenuItem.DoesNotExist:
                    return Response(
                        {'error': f'Ítem de menú no encontrado: {item_menu_id}'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                _, _ = OrdenItem.objects.update_or_create(
                    orden=orden,
                    item_menu=item_menu,
                    defaults={
                        'cantidad': cantidad,
                        'precio_unitario': item_menu.precio
                    }
                )
            
            orden.calcular_total()
            serializer = OrdenSerializer(orden)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# ========== AUTENTICACIÓN ==========

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    """Login endpoint - autentica usuario y devuelve token"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Usuario y contraseña requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        login(request, user)
        
        # Obtener o crear token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f'Error en login: {str(e)}')
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['GET', 'POST'])
def logout_view(request):
    """Logout endpoint - cierra sesión"""
    try:
        logout(request)
        return Response({'success': True, 'message': 'Sesión cerrada'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['GET'])
def me_view(request):
    """Get current user endpoint - retorna el usuario autenticado"""
    try:
        print(f'Verificando autenticación - user: {request.user}, authenticated: {request.user.is_authenticated}')
        
        # Si no está autenticado, retornar error
        if not request.user or not request.user.is_authenticated:
            return Response(
                {'error': 'No autenticado', 'authenticated': False},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Obtener token del usuario
        try:
            token = Token.objects.get(user=request.user)
            token_key = token.key
        except Token.DoesNotExist:
            token_key = None
        
        # Retornar información del usuario autenticado
        return Response({
            'token': token_key,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser
            }
        })
    except Exception as e:
        print(f'Error en me_view: {str(e)}')
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
