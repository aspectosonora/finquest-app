# FINQUEST — Login Modo Cooperativo

## Objetivo
Reproducir `referencia_aprobada.png` (863 × 1823) como una pantalla real de selección de jugador, no como una captura estática. No rediseñar ni sustituir el flujo de autenticación existente. Usar los avatares exactos incluidos. No generar cuerpos, brazos ni otras poses.

## Assets

| Archivo en `assets/` | Uso |
|---|---|
| `fondo_login.png` | Fondo geométrico limpio a pantalla completa, sin textos, botones ni personas. |
| `estilo-grafico.svg` | Alternativa vectorial adaptable del fondo, si se necesita. |
| `avatar_cinthya.png`, `avatar_julio.png` | PNG originales con transparencia. |
| `logo_finquest_blanco.png` | Logo para el fondo oscuro, con marca azul y letras blancas. |
| `logo_finquest_original.png`, `icono_finquest_original.png` | Marca original de referencia. |
| `lema.png` | Lema en blanco, transparente. |
| `titulo_quien_juega_hoy.png` | Titular exacto extraído de la referencia, blanco con alfa. |
| `etiqueta_cooperativo.svg`, `texto_modo_cooperativo.png` | Placa naranja y su texto blanco, separados. |
| `placa_cinthya.svg`, `placa_julio.svg` | Bases de botones inclinadas sin texto. |
| `texto_cinthya.png`, `texto_julio.png` | Nombre y flecha blancos con transparencia. |
| `emblema_equipo.svg` | Corazón central de equipo. |

## Composición de referencia
Coordenadas relativas a una superficie de 863 × 1823, expresadas en porcentajes. Mantener tamaño y posición de acuerdo con la captura aprobada. Ajustar proporcionalmente si el viewport difiere.

| Elemento | izquierda | superior | ancho |
|---|---:|---:|---:|
| Logo | 6.7% | 2.0% | 45% |
| Lema | 10.4% | 6.8% | 49% |
| Titular | 5.2% | 11.2% | 92.1% |
| Etiqueta modo cooperativo | 4.3% | 28.2% | 51% |
| 01 (texto decorativo) | 0.5% | 32.7% | 31% |
| 02 (texto decorativo) | 65% | 30.8% | 34% |
| Cinthya (busto visible) | 4% | 39.5% | 50% |
| Julio (busto visible) | 47% | 40.3% | 52% |
| Placa Cinthya | 0% | 68.1% | 53% |
| Placa Julio | 44% | 68.1% | 56% |
| Emblema central | 43% | 69% | 17% |
| Botón de correo | 5.7% | 82% | 88.6% |
| ¿Primera vez? | centrado | 90% | — |
| Crear equipo / Unirme con un código | centrado | 93.7% | 80% |

## Implementación
- Fondo: `background: #08154d url('/assets/login/fondo_login.png') center / 100% 100% no-repeat;` sobre el contenedor de referencia. Mantener las diagonales. En pantallas anchas, centrar la composición y extender el fondo navy; no deformar los avatares.
- Usar `min-height: 100svh` y manejar las zonas seguras con `env(safe-area-inset-top/bottom)`. En móviles bajos permitir scroll vertical sin tapar el footer; jamás añadir navegación inferior al login.
- Los avatares deben utilizar el alfa original y `object-fit: contain`. El encuadre es busto, sin cuerpos. Los PNG tienen margen transparente; ajustar visualmente para que los hombros estén justo detrás de las placas y los rostros dominen la composición. Nunca usar `object-fit: cover` ni recortar la cabeza.
- Los números 01 y 02 son decorativos: texto editable muy grande, condensado, negrita cursiva, blanco con opacidad aproximada de 35%. Deben estar detrás de los avatares, no delante. Usar la fuente deportiva de FinQuest existente, o un equivalente condensado e inclinado.
- Las placas de jugador son botones HTML accesibles reales. Usar su SVG como fondo y el PNG del nombre como contenido (con `alt` apropiado y `aria-label` en el botón). El emblema central es decorativo y no puede bloquear los controles (`pointer-events: none`). No fusionar ambos jugadores en una imagen; cada uno tiene su propio evento de selección.
- El botón de correo tiene borde blanco de 2 px, fondo transparente, radio 14 px y texto blanco. Las acciones inferiores se mantienen funcionales como botones/enlaces de texto blanco. Conservar labels y rutas actuales de la app.
- Al seleccionar jugador, conservar el flujo de PIN/autenticación actual; no omitir ninguna validación ni convertir la tarjeta en una autenticación automática. Animación opcional: `transform: translateY(-4px) scale(1.025)` en el avatar seleccionado, transición de 180 ms; respetar `prefers-reduced-motion`.
- Referencia de color: azul eléctrico #153CFF, naranja #FF591B, navy #08154D, blanco #FFFFFF. Priorizar el fondo incluido antes que aproximar colores o geometrías por CSS.

**Importante:** la referencia es una guía visual, no un fondo de pantalla utilizable: los botones deben seguir siendo navegables, accesibles y funcionales. No modificar las demás pantallas ni la lógica de datos.
