from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Mesa, HorarioRestaurante, Reserva, MenuItem, Orden, OrdenItem


class MesaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mesa
        fields = ['id', 'numero', 'capacidad', 'ubicacion']


class HorarioRestauranteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioRestaurante
        fields = ['id', 'dia_semana', 'hora_apertura', 'hora_cierre', 'cerrado', 'actualizado_en']
        read_only_fields = ['actualizado_en', 'id']


class ReservaSerializer(serializers.ModelSerializer):
    mesa_numero = serializers.ReadOnlyField(source='mesa.numero')
    mesa_ubicacion = serializers.ReadOnlyField(source='mesa.ubicacion')
    
    class Meta:
        model = Reserva
        fields = ['id', 'nombre_cliente', 'telefono', 'fecha', 'hora', 
                  'mesa', 'mesa_numero', 'mesa_ubicacion', 'estado', 'creada_en']
        read_only_fields = ['creada_en', 'id']
    
    def validate(self, data):
        fecha = data.get('fecha')
        hora = data.get('hora')
        
        if fecha and hora:
            now = timezone.now()
            fecha_hora = timezone.make_aware(
                timezone.datetime.combine(fecha, hora)
            )
            
            if fecha_hora <= now + timedelta(hours=1):
                raise serializers.ValidationError(
                    "La reserva debe ser al menos 1 hora en el futuro."
                )
        
        return data
    
    def validate_telefono(self, value):
        if not value or len(value) < 7:
            raise serializers.ValidationError("Teléfono inválido. Mínimo 7 dígitos.")
        return value


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'nombre', 'categoria', 'descripcion', 'precio', 'disponible', 'imagen']


class OrdenItemSerializer(serializers.ModelSerializer):
    item_menu = MenuItemSerializer(read_only=True)
    item_menu_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrdenItem
        fields = ['id', 'item_menu', 'item_menu_id', 'cantidad', 'precio_unitario', 'subtotal']
        read_only_fields = ['id', 'subtotal']
    
    def get_subtotal(self, obj):
        return obj.subtotal


class OrdenSerializer(serializers.ModelSerializer):
    items = OrdenItemSerializer(many=True, read_only=True)
    mesa_numero = serializers.ReadOnlyField(source='mesa.numero')
    mesa_ubicacion = serializers.ReadOnlyField(source='mesa.ubicacion')
    
    class Meta:
        model = Orden
        fields = ['id', 'nombre_cliente', 'telefono', 'tipo', 'mesa', 'mesa_numero', 
                  'mesa_ubicacion', 'fecha_hora_retiro', 'estado', 'precio_total', 
                  'items', 'creada_en', 'actualizada_en']
        read_only_fields = ['id', 'precio_total', 'creada_en', 'actualizada_en']
    
    def validate_telefono(self, value):
        # Validar que el teléfono tenga al menos 7 caracteres
        if value and len(str(value)) < 7:
            raise serializers.ValidationError("Teléfono inválido. Mínimo 7 dígitos.")
        return value
    
    def validate_nombre_cliente(self, value):
        # El nombre es requerido
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El nombre del cliente es requerido.")
        return value
    
    def validate_tipo(self, value):
        # El tipo debe ser uno de los permitidos
        tipos_validos = ['Para Retirar', 'Comer en Mesa']
        if value not in tipos_validos:
            raise serializers.ValidationError(f"Tipo inválido. Debe ser {' o '.join(tipos_validos)}")
        return value
    
    def validate(self, data):
        tipo = data.get('tipo')
        mesa = data.get('mesa')
        
        # Si es "Comer en Mesa", debe haber mesa seleccionada
        if tipo == 'Comer en Mesa':
            if not mesa:
                raise serializers.ValidationError("Debe seleccionar una mesa para 'Comer en Mesa'")
        
        # Si es "Para Retirar", asegurar que mesa es None
        if tipo == 'Para Retirar':
            data['mesa'] = None
        
        return data
