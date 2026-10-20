# Landings de servicio para captar y convertir (2026-10-19)

> Resultado del brainstorming con Lucio. Cada decisión queda marcada como **(decidido)** si la tomó
> Lucio, o **(llamado mío)** si la propuse yo y Lucio aún no la confirmó explícitamente.

## Intención

Convertir los servicios principales de lucsandesign.com en landings que **capten leads calificados desde
Google** (búsqueda orgánica) y **conviertan el tráfico de campañas de Meta**, con el formulario de
Lucsan OS como punto de captura.

El motivo: Lucio puede atender **3 proyectos a la vez**. Importa el ajuste del lead, no el volumen.
Hoy cada servicio es una ficha informativa y el formulario de contacto no alimenta el CRM.

## Contexto actual

**La web** (este repositorio, Astro 5, rama `astro-rewrite`):
- En producción solo se ve la página `/en-construccion`, por la variable `UNDER_CONSTRUCTION=true`
  (middleware que reescribe todas las rutas). El sitio completo existe, pero no está publicado.
- El proyecto de Vercel `lucsan-web` no está conectado a GitHub: se publica con `vercel deploy`.
- Contenido: 4 servicios (branding, diseño web, marketing y publicidad digital, asesoría y consultoría),
  20 sectores, un proyecto de ejemplo (Acme Corp, con fotos de Unsplash) y cifras de ejemplo en la home.
- El esquema de `services` ya tiene: hero, incluye, paraQuien, problema (síntomas), metodo, entregables,
  casosRelacionados, sectoresAplicables, frameworks (con autor), faq, cta, seo y publicado. El esquema de
  `projects` ya tiene caso con contexto, desafío, enfoque, solución, galería, resultado y testimonio.

**Lucsan OS** (proyecto separado, `E:\Claude Code\lucsan os`, Next.js y Supabase):
- Ya tiene constructor de formularios de varios pasos con lógica condicional, calculadora con tarifas
  por ítem y multiplicadores, puntaje de lead y precios en CLP, USD y EUR.
- Por su diseño del 2026-10-04 (`docs/superpowers/specs/2026-10-04-phase-a1-public-forms-design.md`) el
  formulario público embebible **aún no está publicado**. Se inserta con un script que crea un iframe
  (`app.lucsandesign.com/embed/v1.js`), lee las UTM y los `gclid`/`fbclid` de la URL de la página, crea
  o actualiza un lead por correo, protege con Turnstile y cumple RGPD. Tiene tres modos de precio:
  `none`, `on_complete` (por defecto) y `live`.
- Siguientes ciclos de OS ya decididos: píxel y API de conversiones de Meta y TikTok, con
  consentimiento (1b); generador de UTM, enlaces cortos y QR (1c).
- No hay tarifas cargadas en el repositorio: `seed.sql` está vacío. El "rate card" figura como pendiente.

## Objetivos, no objetivos y anti objetivos

**Objetivos**
- Pocos leads, calificados, para **Branding** y **Diseño web**.
- Un solo formato de landing que sirva a Google y a Meta.
- Que quien no califica lo entienda con cortesía antes de gastar tiempo de ambas partes.
- Autoridad sin cifras de resultados: casos reales, método, charla y capacidad.

**No objetivos (esta fase)**
- Landings por subservicio (auditoría, manual de marca, etc.).
- Una versión corta exclusiva para anuncios, guías descargables, versión en inglés, blog.
- Píxeles y API de conversiones (dependen del ciclo 1b de OS y de un aviso de cookies).
- Vender talleres. Ejecutar campañas como servicio.

**Anti objetivos** (fracasa aunque funcione técnicamente)
- Recibir muchas solicitudes de proyectos bajo el mínimo.
- Mostrar precios o cotizaciones en la web. La única cifra visible es el piso de la pregunta de
  presupuesto del formulario (decidido por Lucio: es lo que permite filtrar).
