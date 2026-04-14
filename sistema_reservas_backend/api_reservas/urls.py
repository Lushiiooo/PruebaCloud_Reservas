from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MesaViewSet, HorarioRestauranteViewSet, ReservaViewSet, MenuItemViewSet, OrdenViewSet, login_view, logout_view, me_view

router = DefaultRouter()
router.register(r'mesas', MesaViewSet, basename='mesa')
router.register(r'horarios', HorarioRestauranteViewSet, basename='horario')
router.register(r'reservas', ReservaViewSet, basename='reserva')
router.register(r'menu', MenuItemViewSet, basename='menu')
router.register(r'ordenes', OrdenViewSet, basename='orden')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', me_view, name='me'),
]
