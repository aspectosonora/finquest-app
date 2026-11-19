# FinQuest — módulo Metas

## Instrucción para Codex

Implementa la pantalla Metas en el proyecto existente de FinQuest, usando `referencias/pantalla_metas.png` como referencia visual aprobada. Adapta la funcionalidad al stack, autenticación, base de datos, rutas y componentes actuales. No rediseñes las pantallas Inicio, Retos, Deudas ni Equipo. No reemplaces el logo ni los avatares. No conviertas la captura en una única imagen de fondo: construye todo el contenido dinámico con componentes reales.

### Estética y recursos

- Mobile-first, scroll vertical y navegación inferior fija con Metas seleccionada, respetando safe area. Reutiliza la navegación existente; `identidad/nav_metas.svg` es la referencia visual, no una imagen que sustituya los enlaces funcionales.
- Fondo blanco grisáceo, azul eléctrico `#1746F5`, naranja `#FF5B24`, negro `#080A12`, gris claro `#D8DAE1`, dorado solamente en logros. Cortes diagonales, tipografía angular ancha en títulos e inclinada condensada en rótulos; reutiliza las fuentes disponibles de FinQuest. Sin exceso de redondeado ni sombras.
- Header existente: logo, lema JUNTOS SUBIMOS DE NIVEL y mes dinámico en español. No fijar DICIEMBRE en el código.
- Usa las ilustraciones PNG incluidas en `ilustraciones/`. Se extrajeron de la referencia aprobada, conservando sus fondos; no inventes otros objetos ni iconos. `identidad/` incluye avatares originales y logo. `referencias/foto_comedor_demo.png` es una fotografía de demostración; la aplicación debe permitir sustituirla por una real del usuario.

### Pantalla principal

1. Título METAS y subtítulo «Nuestro futuro se construye en equipo.» con insignia de bandera a cuadros.
2. Misión principal: foto cargada por la pareja, título, cantidad acumulada, objetivo, porcentaje, barra de avance y plazo restante. Añade opción para cambiar foto y editar objetivo. El ejemplo del comedor es demostrativo, no datos reales iniciales.
3. Plan de ahorro: total mensual, barra 65% azul / 35% naranja, avatares, aportación mensual individual y botón REGISTRAR APORTACIÓN. El reparto por defecto es Julio 65% y Cinthya 35%; debe provenir de configuración compartida y poder ajustarse al editar el plan de una meta, validando que sume 100%.
4. Categorías (grid 2 columnas en móvil): cada tarjeta tiene título, flecha y su ilustración. Al tocarla, abrir formulario para nueva meta preseleccionando la categoría. Mostrar otras metas activas con una lista de avances y permitir elegir una como principal.
5. Logros en equipo: metas completadas; galería con foto, fecha de logro, importe y sus aportaciones. No mostrar logros ficticios en producción.
6. Si no hay metas activas, mostrar un estado inicial aspiracional y CTA CREAR MI PRIMERA META, sin balances ni objetivos ficticios.

### Archivo por categoría

| Categoría | Archivo |
|---|---|
| Hogar y muebles | `ilustraciones/01_hogar.png` |
| Viajes | `ilustraciones/02_viajes.png` |
| Vehículo | `ilustraciones/03_vehiculo.png` |
| Tecnología | `ilustraciones/04_tecnologia.png` |
| Fondo de emergencia | `ilustraciones/05_fondo_emergencia.png` |
| Experiencias | `ilustraciones/06_experiencias.png` |
| Proyectos en común | `ilustraciones/07_proyectos.png` |
| Personalizada | `ilustraciones/08_personalizada.png` |
| Logros en equipo | `ilustraciones/09_logros.png` |

### Crear / editar meta

- Nombre, categoría, foto opcional y monto objetivo MXN positivo. La foto debe poder subirse desde cámara/galería usando el almacenamiento privado/autorizado existente.
- Modo por fecha: seleccionar fecha límite o número de mensualidades; calcular ahorro mensual requerido sobre monto restante.
- Modo por presupuesto: seleccionar total mensual positivo; calcular mensualidades necesarias y fecha estimada.
- Mostrar vista previa del aporte Julio y Cinthya antes de guardar. Permitir establecer una meta como principal.
- El ahorro acumulado proviene de aportaciones reales registradas (o saldo inicial explícito, registrado como tal). No se suma una aportación proyectada al saldo real.

### Cálculos y prueba de referencia

Maneja cantidades en centavos enteros, validando siempre en backend. Define un calendario de aportaciones consistente; el usuario confirma cantidad de mensualidades restantes y fecha objetivo. Redondea los importes requeridos hacia arriba al centavo y asigna a Cinthya la diferencia para mantener total exacto. El último aporte se puede ajustar al restante.

- restante = max(0, objetivo - ahorroAcumulado)
- porcentaje = min(100, ahorroAcumulado / objetivo * 100)
- Por fecha: mensual = ceil(restante / mensualidadesRestantes), si hay saldo pendiente y mensualidadesRestantes > 0. Si venció, mostrar la fecha vencida y solicitar ajuste, no dividir entre cero.
- Por presupuesto: mensualidadesRestantes = ceil(restante / mensual)
- Julio = round(mensual * 0.65), Cinthya = mensual - cuotaJulio (o porcentajes elegidos en el plan).
- Caso de prueba: objetivo $18,000, acumulado $6,000, faltan 4 mensualidades. Restante $12,000, progreso 33.33%, total mensual $3,000, Julio $1,950, Cinthya $1,050. Los datos de prueba no deben convertirse en registros reales por defecto.

### Registrar aportación y persistencia

- Modal con meta, integrante, importe y fecha; mostrar origen del dinero si el sistema ya maneja saldos personales. Validar que el importe sea positivo y confirmar. Permitir importes distintos a los planeados; informar progreso real por integrante.
- Aporte al ahorro es una asignación/transferencia, no una compra. Si reduce el dinero libre, registrar la transferencia una sola vez mediante la lógica existente. Evitar doble descuento, doble conteo de gastos o doble registro por doble clic. Mantener historial por meta e integrante.
- Guarda al menos: identificador meta, familia/equipo autorizado, nombre, categoría, foto, objetivo en centavos, modo, fecha objetivo o presupuesto, porcentajes, estado y timestamps. Cada aportación tiene ID, meta, integrante, monto, fecha y responsable de registro.
- Actualiza avance en ambos perfiles desde la fuente de verdad compartida. Al alcanzar la meta, registrar logro e insignia/XP por única vez conforme al sistema existente, con celebración. Evitar otorgar XP repetidamente al editar o refrescar.
- Acceso solo a los integrantes autorizados del equipo. Edición y borrado de aportes requieren validación y confirmación; re-calcular saldos si cambia el historial. No guardar información financiera sensible en enlaces públicos.

### Entrega y verificación

Prueba creación en ambas modalidades, cálculo 65/35, contribuciones pequeñas y grandes, cambio de foto, edición del plan, historial, una segunda meta, finalización y ausencia de duplicados. Verifica a 360/390/430 px, teclado móvil, accesibilidad y barra inferior fija. Respeta la referencia aprobada y utiliza datos de demostración únicamente con un fixture de desarrollo.
