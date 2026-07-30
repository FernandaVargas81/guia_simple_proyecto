# Guía Simple

Portal de trámites ciudadanos. Frontend en HTML + Tailwind (CDN) + JS vanilla, backend en PHP con MySQL.

## Estructura

```
├── index.html, html/*.html   Páginas (frontend)
├── js/*.js                   Lógica de frontend, consume la API vía fetch()
├── css/styles.css
├── api/*.php                 API PHP (PDO + sesiones de servidor)
└── sql/schema.sql            Esquema de la base de datos + datos semilla
```

## Puesta en marcha con XAMPP

1. **Copia (o enlaza) esta carpeta dentro de `htdocs`** de tu instalación de XAMPP, por ejemplo:
   - macOS: `/Applications/XAMPP/xamppfiles/htdocs/guia_simple_proyecto`
   - o crea un enlace simbólico: `ln -s "$(pwd)" /Applications/XAMPP/xamppfiles/htdocs/guia_simple_proyecto`

2. **Inicia Apache y MySQL** desde el panel de control de XAMPP.

3. **Importa la base de datos**:
   - Abre phpMyAdmin (`http://localhost/phpmyadmin`).
   - Pestaña "Importar" → selecciona `sql/schema.sql` → Ejecutar.
   - Esto crea la base `guia_simple` con las tablas y los trámites/checklists/oficinas ya cargados.

4. **Revisa las credenciales** en `api/config.php`. Por defecto usa el usuario `root` sin contraseña (configuración típica de XAMPP). Si tu MySQL tiene otra contraseña, ajústala ahí.

5. **Abre el sitio** en el navegador: `http://localhost/guia_simple_proyecto/index.html`

No uses `file://` para abrir los HTML directamente: la API PHP necesita ser servida por Apache.

## Qué se conectó a la base de datos

- **Usuarios**: registro/login reales con contraseña con hash (`password_hash`), sesión de servidor (`$_SESSION`), ya no se usa `localStorage` para la cuenta.
- **Trámites**: `explorar.js` los carga desde la tabla `tramites` en vez de un arreglo fijo en JS.
- **Checklists de cada trámite**: los pasos y el progreso por usuario viven en `checklist_items` y `checklist_progreso`. Al completar el 100% de un trámite se registra el logro y se suman "horas ahorradas" reales al usuario.
- **Citas/recordatorios** del panel: se guardan por usuario en la tabla `citas`.
- **Buscador de oficinas** del panel: consulta la tabla `oficinas`.
- **Comunidad**: los consejos publicados se guardan en `comunidad_consejos` y son visibles para todos los visitantes.

## API (resumen)

| Endpoint | Métodos | Descripción |
|---|---|---|
| `api/register.php` | POST | Crea cuenta e inicia sesión |
| `api/login.php` | POST | Inicia sesión |
| `api/logout.php` | POST | Cierra sesión |
| `api/session.php` | GET | Usuario actual + estadísticas |
| `api/tramites.php` | GET | Lista de trámites |
| `api/checklist.php` | GET, POST | Pasos de un trámite y su progreso |
| `api/citas.php` | GET, POST, DELETE | Citas del usuario autenticado |
| `api/comunidad.php` | GET, POST | Consejos de la comunidad |
| `api/oficinas.php` | GET | Búsqueda de oficinas por nombre/dirección |

Todas las respuestas son JSON. Los endpoints que requieren sesión responden `401` si no hay usuario autenticado.