- Afirmar algo no verificable: cifras, clientes, logros de terceros.
- Que las landings parezcan un catálogo de diseño.
- Revelar el detalle de la metodología propia.
- Argentinismos o guiones largos en los textos.

## Cliente ideal y capacidad (decidido)

- **Branding:** desde 3.000 USD (al cambio en la moneda local de cada país), proyectos de hasta 2 meses.
- **Diseño web:** landing desde 500 USD; tienda online desde 1.500 USD más complejidad (integraciones,
  cantidad de SKU); web corporativa o informativa entre 1.500 y 5.000 USD según páginas, diseño y tecnologías.
- **Estrategia de marca y de marketing:** por proyecto. Los precios no están definidos.
- **Capacidad:** máximo 3 clientes al mismo tiempo.
- **Ejecución de campañas:** hoy se hace poco y no es rentable. Podría ser una línea recurrente futura
  con personal dedicado.
- **Alcance geográfico (decidido):** todo el mundo hispanohablante, sin importar dónde viva el cliente
  (Latinoamérica, Europa, Estados Unidos, Asia, etc.). Español neutro con tuteo. Lucsan Design sigue siendo
  un estudio con base en Santiago, Chile.
- **Precios:** no se publican precios ni cotizaciones. El filtro lo hace solo el formulario, y su única
  cifra visible es el piso de la pregunta de presupuesto y del final "no califica".

### Qué implica un mercado hispanohablante mundial (decidido el alcance, el resto llamado mío)

- **Moneda:** el dólar es la referencia universal en todo el sitio y los formularios. El equivalente en
  moneda local se muestra solo donde haya tipo de cambio mantenido (Lucsan OS hoy maneja CLP, USD y EUR).
- **Textos:** sin referencias fiscales de un solo país. Hoy las preguntas frecuentes dicen "+ IVA", que
  es una referencia chilena.
- **Titulares:** sin "en Chile" ni referencias a un solo país.
- **Llamadas:** la herramienta de agenda debe mostrar la hora en la zona del visitante.
- **Formularios:** el país admite cualquiera y el teléfono lleva código de país. El RGPD ya está
  contemplado en OS para residentes de la Unión Europea.
- **Cómo se llega a cada país:** el posicionamiento en Google competirá con mercados grandes de habla
  hispana, así que se espera como un complemento. La vía principal para llegar fuera de Chile son los
  anuncios segmentados por país, con una landing neutra. El sitio usa `lang="es"` general, sin versiones
  por país por ahora.

## Servicios

- **Branding (decidido):** incluye estrategia de marca como componente. El **rebranding es una sección
  dentro de Branding** por ahora, porque solo un caso (Sports) lo declara explícitamente (llamado mío).
- **Diseño web (decidido):** landing, web corporativa y tienda online son variantes dentro de la misma
  landing, no páginas separadas (llamado mío, porque la tienda online queda con un solo caso publicable).
- **Estrategia (llamado mío):** une "asesoría y consultoría" con la parte estratégica de marketing.
  Pasamos de cuatro servicios a tres. Página informativa con el mismo formato, sin campañas pagadas por ahora.
- **Gestión de campañas (decidido, en la práctica):** servicio **oculto** (`publicado: false`) hasta que
  haya personal dedicado.
- **Papelería y folletería:** sin landing ni protagonismo. Como mucho, una mención secundaria (llamado mío).
- **Prioridad de campañas:** Branding y Diseño web.

## Estructura de la landing

Mismo formato para los servicios. El **formulario aparece arriba y abajo** (decidido): quien llega decidido
lo llena de inmediato; quien necesita entender más baja, se informa y lo encuentra al final.

1. **Hero:** titular que nombra el problema del visitante, subtítulo, formulario visible (escritorio) o
   botón anclado (móvil), y una línea de prueba breve y verificable.
