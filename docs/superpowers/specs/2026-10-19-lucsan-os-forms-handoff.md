# Traspaso a Lucsan OS: formularios de captación para las landings (2026-10-19)

> **Para quién es este documento:** el agente que trabaja en el repositorio de **Lucsan OS**
> (`E:\Claude Code\lucsan os`). Está escrito para leerse sin el contexto de la conversación donde se
> originó. Lo redactó el agente del proyecto web (`E:\Claude Code\Lucsan web`), que orquesta ambos.
> El diseño completo de la web está en `docs/superpowers/specs/2026-10-19-service-landings-design.md`
> de ese repositorio.
>
> **Estado:** propuesta para revisar con Lucio. Lo que Lucio decidió está marcado **(decidido)**. Lo que
> propone el agente web está marcado **(propuesta)**. No cambies nada de la lógica de seguridad ya
> diseñada en `2026-10-04-phase-a1-public-forms-design.md` sin consultarlo.

## 1. Contexto en tres párrafos

Lucsan Design es un estudio de diseño (Chile) que vende **Branding**, **Diseño web** y **Estrategia**.
Lucio puede atender **máximo 3 proyectos a la vez**, así que no busca volumen de leads sino leads
**calificados**. Su mercado es **todo el mundo hispanohablante**, esté donde esté. Su sitio, `lucsandesign.com` (Astro, proyecto aparte), tendrá una landing por servicio
que capta tráfico de Google y de campañas de Meta.

Las landings **no tienen formularios propios**. Insertan los formularios de Lucsan OS con el script
`embed/v1.js` (iframe) ya diseñado en la fase A1. La landing pone el formulario **arriba y abajo**
(dos instancias del mismo formulario en la misma página). La web nunca recibe datos personales.

El **filtro de calidad lo hace solo el formulario**, y el precio **nunca se muestra** al visitante
como cotización. La única cifra visible es el piso de la pregunta de presupuesto y su repetición en el
final "no califica" (decidido por Lucio). Hay además un **diagnóstico corto** previo, para quien aún no sabe qué necesita, que
lo orienta y lo lleva al formulario completo del servicio que le corresponde.

## 2. Qué ya existe en OS y se reutiliza

Según la lectura del repositorio (no ejecutada): constructor de formularios de varios pasos con lógica
condicional y saltos (`evaluateConditional`, `evaluateBranching`), calculadora con tarifas por ítem,
reglas de etiqueta y multiplicadores (`calculatePricing`), puntaje (`calculateScoring`), `lintForm`,
`buildSnapshot`, derivación de lead (`deriveLeadPayload`), precios en CLP, USD y EUR, y los tipos de
campo `text, textarea, email, phone, number, select, multiselect, radio, checkbox, date, file`.

El diseño `2026-10-04-phase-a1-public-forms-design.md` ya define: publicación con foto inmutable,
iframe embebible, atribución por UTM, `gclid` y `fbclid`, un lead por correo, Turnstile, límite de envíos,
RGPD y tres modos de precio (`none`, `on_complete`, `live`).

**No hay tarifas ni formularios cargados:** `supabase/seed.sql` está vacío.

## 3. Los cuatro formularios (propuesta, salvo lo marcado)

| Slug | Para qué | Quién lo ve |
| ---- | -------- | ----------- |
| `diagnostico` | Orientar a quien no sabe qué necesita | Home y página general de servicios |
| `branding` | Formulario completo de Branding | Landing de Branding |
| `diseno-web` | Formulario completo de Diseño web | Landing de Diseño web |
| `estrategia` | Formulario completo de Estrategia | Landing de Estrategia |

Idioma: **español neutro, tuteo, sin argentinismos** (no "vos", "tenés", "elegí"). Sin guiones largos en
los textos. Tono cercano y profesional. Primero móvil, una idea por pantalla.

### 3.1 `diagnostico` (decidido: 3 preguntas y luego el correo)

**Paso 1, pregunta 1** (radio), "¿Cuál describe mejor la situación de tu negocio?":
- Estamos creando una marca desde cero. → resultado `branding_nuevo`
- Nuestra marca ya no representa el negocio. → `branding_renovar`
- No sabemos qué está fallando. → `estrategia`
- Necesitamos mejorar nuestra presencia digital. → `web`

**Paso 2, pregunta 2** (radio), "¿Qué buscas conseguir principalmente?":
- Diferenciarnos de la competencia.
- Atraer clientes más adecuados.
- Profesionalizar nuestra imagen.
- Mejorar nuestras oportunidades comerciales.
- Vender en línea. → refuerza `web` (tienda)

