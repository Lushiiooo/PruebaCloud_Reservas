# 📋 Sistema de Reservas & Órdenes - Documentación Completa

## 🔧 ARREGLOS REALIZADOS

### 1. **OrdenController - Endpoint de Items**
**Archivo:** `frontend_reservas/app/Http/Controllers/OrdenController.php`

```php
// ANTES: POSTeaba items a endpoint incorrecto
foreach ($items as $item) {
    Http::post(self::API_URL . '/ordenes/' . $orden['id'] . '/items/', [...])
}

// DESPUÉS: Usa endpoint correcto agregar_items/ con batch
$itemsRequest = [];
foreach ($items as $item) {
    $itemsRequest[] = [
        'item_menu_id' => $item['id'],
        'cantidad' => $item['cantidad']
    ];
}
$itemsResponse = Http::post(
    self::API_URL . '/ordenes/' . $orden['id'] . '/agregar_items/',
    ['items' => $itemsRequest]
);
```

### 2. **AdminController - Puerto API**
**Archivo:** `frontend_reservas/app/Http/Controllers/AdminController.php`

```php
// ANTES
private const API_URL = 'http://127.0.0.1:8000/api/reservas';

// DESPUÉS (Django está en puerto 8001)
private const API_URL = 'http://127.0.0.1:8001/api/reservas';
```

### 3. **Admin Ordenes View - Campo Descripción**
**Archivo:** `frontend_reservas/resources/views/admin/ordenes.blade.php`

```blade
<!-- ANTES -->
<th>Descripción</th>
<td><small>{{ substr($orden['descripcion'], 0, 50) }}...</small></td>

<!-- DESPUÉS -->
<th>Total</th>
<th>Items</th>
<td><strong>${{ number_format($orden['precio_total'], 2) }}</strong></td>
<td><span class="badge bg-secondary">{{ count($orden['items'] ?? []) }} items</span></td>
```

### 4. **Django - Instalar Pillow**
```bash
pip install Pillow
```

---

## 🏗️ CÓMO FUNCIONA EL SISTEMA

### **Arquitectura**
```
┌─────────────────────────────────────────┐
│   Browser (Cliente)                     │
│   http://127.0.0.1:8000                │
├─────────────────────────────────────────┤
│   Laravel Frontend (Puerto 8000)        │
│   - Vistas Blade                        │
│   - Carrito de compras (JavaScript)     │
│   - Autenticación                       │
│   - Consumidor de API                   │
├─────────────────────────────────────────┤
│   HTTP Requests                         │
├─────────────────────────────────────────┤
│   Django REST API (Puerto 8001)         │
│   - /api/reservas/mesas/                │
│   - /api/reservas/reservas/             │
│   - /api/reservas/ordenes/              │
│   - /api/reservas/menu/                 │
├─────────────────────────────────────────┤
│   SQLite3 Database                      │
│   - Mesas, Reservas, Órdenes,          │
│   - MenuItems, OrdenItems               │
└─────────────────────────────────────────┘
```

### **Flujo de Órdenes (Completo)**
```
1. Usuario accede http://127.0.0.1:8000/ordenes/create
2. Laravel obtiene:
   - Lista de mesas (GET /api/reservas/mesas/)
   - Menú items (GET /api/reservas/menu/)
3. Usuario selecciona items con +/- botones
4. Carrito JavaScript actualiza en tiempo real
5. Usuario completa formulario (nombre, teléfono, tipo)
6. POST a /ordenes (Laravel):
   a. Django crea Orden (retorna ID)
   b. Laravel POSTs items a /ordenes/{id}/agregar_items/
   c. Django crea OrdenItems y calcula precio_total
7. Laravel redirige a /ordenes/{id}
8. Vista muestra orden con items y total
```

---

## 👤 ACCIONES DE USUARIOS NO-ADMIN

### **1. Ver Página de Inicio**
- **URL:** `http://127.0.0.1:8000/`
- **Acciones:**
  - Ver información del restaurante "ElSabor"
  - Acceder a "Reserva tu Mesa" → `/reservas/create`
  - Acceder a "Hacer Orden" → `/ordenes/create`

### **2. Hacer Reserva**
- **URL:** `http://127.0.0.1:8000/reservas/create`
- **Acciones:**
  - Seleccionar mesa
  - Elegir fecha y hora
  - Ingresar nombre y teléfono
  - Crear reserva
- **API:** `POST /api/reservas/reservas/`

### **3. Ver Reservas Personales**
- **URL:** `http://127.0.0.1:8000/reservas`
- **Acciones:**
  - Ver todas las reservas hechas
  - Ver detalles de cada reserva

