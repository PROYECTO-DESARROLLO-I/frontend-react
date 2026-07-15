# Documentacion Frontend - SaludAgendaX

**Modulo:** Frontend  
**Tecnologia:** React + Vite  
**Fecha:** Junio 2026  
**Area:** Interfaz de usuario, autenticacion visual, panel administrativo y formularios

---

## Resumen general

El frontend de SaludAgendaX esta construido con React y Vite. La aplicacion inicia en `App.jsx`, carga el componente `Inicio` y desde ahi controla si el usuario ve el login o el formulario de crear cuenta.

Durante el trabajo realizado se ajustaron principalmente estas partes:

- Login conectado parcialmente con el backend.
- Registro de cuenta de paciente conectado al endpoint de registro.
- Navegacion hacia vista de paciente o administrador segun el rol recibido.
- Panel administrativo con sidebar, dashboard y vistas internas.
- Formularios administrativos para registro de personal, creacion de sedes y agendamiento desde admin.
- Ajustes visuales del panel administrativo.
- Ajustes de scroll para que las zonas laterales queden fijas y solo se mueva el contenido principal.

---

## Estructura principal del frontend

| Archivo | Funcion |
|---|---|
| `src/App.jsx` | Punto de entrada visual de la aplicacion. Renderiza `Inicio`. |
| `src/inicio.jsx` | Controla si se muestra login o crear cuenta. |
| `src/forms.jsx` | Contiene el login del usuario y decide la vista segun el rol. |
| `src/CrearCuenta.jsx` | Formulario de registro publico de pacientes. |
| `src/Card.jsx` | Panel visual izquierdo usado en login y crear cuenta. |
| `src/Admin.jsx` | Controla las vistas internas del panel administrativo. |
| `src/AdminLayout.jsx` | Estructura general del admin: sidebar + contenido. |
| `src/AdminSidebar.jsx` | Menu lateral del administrador. |
| `src/AdminDashboard.jsx` | Vista inicial del panel administrativo. |
| `src/RegistroPersonal.jsx` | Formulario de registro de personal interno. |
| `src/RegistroSedes.jsx` | Formulario visual para crear sedes. |
| `src/citasAdmin.jsx` | Formulario visual para agendar cita desde admin. |
| `src/PerfilPaciente.jsx` | Vista de perfil del paciente. Actualmente usa datos simulados. |
| `src/App.css` | Estilos generales de login, crear cuenta, perfil y panel administrativo. |

---

## Flujo de navegacion

La aplicacion no usa React Router. La navegacion se maneja con estados (`useState`).

### Inicio

`src/inicio.jsx` maneja una variable llamada `vista`:

- `login`: muestra el componente `Usuario`.
- `crearCuenta`: muestra el componente `CrearCuenta`.

### Login

`src/forms.jsx` maneja una variable llamada `vistaActual`:

- `login`: muestra el formulario de inicio de sesion.
- `recuperar`: muestra la vista de recuperar contrasena.
- `admin`: muestra el panel administrativo.
- `paciente`: muestra el perfil del paciente.

### Admin

`src/Admin.jsx` maneja una variable llamada `vistaAdmin`:

- `panel`: dashboard principal.
- `registroPersonal`: formulario de personal interno.
- `crearSede`: formulario de sedes.
- `agendarCita`: formulario de citas desde admin.

---

## Login conectado al backend

El login esta conectado al endpoint:

```text
POST http://localhost:8000/api/auth/auth/login/
```

El formulario envia:

```json
{
  "email": "usuario@correo.com",
  "password": "contrasena"
}
```

Si el backend responde correctamente, el frontend guarda en `localStorage`:

```text
accessToken
refreshToken
user
```

Despues revisa el rol del usuario:

- Si el rol es `administrativo`, `superadmin` o `admin`, abre el panel administrativo.
- Si el rol es `paciente`, abre la vista del paciente.
- Si llega otro rol, muestra el mensaje: `Tu rol no tiene una vista asignada en el front.`

### Importante

El login depende de que el backend este corriendo en:

```text
http://localhost:8000
```

Y el frontend en:

```text
http://localhost:5173
```

---

## Cierre de sesion

El boton `Cerrar sesion` del panel administrativo llama a la funcion `limpiarLogin`.

Esa funcion:

- Borra `accessToken`.
- Borra `refreshToken`.
- Borra `user`.
- Regresa la vista al login.
- Limpia los campos del formulario.
- Limpia errores visuales.

Actualmente el cierre de sesion es principalmente del lado del frontend. No se esta llamando todavia al endpoint:

```text
POST /api/auth/auth/logout/
```

Para un cierre de sesion mas completo, se deberia consumir ese endpoint enviando el refresh token.

---

## Registro de cuenta de paciente

El formulario `src/CrearCuenta.jsx` esta conectado al endpoint:

```text
POST http://localhost:8000/api/auth/register/
```

El frontend envia estos campos:

```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan@test.com",
  "password": "ClaveSegura123",
  "document_type": "CC",
  "identity_document": "123456789",
  "date_birth": "2000-01-01",
  "phone_number": "3154876520",
  "address": "Calle 1 #2-3",
  "eps": 1
}
```

### Validaciones del frontend

Antes de enviar al backend, el formulario valida:

- Que todos los campos esten llenos.
- Que el correo tenga formato valido.
- Que la contrasena no sea igual al correo.
- Que la contrasena tenga minimo 8 caracteres.
- Que el telefono solo acepte numeros.

### Punto pendiente detectado

El formulario tiene opciones de EPS quemadas en el codigo:

```text
1 - Sura
2 - Compensar
3 - Famisanar
4 - Medisalud
```

Si en la base de datos no existen EPS con esos ids, el backend responde error. En una revision anterior se encontro que la tabla de EPS estaba vacia, por eso el registro podia fallar aunque el formulario estuviera bien.

Para solucionarlo hay dos caminos:

1. Crear registros reales de EPS en la base de datos.
2. Crear un endpoint para listar EPS y cargar el select dinamicamente desde el backend.

---

## Panel administrativo

El panel administrativo esta dividido en:

- `Admin.jsx`: controla que vista se muestra.
- `AdminLayout.jsx`: estructura principal del panel.
- `AdminSidebar.jsx`: menu lateral.
- `AdminDashboard.jsx`: tarjetas resumen.

### Vistas disponibles

| Vista | Estado |
|---|---|
| Panel | Funcional en frontend. Muestra tarjetas informativas. |
| Registro de personal | Funcional visualmente. No guarda en backend todavia. |
| Crear sede | Funcional visualmente. No guarda en backend todavia. |
| Agendar Cita Paciente | Funcional visualmente. No guarda en backend todavia. |
| Cerrar sesion | Regresa al login y limpia `localStorage`. |

---

## Registro de personal interno

Archivo:

```text
src/RegistroPersonal.jsx
```

Este formulario permite seleccionar un rol:

- Medico / Especialista.
- Personal Administrativo.

Cuando se selecciona `medico`, aparecen campos adicionales:

- Especialidad.
- Numero de tarjeta profesional.

Cuando se selecciona `administrativo`, aparece:

- Area administrativa.

### Estado actual

El formulario valida campos y muestra una notificacion visual de exito, pero todavia no esta conectado al backend.

En el codigo existe un comentario TODO:

```text
Consumir endpoint de creacion de usuarios internos
```

### Punto pendiente

En las APIs revisadas no se encontro un endpoint claro para crear personal interno desde el frontend. Por eso esta pantalla sigue como interfaz visual pendiente de integracion.

---

## Crear sede

Archivo:

```text
src/RegistroSedes.jsx
```

Campos actuales:

- Nombre de la sede.
- Direccion.
- Telefono.

### Estado actual

El formulario valida que los datos no esten vacios, muestra un modal de "Sede creada" y limpia los campos.

### Punto pendiente

No se encontro una API activa para guardar sedes. En el backend existe la app `headquarters`, pero no se encontro una ruta expuesta para crear sedes desde el frontend.

Por eso esta pantalla es funcional a nivel visual, pero no persiste datos en la base de datos.

---

## Agendamiento desde administrador

Archivo:

```text
src/citasAdmin.jsx
```

Campos actuales:

- Nombre del paciente.
- Documento.
- Correo electronico.
- Medico.
- Especialidad.
- Sede.
- Fecha.
- Hora.

### Estado actual

El formulario existe y valida campos basicos, pero no envia datos al backend todavia.

El backend si tiene endpoints de agendamiento para paciente, documentados en el archivo:

```text
saludAgendaX/CAMBIOS_AGENDAMIENTO.md
```

Sin embargo, el formulario de admin todavia no esta integrado con esos endpoints.

---

## Perfil de paciente

Archivo:

```text
src/PerfilPaciente.jsx
```

La vista muestra datos simulados del paciente y permite activar un modo de edicion.

### Estado actual

El perfil no carga todavia la informacion real desde el backend ni guarda cambios en base de datos. Es una vista funcional visualmente, pero trabaja con estado local.

Para conectarlo, se podria usar:

```text
GET /api/auth/auth/me/
```

Y luego crear o usar un endpoint para actualizar datos del paciente.

---

## Estilos y layout

Los estilos estan centralizados principalmente en:

```text
src/App.css
```

### Login y crear cuenta

El layout usa:

- `.container`
- `.comp`
- `.izq`
- `.der`
- `.forms`
- `.campos`

La parte izquierda (`.izq`) contiene el componente visual `Card`. La parte derecha (`.der`) contiene el formulario.

Se ajusto el comportamiento para que, cuando el formulario sea largo, solo haga scroll la parte derecha y no se mueva la parte izquierda.

### Admin

El layout administrativo usa:

- `.admin-container`
- `.admin-layout`
- `.admin-sidebar`
- `.admin-main`
- `.admin-topbar`
- `.admin-content`
- `.admin-form-page`
- `.admin-form-card`
- `.admin-form-grid`

Se ajusto para que el sidebar quede fijo visualmente y el scroll ocurra en el contenido principal.

---

## APIs encontradas en el backend

El backend principal registra estas rutas en `config/urls.py`:

```text
/admin/
/api/auth/
/api/specialties/
/api/doctors/
/api/availability/
/api/appointments/
```

### Autenticacion y usuario

Desde `user/urls.py`:

```text
POST /api/auth/auth/login/
POST /api/auth/auth/logout/
GET  /api/auth/auth/me/
POST /api/auth/auth/token/refresh/
POST /api/auth/auth/token/verify/
POST /api/auth/register/
```

### Agendamiento

Segun la documentacion del backend, existen endpoints para:

```text
GET  /api/specialties/
GET  /api/doctors/?specialty=<id>
GET  /api/availability/slots/?doctor=<id>&specialty=<id>&date=<YYYY-MM-DD>
GET  /api/appointments/
GET  /api/appointments/<id>/
POST /api/appointments/book/
```

---

## Avances recientes del modulo paciente

Se creo una estructura inicial para la vista del paciente autenticado. El login identifica el rol recibido desde el backend y, cuando el valor es `paciente`, muestra el componente `Paciente`.

Los archivos principales agregados para este flujo son:

| Archivo | Funcion |
|---|---|
| `src/Paciente.jsx` | Controla la vista activa dentro del modulo paciente. |
| `src/pacienteLayout.jsx` | Define la estructura general con sidebar y contenido principal. |
| `src/pacienteSidebar.jsx` | Contiene la navegacion entre citas, agendamiento, perfil y cierre de sesion. |

El menu del paciente incluye actualmente estas opciones:

- Citas agendadas.
- Agendar cita.
- Reprogramar cita.
- Cancelar cita.
- Perfil.
- Cerrar sesion.

Tambien se corrigio la forma en la que React carga los componentes `PacienteLayout` y `PacienteSidebar`. Estos componentes deben comenzar con mayuscula para que React los interprete como componentes y no como etiquetas HTML. La vista inicial del modulo se establecio como `visualizar`.

### Vistas provisionales pendientes de creacion

Las ventanas de **visualizacion de citas**, **reprogramar cita** y **cancelar cita** todavia estan pendientes de creacion. Por ahora, los botones del sidebar permiten navegar, pero muestran componentes provisionales reutilizados de otras partes del proyecto:

| Opcion del paciente | Vista provisional actual | Estado real |
|---|---|---|
| Citas agendadas | `AdminDashboard` | Pendiente crear la vista que liste las citas del paciente. |
| Reprogramar cita | `RegistroSedes` | Pendiente crear el formulario y flujo de reprogramacion. |
| Cancelar cita | `RegistroPersonal` | Pendiente crear la vista de seleccion y cancelacion de cita. |

