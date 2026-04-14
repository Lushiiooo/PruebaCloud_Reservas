from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta


class Mesa(models.Model):
    UBICACION_CHOICES = [
        ('Interior', 'Interior'),
        ('Terraza', 'Terraza'),
    ]
    
    numero = models.IntegerField(unique=True)
    capacidad = models.IntegerField()
    ubicacion = models.CharField(max_length=10, choices=UBICACION_CHOICES)
    
    class Meta:
        ordering = ['numero']
    
    def __str__(self):
        return f'Mesa {self.numero} - {self.capacidad} personas'


class HorarioRestaurante(models.Model):
    DIA_CHOICES = [
        ('Lunes', 'Lunes'),
        ('Martes', 'Martes'),
        ('Miércoles', 'Miércoles'),
        ('Jueves', 'Jueves'),
        ('Viernes', 'Viernes'),
        ('Sábado', 'Sábado'),
        ('Domingo', 'Domingo'),
    ]
    
    dia_semana = models.CharField(max_length=10, choices=DIA_CHOICES, unique=True)
    hora_apertura = models.TimeField()
    hora_cierre = models.TimeField()
    cerrado = models.BooleanField(default=False)
    actualizado_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['id']  # Orden: L-D por orden de creación
        verbose_name_plural = 'Horarios del Restaurante'
    
    def __str__(self):
        if self.cerrado:
            return f'{self.dia_semana} - CERRADO'
        return f'{self.dia_semana}: {self.hora_apertura.strftime("%H:%M")} - {self.hora_cierre.strftime("%H:%M")}'


class Reserva(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Confirmada', 'Confirmada'),
        ('Cancelada', 'Cancelada'),
    ]
    
    nombre_cliente = models.CharField(max_length=100)
    telefono = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\d{7,}$', 'Teléfono inválido')]
    )
    fecha = models.DateField()
    hora = models.TimeField()
    mesa = models.ForeignKey(Mesa, on_delete=models.CASCADE, related_name='reservas')
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='Pendiente')
    creada_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha', '-hora']
        unique_together = ('mesa', 'fecha', 'hora')
    
    def __str__(self):
        return f'{self.nombre_cliente} - Mesa {self.mesa.numero} - {self.fecha} {self.hora}'
    
    def is_valid_date(self):
        now = timezone.now()
        fecha_hora = timezone.make_aware(
            timezone.datetime.combine(self.fecha, self.hora)
        )
        return fecha_hora > now + timedelta(hours=1)


class MenuItem(models.Model):
    CATEGORIA_CHOICES = [
        ('Hamburguesas', 'Hamburguesas'),
        ('Pizzas', 'Pizzas'),
        ('Hot Dogs', 'Hot Dogs'),
        ('Bebidas', 'Bebidas'),
        ('Postres', 'Postres'),
    ]
    
    nombre = models.CharField(max_length=100)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    disponible = models.BooleanField(default=True)
    imagen = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['categoria', 'nombre']
    
    def __str__(self):
        return f'{self.nombre} (${self.precio})'


class Orden(models.Model):
    TIPO_CHOICES = [
        ('Para Retirar', 'Para Retirar'),
        ('Comer en Mesa', 'Comer en Mesa'),
    ]
    
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Preparando', 'Preparando'),
        ('Lista', 'Lista'),
        ('Entregada', 'Entregada'),
    ]
    
    nombre_cliente = models.CharField(max_length=100)
    telefono = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\d{7,}$', 'Teléfono inválido')]
    )
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    mesa = models.ForeignKey(Mesa, on_delete=models.SET_NULL, null=True, blank=True, related_name='ordenes')
    fecha_hora_retiro = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='Pendiente')
    precio_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    creada_en = models.DateTimeField(auto_now_add=True)
    actualizada_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-creada_en']
    
    def __str__(self):
        return f'Orden #{self.id} - {self.nombre_cliente}'
    
    def calcular_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.precio_total = total
        self.save()
        return total


class OrdenItem(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='items')
    item_menu = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=8, decimal_places=2)
    
    class Meta:
        unique_together = ('orden', 'item_menu')
    
    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario
    
    def __str__(self):
        return f'{self.item_menu.nombre} x{self.cantidad}'