### **4. Hacer Orden (Comprar Comida)**
- **URL:** `http://127.0.0.1:8000/ordenes/create`
- **Proceso:**
  1. Cargar menú (10 items): Hamburguesas, Pizzas, Hot Dogs, Bebidas, Postres
  2. **Seleccionar items:**
     - Ver todas las categorías en tabs
     - Botones +/- para cantidad
     - Cards con precio y descripción
  3. **Carrito lateral (sticky):**
     - Muestra items seleccionados
     - Cantidad de cada item
     - Total en tiempo real
  4. **Completar orden:**
     - Nombre y teléfono
     - Tipo: "Para Retirar" O "Comer en Mesa"
     - Si Mesa: seleccionar mesa disponible
     - Si Retirar: elegir fecha/hora retiro
  5. Confirmar y crear orden
- **API Calls:**
  - `GET /api/reservas/menu/` - obtener items
  - `GET /api/reservas/mesas/` - obtener mesas disponibles
  - `POST /api/reservas/ordenes/` - crear orden
  - `POST /api/reservas/ordenes/{id}/agregar_items/` - agregar items

### **5. Ver Detalles de Orden**
- **URL:** `http://127.0.0.1:8000/ordenes/{id}`
- **Información mostrada:**
  - ID de orden
  - Nombre y teléfono del cliente
  - Tipo (Para Retirar / Comer en Mesa)
  - Mesa (si aplica) con ubicación
  - Estado: Pendiente, Preparando, Lista, Entregada
  - **Tabla de items:**
    - Producto
    - Cantidad
    - Precio unitario
    - Subtotal
  - **Total a pagar**

---

## 🔐 ACCIONES DE ADMIN

### **Requisitos:**
- Tener sesión iniciada (login)
- URL base: `http://127.0.0.1:8000/admin/`

### **1. Dashboard Admin**
- **URL:** `http://127.0.0.1:8000/admin/dashboard`
- **Información:**
  - Total de mesas
  - Mesas ocupadas
  - Mesas disponibles
  - Reservas hoy
  - Cards de estadísticas
  - Tabla de mesas con estado
  - Tabla de reservas

### **2. Gestión de Mesas**
- **URL:** `http://127.0.0.1:8000/admin/mesas`
- **Acciones:**
  - Ver todas las mesas
  - Crear nueva mesa:
    - Número (único)
    - Capacidad
    - Ubicación (Interior / Terraza)
  - Editar mesas
  - Eliminar mesas
- **API:**
  - `GET /api/reservas/mesas/`
  - `POST /api/reservas/mesas/`
  - `PUT /api/reservas/mesas/{id}/`
  - `DELETE /api/reservas/mesas/{id}/`

### **3. Gestión de Reservas**
- **URL:** `http://127.0.0.1:8000/admin/reservas`
- **Acciones:**
  - Ver todas las reservas (no solo públicas)
  - Ver detalles: cliente, mesa, fecha, hora, estado
  - Editar reservas
  - Cambiar estado
  - Eliminar reservas
- **API:**
  - `GET /api/reservas/reservas/`
  - `PUT /api/reservas/reservas/{id}/`
  - `DELETE /api/reservas/reservas/{id}/`

### **4. Gestión de Órdenes (Principal)**
- **URL:** `http://127.0.0.1:8000/admin/ordenes`
- **Información de cada orden:**
  - ID de orden
  - Cliente (nombre + teléfono clickeable)
  - Tipo: "Para Retirar" / "Mesa X"
  - **Total:** monto total calculado automáticamente
  - **Items:** cantidad de items en la orden
  - Estado actual: Pendiente, Preparando, Lista, Entregada
  - Botón de actualización de estado
  - Botón "Ver detalles" (acceso a `/ordenes/{id}`)

### **5. Cambiar Estado de Orden**
- **Acciones en admin/ordenes:**
  - Seleccionar nuevo estado del dropdown
  - Se guarda automáticamente (POST a API)
  - Estados disponibles:
    - ⏳ **Pendiente** - orden recibida, esperando preparación
    - 👨‍🍳 **Preparando** - comida en preparación
    - ✅ **Lista** - comida lista para retirar/servir
    - 🚚 **Entregada** - cliente ya retiró o se le sirvió
- **API:** `PUT /api/reservas/ordenes/{id}/cambiar_estado/`

---

## 📊 DATOS DEL SISTEMA

### **Menú (10 Items)**
```
HAMBURGUESAS:
- Hamburguesa Clásica: $8.99
- Hamburguesa Doble: $10.99

PIZZAS:
- Pizza Margherita: $12.99
- Pizza Pepperoni: $13.99

HOT DOGS:
- Hot Dog Clásico: $5.99
- Hot Dog Especial: $7.99

BEBIDAS:
- Refresco Pequeño: $2.99
- Refresco Grande: $3.99

POSTRES:
- Pastel de Chocolate: $4.99
- Flan: $3.99
```