**Paso 3, pregunta 3** (radio), "¿En qué etapa se encuentra tu empresa?":
- En lanzamiento. / Ya tenemos clientes y operaciones. / Estamos creciendo o evolucionando.

**Paso 4:** nombre y correo (el correo es el campo mapeado a `email`). Aviso de privacidad y casilla
comercial opcional, desmarcada, según la fase A1.

**Resultado** (se muestra tras el paso 4, sin cifras de dinero): un nombre de servicio, dos o tres líneas
de orientación y un botón **"Continuar con el formulario de {servicio}"**.

| Resultado | Nombre mostrado | Formulario destino |
| --------- | --------------- | ------------------ |
| `branding_nuevo` | Construir tu marca | `branding` |
| `branding_renovar` | Renovar tu marca (rebranding) | `branding` (con la situación "renovar" ya marcada) |
| `estrategia` | Definir tu estrategia | `estrategia` |
| `web` | Tu sitio web | `diseno-web` |

Desempate (propuesta): manda la pregunta 1; si en la pregunta 2 elige "Vender en línea", el resultado
es `web`. Texto de orientación fijo por resultado, escrito en la definición del formulario. Debe decir
que es **una orientación preliminar**, y no prometer alcance ni precio.

Crea un lead con la etiqueta `diagnostico` y el resultado, y marca la **intención media**.

### 3.2 Formularios completos (`branding`, `diseno-web`, `estrategia`)

Estructura de pasos (propuesta), pensada para **no pedir más datos personales a quien no califica**:

1. **Contacto mínimo:** nombre, correo, país. (Se omite si llega desde el diagnóstico.)
2. **Proyecto:** preguntas específicas del servicio (ver abajo).
3. **Plazo y presupuesto.** Aquí está el **corte** (ver 3.3).
4. **Solo si califica:** empresa, teléfono o WhatsApp, enlace del sitio o redes (opcional), cómo nos
   conociste y un campo libre. Aviso de privacidad y casilla comercial opcional.
5. **Final calificado:** mensaje, próximo paso (agendar la llamada de descubrimiento) y un texto fijo,
   "Tomamos un máximo de 3 proyectos a la vez", sin fechas. El "próximo cupo" vive solo en la web.

**`branding`, paso 2:**
- Situación (radio): Creamos la marca desde cero / Queremos renovar la marca actual / Tenemos marca pero
  sin sistema ni manual / Aún no lo tenemos claro.
- Etapa del negocio (radio): igual que en el diagnóstico.
- Qué necesitas (multiselect): Estrategia de marca / Identidad visual (logo y sistema) / Manual de marca /
  Aplicaciones (papelería, indumentaria, señalética, etc.) / Sitio web / Estrategia de marketing.

**`diseno-web`, paso 2:**
- Tipo de proyecto (radio): Landing page / Sitio web corporativo o informativo / Tienda online /
  Rediseño de un sitio existente / No lo sé.
- Si **Tienda online**: cantidad aproximada de productos (menos de 50, 50 a 300, 300 a 1.000, más de
  1.000) e integraciones (multiselect: pasarela de pago, inventario o ERP, envíos y logística, marketplace,
  otras, ninguna).
- Si **corporativo o informativo**: cantidad de páginas (hasta 5, 6 a 10, más de 10) y si ya tienen marca
  y contenidos (sí, en parte, no).
- Si **Landing**: objetivo (captar contactos, vender, evento o lanzamiento).

**`estrategia`, paso 2:**
- Qué necesitas (multiselect): Estrategia de marca (posicionamiento y propuesta de valor) / Estrategia de
  marketing / Diagnóstico de la marca actual / Acompañamiento estratégico.
- Situación y etapa del negocio, igual que en `branding`.

### 3.3 Corte por presupuesto (decidido el comportamiento, a confirmar los montos)

Una pregunta de presupuesto con una opción de piso, "Menos de USD X". Si el visitante la elige, **el paso
siguiente no pide más datos**: salta a un final "no califica".

Pisos que Lucio dio (el piso de **Branding** es 3.000 USD "al cambio en la moneda local de cada país"):

