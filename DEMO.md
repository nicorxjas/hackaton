# DEMO TREXO — Runbook del juez (3 minutos)

SPA sin login, español rioplatense, modo negro con acento lime `#A9FC67`. Datos de demostración precargados; el estado se guarda en `localStorage` (`trexo-demo-v1`).

## 1. Levantar la demo

```bash
cd /workspaces/w2-docs
python3 -m http.server 8099 -d dist
```

Abrir <http://localhost:8099>.

Para reiniciar con datos originales: DevTools → Application → Local Storage → borrar `trexo-demo-v1` → recargar.

## 2. Los tres perfiles

El selector está **arriba a la derecha**, en la barra superior (botón con el perfil actual). Al hacer clic se abre "Cambiar perfil". Cada perfil tiene su propio menú lateral. No hay autenticación.

| Perfil | Nombre | Menú lateral |
|---|---|---|
| Productor | Andrés Molina | Mi flota · Técnicos · Solicitudes · Seguros · Mensajes |
| Técnico | Mateo Ríos | Trabajos disponibles · Mis trabajos · Catálogo de repuestos · Mis pedidos · Mensajes |
| Concesionaria | AgroNorte | Panel general · Técnicos oficiales · Stock de repuestos · Pedidos de repuestos · Stock reservado |

## 3. Qué probar en cada perfil

### Productor (Andrés Molina)

1. **Mi flota**: 3 máquinas propias; cada tarjeta trae badge "Asegurada" / "Sin seguro" y botón "Vista 3D".
2. **Seguros**: tabla "Mis pólizas"; buscar `TX-8022` → badge **Vencido** (ver flujo 4.1).
3. **Mensajes**: conversación `TR-1038` con Mateo Ríos (ver flujo 4.3).
4. **Técnicos**: marketplace con 3 perfiles y valoraciones.
5. **Solicitudes**: `TR-1042` (Pendiente) y `TR-1038` (Aceptado); el detalle muestra el bloque "Diagnóstico IA".

### Técnico (Mateo Ríos)

1. **Trabajos disponibles**: `TR-1042` pendiente; "Revisar pedido" abre detalle con foto, diagnóstico y botón "Aceptar trabajo".
2. **Mis trabajos**: `TR-1038` aceptado, con botón "Abrir chat".
3. **Mensajes**: misma conversación `TR-1038`, del lado del técnico (ver flujo 4.3).
4. **Mis pedidos**: `RP-301` Pendiente, `RP-302` Denegado, `RP-303` Aprobado.
5. **Catálogo de repuestos**: buscar una pieza y verificar stock en vivo ("N en stock" / "Sin stock").

### Concesionaria (AgroNorte)

1. **Panel general**: estadísticas, gráfico de máquinas por campo y contador "Pedidos por revisar".
2. **Pedidos de repuestos**: `RP-302` **Denegado**, `RP-303` **Aprobado** (ver flujo 4.2).
3. **Stock de repuestos**: disponibilidad del catálogo AgroNorte.
4. **Stock reservado**: unidades comprometidas por pólizas vigentes.
5. **Técnicos oficiales**: Mateo Ríos y Lucía Ferrer certificados.

## 4. Flows obligatorios

### 4.1 Póliza vencida (Seguros)

1. Selector de perfil → **Productor**.
2. Menú lateral → **Seguros**.
3. En "Mis pólizas", fila `TX-8022` (John Deere 8R 340, La Esperanza): Estado = badge **Vencido**.
4. Contraste: `TX-8021` (John Deere S780) aparece **Vigente** en verde.

### 4.2 Pedidos de repuestos (Concesionario)

1. Selector de perfil → **Concesionaria**.
2. Menú lateral → **Pedidos de repuestos**.
3. Fila `RP-302` (rodamiento, ×2, trabajo TR-1041): badge **Denegado** en rojo.
4. Fila `RP-303` (cadena, ×2, trabajo TR-1042): badge **Aprobado** en verde.
5. Fila `RP-301` (cuchilla): badge **Pendiente** con botones "Aprobar" / "Denegar" activos.

### 4.3 Chat TR-1038 (Mensajes)

1. Selector de perfil → **Productor** → menú lateral → **Mensajes**.
2. Abrir la conversación con **Mateo Ríos · John Deere S780**: 4 mensajes (09:15 a 11:20) coordinando la visita a La Esperanza.
3. Selector de perfil → **Técnico** → **Mensajes**: la misma conversación, con **Andrés Molina** como contraparte.
4. Enviar un mensaje desde cualquiera de los dos lados (queda en el chat).

`TR-1038` es el único trabajo aceptado: en Mensajes solo aparecen trabajos aceptados.