### **Mesas (3 por defecto)**
```
Mesa 1 - 4 personas - Interior
Mesa 2 - 2 personas - Terraza
Mesa 3 - 6 personas - Interior
```

---

## 🔄 FLUJOS PRINCIPALES

### **Flujo de Reserva:**
```
No-Admin → Click "Reserva tu Mesa" 
→ Select mesa, fecha, hora, datos
→ POST /api/reservas/reservas/
→ Ver confirmación
```

### **Flujo de Orden:**
```
No-Admin → Click "Hacer Orden"
→ Cargar menú (GET /api/reservas/menu/)
→ Seleccionar items con +/-
→ Carrito actualiza en tiempo real
→ Click "Confirmar Orden"
→ Modal con datos cliente
→ POST /ordenes (crear orden sin items)
→ POST /ordenes/{id}/agregar_items/ (agregar items)
→ Redirect a /ordenes/{id} (ver detalle)
```

### **Flujo Admin - Gestionar Órdenes:**
```
Admin Login → /admin/dashboard
→ Click "Gestión de Órdenes"
→ Ver tabla con todas las órdenes
→ Ver: ID, Cliente, Tipo, Total, Items
→ Cambiar estado con dropdown
→ API actualiza estado
→ Click "Ver detalles" → ver items completos
```

---

## ⚙️ CONFIGURACIÓN

### **Puertos:**
- **Frontend:** `http://127.0.0.1:8000` (Laravel)
- **Backend:** `http://127.0.0.1:8001` (Django)

### **Base de Datos:**
- SQLite3: `sistema_reservas_backend/db.sqlite3`

### **Modelos Django:**
- `Mesa`: número, capacidad, ubicacion
- `Reserva`: nombre_cliente, telefono, fecha, hora, mesa, estado
- `MenuItem`: nombre, categoria, descripcion, precio, disponible, imagen
- `Orden`: nombre_cliente, telefono, tipo, mesa, estado, precio_total, fecha_hora_retiro
- `OrdenItem`: orden, item_menu, cantidad, precio_unitario, subtotal (auto-calculado)

### **Stack Tecnológico:**

**Backend:**
- Django 6.0.4
- Django REST Framework 3.14.0
- django-cors-headers 4.3.1
- Pillow (para imágenes)
- Python 3.14

**Frontend:**
- Laravel 12.56.0
- PHP 8.2.12
- Bootstrap 5.3.0 (CDN)
- Bootstrap Icons (CDN)
- JavaScript (Carrito)

**Base de Datos:**
- SQLite3

---

## 📞 Endpoints de API Principales

### **Menú**
- `GET /api/reservas/menu/` - Listar todos los items
- `GET /api/reservas/menu/por_categoria/` - Filtrar por categoría

### **Mesas**
- `GET /api/reservas/mesas/` - Listar mesas
- `POST /api/reservas/mesas/` - Crear mesa
- `GET /api/reservas/mesas/{id}/` - Ver mesa
- `PUT /api/reservas/mesas/{id}/` - Actualizar mesa
- `DELETE /api/reservas/mesas/{id}/` - Eliminar mesa

### **Reservas**
- `GET /api/reservas/reservas/` - Listar reservas
- `POST /api/reservas/reservas/` - Crear reserva
- `GET /api/reservas/reservas/{id}/` - Ver reserva
- `PUT /api/reservas/reservas/{id}/` - Actualizar reserva
- `DELETE /api/reservas/reservas/{id}/` - Eliminar reserva

### **Órdenes**
- `GET /api/reservas/ordenes/` - Listar órdenes (con items anidados)
- `POST /api/reservas/ordenes/` - Crear orden
- `GET /api/reservas/ordenes/{id}/` - Ver orden con items
- `PUT /api/reservas/ordenes/{id}/cambiar_estado/` - Cambiar estado
- `POST /api/reservas/ordenes/{id}/agregar_items/` - Agregar items a orden

---

## 🔐 Seguridad

### **Autenticación:**
- Session-based (Cookie sessions)
- Login/Register/Logout
- Middleware protege rutas admin

### **Validación:**
- Validación de teléfono (regex)
- Validación de tipos de orden
- Validación de mesas disponibles
- Validación de items en órdenes

### **CORS:**
- Django CORS configurado para aceptar requests de Laravel
- URLs autorizadas: localhost:8000

---

## 📈 Cálculo Automático de Precios

El sistema calcula automáticamente los precios usando el modelo `OrdenItem`:

```python
# En OrdenItem.save():
1. Calcula subtotal = cantidad × precio_unitario
2. Suma todos los subtotals de la orden
3. Actualiza orden.precio_total
4. Guarda cambios en BD
```

**Ventajas:**
- El cliente NO puede modificar precios
- Totales siempre correctos
- Transaccional y seguro

---

Documento generado el 13 de Abril de 2026