| Formulario o variante | Piso (USD) | Fuente |
| --------------------- | ---------- | ------ |
| Branding | 3.000 | Lucio |
| Web, landing page | 500 | Lucio ("desde 500") |
| Web, tienda online | 1.500 | Lucio ("desde 1.500" más complejidad) |
| Web, corporativa o informativa | 1.500 | Lucio ("entre 1.500 y 5.000") |
| Web, rediseño de un sitio existente | 1.500 | propuesta (igual que corporativa) |
| Web, "No lo sé" | sin corte, revisión manual | propuesta |
| Estrategia | **sin definir** | pendiente de Lucio. Mientras tanto, sin corte y todo a revisión manual (propuesta) |

En `diseno-web` el piso depende del tipo de proyecto: implementar con **tres campos de presupuesto
condicionales** (uno por variante), cada uno con sus propias opciones.

Tramos por encima del piso (**propuesta**, editables): para Branding, 3.000 a 6.000, 6.000 a 12.000 y
más de 12.000. Siempre una opción **"Aún no tengo definido el presupuesto"**: continúa, y el lead queda
marcado para **revisión manual** (propuesta).

**Montos y monedas (el mercado es mundial).** El visitante ve cada opción en USD, que es la referencia
universal, y su equivalente aproximado en su moneda cuando haya tipo de cambio (por ejemplo "Menos de USD
3.000, unos $2.800.000 CLP"). OS hoy maneja CLP, USD y EUR: para otras monedas se muestra solo USD, y la
lista se amplía con el tiempo. Hace falta una tabla de tipos de cambio mantenida a mano por Lucio
(propuesta: así no depende de un servicio externo). El campo de país admite **cualquier país** y el
teléfono, el código de país.

**Mensaje del final "no califica"** (borrador, para pulir con Lucio):
> Gracias por contarnos tu proyecto. Por ahora los proyectos de {servicio} parten desde {monto mínimo en
> tu moneda}, y con un presupuesto menor no podríamos darte el nivel de trabajo que buscas ni cumplir bien
> los plazos. Preferimos decírtelo con claridad. Si más adelante tu presupuesto cambia, escríbenos con
> gusto. Mientras tanto, esta charla puede ayudarte a ordenar tu marca: {enlace}.

El **recurso de la charla** solo se muestra si Duoc UC autoriza la grabación (pendiente de Lucio). Sin
autorización, el mensaje termina sin el enlace. Nunca debe sonar despectivo.

### 3.4 Lo que se guarda y cómo se califica

- **Lead:** nombre, correo, teléfono, empresa, país, servicio de interés, atribución (UTM, `gclid`,
  `fbclid`, URL de la landing, `referrer`) y consentimientos, como ya define la fase A1.
- **Calificación** (propuesta, campo o etiqueta, sin mezclarla con la etapa de ventas): `calificado`,
  `no_calificado` o `revision_manual`. Marcar a quien no califica como "perdido" distorsionaría las
  métricas de ventas, así que se prefiere un campo propio.
- **Puntaje** (propuesta): presupuesto dentro del rango, plazo de hasta 2 meses, etapa del negocio con
  clientes y operaciones, y proyecto con alcance claro suman; "sin presupuesto definido" no resta, pero
  exige revisión. Los valores exactos los afina Lucio al ver los primeros leads.
- **Datos de quien no califica (propuesta):** se guardan nombre, correo y país, pedidos antes del corte, y
  no se le piden más datos. Opcional: un plazo de conservación más corto para `no_calificado`.
- **Precio al visitante: `none`** en los formularios completos. La calculadora con tarifas puede
  estimar un rango **solo para uso interno** en la ficha del lead, cuando exista el rate card.

## 4. Lo que OS no hace hoy y hay que agregar

Cada punto indica por qué hace falta y una dirección posible (decide el agente de OS).

1. **Rutas por resultado.** El final de un formulario hoy admite un mensaje o una redirección fijos
   (`completion`: `message` o `redirect`, `ctaLabel`, `ctaUrl`). El diagnóstico necesita **elegir el
   formulario siguiente según su resultado**. Dirección: una lista de reglas "si el resultado es X,
   continuar en el formulario Y".
2. **Continuar sin repetir datos.** Tras el diagnóstico, el formulario completo no debe volver a pedir
   nombre y correo. Dirección: la respuesta del envío devuelve una **señal firmada de corta duración**
   (por ejemplo 30 minutos, de un solo uso) con el lead y el resultado; el formulario siguiente la lee en
   el servidor y se salta el paso de contacto. **Nunca** poner el correo ni otro dato personal en la URL.
   El mismo iframe navega al siguiente formulario (llamado del agente web), de modo que la página no cambia
   y se conserva la atribución del primer contacto.
3. **Finales distintos por camino.** Hoy hay un mensaje final por formulario. Se necesitan al menos dos
   (califica y no califica), cada uno con su texto, su botón opcional y su efecto en el lead (calificación).
4. **Recomendación sin precio.** El diagnóstico debe mostrar un nombre de servicio y un texto de
   orientación **sin cifras**. Hoy `none` no devuelve nada y `on_complete` devuelve totales. Dirección: un
   modo que devuelva solo la etiqueta y el texto del resultado coincidente.
5. **Varias instancias en la misma página.** La landing inserta el mismo formulario dos veces. El script
   de inserción, el ajuste de altura, los mensajes entre el iframe y la página, Turnstile y el límite de
   envíos deben funcionar con **más de una instancia**, sin pisarse. En móvil la landing carga solo una instancia,
   de forma diferida, y un botón cerca del inicio (más una barra fija) salta directo a ella; el soporte
   para carga diferida también es parte del punto. Un envío desde una instancia no debe
   disparar a la otra.
6. **Posición de la instancia como dato de atribución** (opcional): saber si convirtió el formulario de
   arriba o el de abajo. Dirección: un atributo del script (`data-position`) que se guarde en `attribution`.
7. **Tarifas, pisos y tipos de cambio como configuración, no código.** Lucio cambiará los pisos y los
   tramos con el tiempo.
8. **Orígenes permitidos** (`allowedOrigins`): `https://lucsandesign.com`, `https://www.lucsandesign.com`
   y los dominios de preview que se usen para probar.

## 5. Contrato entre la web y OS (para no romperlo después)

- La web inserta `https://app.lucsandesign.com/embed/v1.js` con el `slug` del formulario y (opcional) la
  posición. **No guarda nada** en el navegador y no lee los datos del formulario.
- La web escucha `lucsan:form-submitted` (solo con el `slug`, sin datos personales) y, si OS lo agrega,
  el resultado del diagnóstico **solo como valor no sensible** (por ejemplo `web`, nunca el correo).
- Nada de PII en la URL, en eventos ni en el navegador de la landing.
- Los píxeles de Meta y TikTok **no se instalan** sin aviso de cookies y consentimiento. Es el ciclo 1b.

## 6. Criterios de aceptación

1. En una landing, el mismo formulario aparece **arriba y abajo**, ambos funcionan, y un envío desde
   cualquiera crea **un solo lead** con la atribución de la URL.
2. El diagnóstico muestra una orientación **sin cifras** y su botón lleva al formulario correcto, **sin
   volver a pedir** nombre ni correo.
3. Quien elige "menos de USD X" ve un final amable de "no califica" **sin que se le pidan más datos** y
   el lead queda con `no_calificado`.
4. Quien elige "Aún no tengo definido el presupuesto" continúa y el lead queda en `revision_manual`.
5. En `diseno-web`, el piso cambia según el tipo de proyecto elegido.
6. Ningún formulario muestra un precio como cotización.
7. Los textos están en español neutro con tuteo, sin argentinismos ni guiones largos.
8. Sin PII en URL, eventos ni almacenamiento del navegador de la landing.
9. Funciona bien en móvil: etiquetas visibles, errores junto al campo, zonas táctiles de 44 px.
10. El campo de país admite cualquier país y el teléfono acepta código de país.

## 7. Pendientes de Lucio que bloquean partes de esto

- Pisos y tramos de **Estrategia**, y confirmar los tramos propuestos de los demás.
- **Tipos de cambio** para mostrar montos en moneda local (países: todos), y qué monedas, además de CLP,
  USD y EUR, se quieren soportar primero.
- **Enlace de agenda** para la llamada de descubrimiento (en la carpeta de referencias hay un banner de
  Zcal; confirmar si es la herramienta) y el **plazo de respuesta** que se promete. La herramienta debe mostrar la hora en la zona del visitante,
  porque el mercado es mundial.
- **Autorización de Duoc UC** para ofrecer la grabación de la charla en el final "no califica".
- Revisar el texto del final "no califica" y las orientaciones del diagnóstico.

## 8. Qué queda al agente de OS

La implementación de cada punto de la sección 4, los nombres de tablas, campos y componentes, el diseño
visual del formulario (con `frontend-design` y `ui-ux-pro-max`, como ya definió la fase A1), y el orden
de entrega. Se sugiere especificar y construir primero lo que desbloquea la landing de Branding: los
puntos 5 y 8 y el formulario `branding`; después el diagnóstico con los puntos 1 a 4.