Estas vistas provisionales solo permiten validar la navegacion y el layout. No representan el diseno final ni ejecutan las funciones reales de visualizar, reprogramar o cancelar citas.

### Agendar cita en proceso

La opcion **Agendar cita** muestra provisionalmente el componente `CitasAdmin`, pero este formulario se encuentra en proceso de modificacion para adaptarlo al flujo del paciente.

El trabajo de diseno e integracion esta a la espera de una API de busqueda de pacientes. Esa API debe permitir localizar al paciente mediante su tipo y numero de documento antes de continuar con el formulario de agendamiento.

Hasta que el backend exponga ese endpoint:

- La busqueda de pacientes no puede completarse desde el frontend.
- No se puede validar ni cargar automaticamente la informacion del paciente.
- El formulario de agendamiento conserva campos y datos provisionales.
- El diseno definitivo del flujo queda pendiente de la respuesta y estructura de la API.

Una vez disponible la API, se debera conectar la busqueda, completar los datos del paciente encontrado y continuar con la seleccion real de especialidad, medico, sede, fecha y horario.

---

## Que esta conectado y que falta conectar

| Modulo | Estado |
|---|---|
| Login | Conectado al backend. |
| Registro de paciente | Conectado al backend, pero depende de EPS validas en BD. |
| Logout | Limpia sesion en frontend, falta consumir logout del backend. |
| Perfil paciente | Simulado, falta conectar con datos reales. |
| Registro personal | Simulado, falta endpoint backend. |
| Crear sede | Simulado, falta endpoint backend. |
| Agendar cita admin | Simulado, falta integracion. |
| Visualizacion de citas del paciente | Vista provisional; pendiente crear la pantalla real. |
| Reprogramar cita | Vista provisional; pendiente crear e integrar el flujo real. |
| Cancelar cita | Vista provisional; pendiente crear e integrar el flujo real. |
| Agendamiento paciente | En proceso; pendiente API de busqueda de pacientes para continuar el diseno y la integracion. |

---

## Como correr el proyecto

### 1. Backend

Desde:

```text
C:\Users\Usuario\Desktop\SaludAgendaX\saludAgendaX
```

Ejecutar:

```bash
python manage.py runserver
```

El backend queda en:

```text
http://127.0.0.1:8000
```

Si aparecen migraciones pendientes:

```bash
python manage.py migrate
```

### 2. Frontend

Desde:

```text
C:\Users\Usuario\Desktop\SaludAgendaX\frontend
```

Ejecutar:

```bash
npm run dev
```

El frontend queda en:

```text
http://localhost:5173
```

---

## Como probar rapidamente

### Login

1. Encender backend.
2. Encender frontend.
3. Entrar a `http://localhost:5173`.
4. Iniciar sesion con un usuario existente en la base de datos.
5. Verificar que el rol redirija a la vista correcta.

### Crear cuenta

1. Entrar a `Crear Cuenta`.
2. Llenar todos los campos.
3. Seleccionar una EPS existente en la base de datos.
4. Enviar el formulario.
5. Verificar el registro en Django Admin o base de datos.

### Admin

1. Iniciar sesion con un usuario de rol administrativo.
2. Probar botones del sidebar:
   - Panel.
   - Registro de personal.
   - Crear sede.
   - Agendar Cita Paciente.
   - Cerrar sesion.

---

## Recomendaciones para continuar

1. Corregir la carga de EPS para que venga desde backend y no desde valores fijos.
2. Conectar logout con el endpoint real del backend.
3. Crear endpoints de backend para guardar sedes.
4. Crear endpoints de backend para guardar personal interno.
5. Integrar el formulario de agendamiento admin con los endpoints de citas.
6. Conectar el perfil del paciente con datos reales del usuario autenticado.
7. Reemplazar datos simulados por informacion obtenida desde la API.
8. Separar estilos del admin en un archivo propio si el proyecto sigue creciendo.

---

## Notas para entrega

La parte frontend ya tiene estructura funcional, navegacion por estados y formularios principales. Lo que esta completamente conectado al backend es el login y el registro de paciente. Las pantallas administrativas existen y pueden navegarse, pero varias siguen pendientes de integracion porque el backend no expone todavia endpoints para guardar sedes y personal interno.

Esta documentacion complementa la documentacion de backend ubicada en:

```text
saludAgendaX/CAMBIOS_AGENDAMIENTO.md
```