2. **Reconocimiento del problema:** síntomas, para quién es **y para quién no**.
3. **Costo de no resolverlo:** consecuencias de negocio, sin exagerar.
4. **Solución y beneficios:** valor para el negocio, no lista de disciplinas.
5. **Alcance y entregables.**
6. **Método:** las fases a alto nivel y la frase de metodologías. Sin el detalle.
7. **Casos relacionados:** 2 a 3, con la estructura contexto, desafío, decisiones y qué cambió.
8. **Confianza:** extractos de la charla, una línea de formación, y la capacidad ("máximo 3 proyectos a
   la vez", plazo típico, próximo cupo).
9. **Preguntas y objeciones:** plazos, proceso, qué pasa si el proyecto no encaja. Sin precios.
10. **Formulario final.**

En móvil, un **botón cerca del inicio** (más una barra de CTA fija) lleva de inmediato al formulario
final, para que el lead no tenga que bajar (decidido). Solo se carga esa instancia, de forma diferida,
para cuidar la carga y evitar dos Turnstile (llamado mío). En escritorio van las dos instancias. Los titulares parten de problemas reales del cliente y no de "ofrecemos
servicios profesionales de...". El orden de escritura de las landings es Branding, Diseño web y Estrategia.

## Casos y prueba social

**Tres casos con página completa** (llamado mío, por ser los que combinan más servicios):
Sports Medicina deportiva, Ulen Patagonia e Impulso Salud.

**Ocho como tarjetas livianas** (imagen, servicios, una línea): Halvory, Tekhome, Marca Center, Ibiro,
KeenDuck, Celeress, Roberto Bello y Beastlab.

**Excluido:** Elektroservice (sin autorización de uso). Ni nombre ni logo hasta tenerla.

**Alcance de cada proyecto** (según Lucio): Halvory, marca y web. Tekhome, web y redes sociales. Marca
Center, marca y web. Ibiro, marca. KeenDuck, marca y estrategia de marca. Impulso Salud, marca, web y
estrategia de marketing. Beastlab, web ecommerce. Celeress, marca. Roberto Bello, marca y estrategia de
marca. Ulen Patagonia, marca, estrategia de marca y marketing, y web. Sports, rebranding corporativo
(nueva marca y fachada de una sucursal), estrategia de marca y de marketing, sitio con agendamiento y
plataforma interna de gestión.

**Sin resultados medibles ni testimonios** (decidido: no se pueden obtener ahora). Los casos usan
**resultados observables**: qué se entregó y qué cambió para el cliente. Nunca cifras inventadas.

**Material disponible** (según Lucio): fotos, manuales de marca, indumentaria, aplicaciones, fotos de
sucursales, logos, línea gráfica, briefs previos y presentaciones de estrategia de marca y marketing.
Las presentaciones traen información del cliente: solo extractos revisados y anonimizados. Los textos se
redactan a partir de los briefs y Lucio los valida (llamado mío).

## Autoridad

- **Charla en el Palacio Rioja (decidido):** extractos de 30 a 60 segundos con subtítulos. Requiere
  autorización de Duoc UC (Lucio la solicita) y el visto bueno de quienes aparezcan en cámara.
  **El taller online no se usa** (decidido).
- **Duoc UC:** solo se afirma el hecho ("charlas y talleres en programas de Duoc UC Viña del Mar y
  Valparaíso"). Mostrar su marca o logo exige su permiso.
- **Formación:** una sola línea, "Formación en diseño y branding en Chile y España", más detalle en
  "Sobre nosotros". Se describe el diplomado de la UDD tal cual, sin "casi magíster". Lucio duda de
  incluirla: el estudio lleva la voz y la trayectoria aparece de forma discreta (llamado mío).
- **Metodología (decidido en espíritu):** frase simple y concreta, por ejemplo "Metodologías de branding
  probadas en Chile y el mundo, aplicadas a negocios de todos los tamaños", más las fases. Los autores
  y referencias solo en "Sobre nosotros". No se insinúa relación con los clientes de terceros
  (por ejemplo Liquid Latam).
- **Capacidad (llamado mío):** campo editable a mano con el próximo cupo disponible. No se automatiza. Vive solo en la web: el formulario muestra un texto fijo ("Tomamos un máximo de 3
  proyectos a la vez"), sin fechas (llamado mío).

## Formularios y flujo del visitante

Todos los formularios viven en Lucsan OS y se insertan en la web. La web no recibe datos personales.
La especificación detallada para construirlos en OS está en
`docs/superpowers/specs/2026-10-19-lucsan-os-forms-handoff.md`.

1. **Diagnóstico corto (decidido):** 3 preguntas, para quien aún no sabe qué necesita. Se usa en la
   home y en la página general de servicios, no dentro de las landings (llamado mío). Al final entrega
   una orientación y pide el correo, lo que crea un lead de "intención media".
2. **Continuar (decidido):** botón al final del diagnóstico que lleva al **formulario completo del
   servicio resultante**, sin repetir datos. El mismo iframe navega al formulario siguiente, sin salir de la
   página, y se conserva la atribución del primer contacto (llamado mío).
3. **Formulario completo por servicio (decidido):** alcance, plazo, presupuesto y contacto. Calcula el
   puntaje con los rangos y **nunca muestra precios** al visitante.
4. **Corte por presupuesto (decidido):** una opción "menos de $X". Si se elige, el paso siguiente explica,
   con tono amable y sin cerrar la puerta de golpe, que el proyecto no se puede atender. Puede ofrecer
   como recurso la grabación de la charla, si Duoc la autoriza (llamado mío).
5. **Entrada desde anuncios y Google (decidido):** llega a la landing, con el formulario completo arriba y abajo.
6. **Umbrales propuestos (a confirmar):** Branding 3.000 USD, Web corporativa 1.500, Tienda online
   1.500, Landing 500, convertidos a la moneda local de cada país. Estrategia: sin definir.
7. **"Aún no tengo definido el presupuesto":** continúa, con aviso para revisión manual (llamado mío).
8. **Estrategia, mientras no tenga piso (llamado mío):** el formulario no corta y todos los envíos quedan
   en revisión manual hasta que Lucio defina el piso.
9. **Rediseño de un sitio existente (llamado mío):** usa el piso de la web corporativa (1.500 USD). Si se
   rediseña una tienda, el visitante elige "Tienda online". **"No lo sé":** continúa sin corte y queda en
   revisión manual.
10. **Datos de quien no califica (llamado mío):** se piden nombre, correo y país antes del corte, para poder
    medir y atribuir. Quien no califica queda marcado y no se le piden más datos, y el aviso de
    privacidad lo explica. En OS se podría acortar su plazo de conservación (opcional).

## Contrato con Lucsan OS

Lo que Lucsan OS no hace hoy, según su diseño, y habría que agregarle (se especifica en su propio
repositorio; el detalle está en el documento de traspaso citado arriba):

1. **Dirigir a otro formulario según el resultado del diagnóstico.** Hoy el final solo admite un mensaje
   o una redirección fija.
2. **Continuar sin repetir datos,** con una señal firmada de corta duración. Nunca con el correo en la URL.
3. **Finales distintos por camino** (califica y no califica). Hoy hay un mensaje final por formulario.
4. **Recomendación sin precio.** El modo `none` no devuelve cifras; hace falta un modo que muestre solo
   etiquetas para que el diagnóstico oriente sin mostrar dinero.
5. **Varias instancias del mismo formulario en una página** (arriba y abajo): ajuste de altura, mensajes
   entre el iframe y la página, Turnstile y límite de envíos.
6. **Posición del formulario** (arriba o abajo) como dato de atribución, para medir cuál convierte (opcional).
7. **Tarifas cargadas** (precio mínimo y máximo en CLP, USD y EUR, plazos, textos de ayuda) y los umbrales.
8. **Orígenes permitidos** que incluyan lucsandesign.com y los dominios de preview.

Mientras OS no publique el formulario, la web usa un componente con la interfaz final y un marcador.

## Técnica y rendimiento

- **Sin hero con humo (WebGL) en las landings,** ni animaciones que oculten contenido. El tráfico pagado
  llega por móvil: importan la carga rápida y la batería. El humo se queda en la home (llamado mío).
- **SEO:** una palabra clave principal por landing (ya existe el campo `keyword`), títulos y metadatos
  propios, enlaces entre landings y casos. Los 20 sectores se revisan antes de indexarlos, porque podrían
  competir como páginas parecidas (no verificado).
- **Consentimiento:** ningún píxel de Meta o TikTok se instala sin aviso de cookies y consentimiento.
  Depende del ciclo 1b de OS.
- **Datos personales:** nada en la URL, y el aviso de privacidad vive en el formulario.

## Cambios de contenido en la web

- `services`: campos nuevos para consecuencias, beneficios, prueba rápida, capacidad (próximo cupo),
  para quién no es y referencia al formulario de OS. `publicado` ya permite ocultar un servicio.
- `projects`: nivel (página completa o tarjeta) y el alcance de cada proyecto.
- Los textos existentes se reescriben: hoy marketing vende ejecución de anuncios, y las preguntas
  frecuentes de branding y marketing publican precios de partida que habrá que retirar o reformular.
- Sobre nosotros: formación, metodologías y la charla.
- Estilo: español neutro con tuteo, sin argentinismos, sin guiones largos, sin precios, sin afirmaciones
  no verificables.

## Entrega por fases

1. **Esquema y plantilla de landing** con un formulario simulado, y la landing de **Branding** completa, con el caso de Sports en página completa y las tarjetas de los
   demás. El resto de los casos completos llega en la fase 3 (llamado mío).
2. **Diseño web** y **Estrategia** (más el servicio oculto).
3. **Casos** (3 completos y 8 tarjetas) y "Sobre nosotros".
4. **Conectar los formularios reales** cuando OS los publique, y el diagnóstico.
5. **Consentimiento de cookies y píxeles** (con el ciclo 1b de OS) y, si hace falta, una versión corta
   para anuncios. **Las campañas de Meta no se lanzan antes de esta fase,** porque sin píxel Meta no
   optimiza. El SEO de Google corre desde el lanzamiento (llamado mío).
6. **Preparar el lanzamiento:** reescribir la home, revisar los sectores, retirar los datos de ejemplo
   (Acme Corp y las fotos de Unsplash), confirmar o retirar las cifras de la home, y revisar móvil y
   rendimiento.

La web **sigue en construcción** hasta lanzar. Lanzar es quitar `UNDER_CONSTRUCTION` en Vercel y volver
a desplegar, después de revisar móvil, rendimiento, textos y que cada dato sea verificable.

## Decisiones de lanzamiento (decididas)

- **Lanzamiento único:** todo el sitio se publica junto, no por partes. Se construye por pasos, en
  secuencia lógica, y se lanza al final. Hasta entonces sigue la página de construcción, sin lista de
  rutas permitidas.
- **Mercado:** todo el mundo hispanohablante (ver arriba).

## Pendientes de Lucio (no bloquean el diseño)

- Autorización de uso de marca y de la grabación de la charla (Duoc UC), y permiso de quienes aparecen.
- Autorización de Elektroservice, si se quiere recuperar.
- Nombre exacto de la institución del magíster y si el diplomado de la UDD está terminado.
- Sector de cada proyecto (el esquema usa una lista de 20) y el texto base de los tres casos completos.
- Umbrales por servicio y los precios de Estrategia, para el "rate card".
- Dónde están los briefs, presentaciones y fotos de cada proyecto. Los textos los redacta el agente web
  a partir de ellos y Lucio los valida.
- Herramienta de agenda para las llamadas, que muestre la hora en la zona del visitante.
- Confirmar las cifras de la home ("5 años", "20 sectores", "+30 marcas", "100%") o retirarlas.

## Queda al constructor

Nombres exactos de campos y componentes, diseño visual de cada bloque, borradores de titulares para
revisión, animaciones permitidas y el detalle fino del orden de secciones.
