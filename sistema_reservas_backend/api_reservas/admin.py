from django.contrib import admin
from .models import Mesa, Reserva, MenuItem, Orden, OrdenItem


@admin.register(Mesa)
class MesaAdmin(admin.ModelAdmin):
    list_display = ('numero', 'capacidad', 'ubicacion')
    list_filter = ('ubicacion',)
    search_fields = ('numero',)


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('nombre_cliente', 'mesa', 'fecha', 'hora', 'estado', 'creada_en')
    list_filter = ('estado', 'fecha')
    search_fields = ('nombre_cliente', 'telefono')
    readonly_fields = ('creada_en',)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'precio', 'disponible')
    list_filter = ('categoria', 'disponible')
    search_fields = ('nombre',)


@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_cliente', 'tipo', 'mesa', 'estado', 'precio_total', 'creada_en')
    list_filter = ('estado', 'tipo', 'creada_en')
    search_fields = ('nombre_cliente', 'telefono')
    readonly_fields = ('creada_en', 'actualizada_en', 'precio_total')


@admin.register(OrdenItem)
class OrdenItemAdmin(admin.ModelAdmin):
    list_display = ('orden', 'item_menu', 'cantidad', 'precio_unitario', 'subtotal')
    list_filter = ('orden__creada_en',)
    search_fields = ('item_menu__nombre',)
