# Banger Maker

Bloc de notas grande para escribir temas con un beat de YouTube sonando arriba.
Funciona como app instalable en el celular (PWA). Las notas se guardan en el celular y, si querés, también en tu cuenta de Google.

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `styles.css`, `app.js` | La app |
| `rimas.js`, `rimas-datos.js` | Las sugerencias de rimas (el motor y las listas de palabras) |
| `manifest.webmanifest`, `sw.js` | Hacen que se pueda instalar y abrir sin internet |
| `icon-*.png`, `favicon.png`, `apple-touch-icon.png` | Ícono de la app |
| `logo-bust.png`, `logo-full.png` | El personaje que se ve adentro de la app |

No hace falta instalar nada ni compilar: son archivos listos para subir tal cual.

## 1. Ponerla en internet (una sola vez)

Android solo deja instalar una app web si está publicada con `https://`. Es gratis.

**Con una computadora (lo más fácil):**
1. Entrá a https://app.netlify.com/drop
2. Arrastrá la carpeta `banger-maker` (la de los archivos, no el zip) a la página.
3. Netlify te da una dirección tipo `https://nombre-raro.netlify.app`. Esa es tu app.

Otras opciones gratis que sirven igual: GitHub Pages (la que se usa ahora), Cloudflare Pages o Firebase Hosting.

## 2. Instalarla en el Moto G8

1. Abrí la dirección en **Chrome** del celular.
2. Menú ⋮ → **Instalar app** (o «Agregar a la pantalla principal»).
3. Queda con su ícono, a pantalla completa, y abre sin internet.

## 3. Traer un beat desde YouTube

- **Desde YouTube:** en el video tocá **Compartir** y elegí **Banger Maker**. Te pregunta si querés una nota nueva con ese beat o ponerlo en la última nota.
  (Banger Maker aparece en la lista de Compartir solo cuando está instalada.)
- **Dentro de la app:** en una nota tocá «Elegir un beat de YouTube», pegá el link o usá **Pegar link**.
- **Buscar dentro de la app:** necesita una clave gratis de YouTube (ver más abajo). Sin clave, **Buscar** abre YouTube para que elijas y compartas.

## 4. Cómo se usa el reproductor

- **El beat sigue sonando** cuando salís de la nota y te quedás en la app. Arriba aparece su nombre con **Cambiar** (elegís otro beat, sin tocar tus notas) y la **X** (cierra el reproductor).
- Si abrís una nota que usa **otro beat** mientras suena uno, el que suena no se corta: aparece un botón **Cambiar al de esta nota**. Si abrís una nota **sin beat**, el botón es **Usar el que suena** y lo deja guardado en esa nota.
- Si el beat está en pausa, al abrir una nota con otro beat se cambia solo (sin sonar).

- **−10 / +10:** retrocede o adelanta 10 segundos.
- **A y B:** marcás el inicio y el final de un tramo y se repite solo. La **X** lo quita. El tramo queda guardado en la nota.
- **1x:** cambia la velocidad (0.5x, 0.75x, 1x, 1.25x, 1.5x).
- **Marcar:** pone el minuto del beat al principio de la línea donde estás escribiendo, por ejemplo `[1:23]`. Si tocás de nuevo en la misma línea, actualiza el minuto.
- Al abrir una nota con beat, el video no arranca solo: tocás play.

## 5. Guardar en la nube (Firebase, gratis)

Sin esto las notas quedan solo en el celular (y podés usar **Exportar** en Ajustes como copia de seguridad). Para guardarlas en tu cuenta de Google:

1. Entrá a https://console.firebase.google.com y creá un proyecto (podés decir que no a Google Analytics).
2. **Authentication → Comenzar → Método de acceso → Google** → activalo.
3. **Firestore Database → Crear base de datos** (modo producción, la región más cercana). Después, pestaña **Reglas**, borrá lo que haya, pegá esto y tocá **Publicar**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

   (En Ajustes de la app hay un botón «Copiar las reglas de Firestore».)
4. **Configuración del proyecto (la ruedita) → Tus apps → Web (`</>`)** → registrá la app con cualquier nombre → copiá el bloque `firebaseConfig`.
5. **Authentication → Configuración → Dominios autorizados → Agregar dominio:** poné la dirección donde publicaste la app (por ejemplo `nombre-raro.netlify.app`, sin `https://`).
6. En la app: **Ajustes → Nube**, pegá el bloque del paso 4, tocá **Conectar** y después **Entrar con Google**.

Desde ahí se sincroniza solo. Si escribís sin internet, se sube cuando vuelva la conexión. Si cambiás la misma nota en dos dispositivos, queda la versión más reciente.

## 6. Búsqueda dentro de la app (opcional)

1. En https://console.cloud.google.com usá el mismo proyecto de Firebase → **APIs y servicios → Biblioteca** → buscá **YouTube Data API v3** → Habilitar.
2. **Credenciales → Crear credenciales → Clave de API**.
3. Pegala en **Ajustes → Buscar dentro de la app**.

El límite gratis alcanza para unas 100 búsquedas por día.

## Limitaciones de YouTube

- YouTube exige que el video esté visible (mínimo 200×200 px), por eso el reproductor es de ese tamaño. No se puede usar solo el audio.
- Si bloqueás la pantalla o salís de la app, el beat se pausa. Mientras escribís, la app mantiene la pantalla encendida.
- Algunos videos no dejan reproducirse fuera de YouTube; en ese caso la app avisa y elegís otro.

## Estilo, fondos y portadas

- **Ajustes → Estilo:** seis looks (Noche, Lava, Nebulosa, Bosque, Atardecer, Acuarela). El bloc usa los mismos colores que el inicio pero más quietos y con un panel de vidrio, para escribir cómodo.
- **Modo ahorro:** congela el movimiento del fondo.
- **Fondos con tus fotos:** una foto para el inicio y otra distinta para el bloc, con un regulador para oscurecerlas. Quedan guardadas solo en el celular.
- **Portadas:** en el menú ⋮ de una nota o de una carpeta, **Portada**. Elegís una foto de la galería, la encuadrás y listo. Las portadas viajan con la nube y entran en la copia de seguridad.
- Con el teclado abierto, escribiendo en el bloc, se esconde la barra de arriba para que entren más renglones.

## Rimas

Con el bloc abierto, arriba del teclado aparece una barra con rimas. La palabra con la que rima es la última de la barra de arriba (o la que acabás de escribir si es la primera línea). Para cambiarla, tocá la palabra de la izquierda y elegí **Elegir otra palabra**. Tocar una sugerencia la escribe donde está el cursor (si venías escribiendo «det», completa «detalle»).

- **Apagar/prender:** el botón **Rimas** del pie del bloc, o Ajustes → Rimas.
- **Filtros** (el botón de la derecha de la barra): español o English; consonante, asonante o las dos (las asonantes salen con borde punteado); cantidad de sílabas (1, 2, 3, 4 o más); tipo de palabra (formal, informal, jerga, marcas, famosos y, dentro de famosos, videojuegos, música argentina, música de EE. UU., fútbol, historia, cine y series); y de dónde saco palabras (tus notas, internet).
- **Mi diccionario:** tus propias palabras. Aparecen primero. Podés ponerles «cómo suena» (Nike → náiki) para que rimen bien aunque se escriban distinto. Entra en Exportar e Importar.
- **Internet:** las rimas extra vienen de Datamuse (gratis). Lo ya buscado se guarda en el celular y sirve sin conexión. Datamuse va a pedir una clave a partir del 1 de febrero de 2027: cuando te la den, se pega en Rimas → Internet (Datamuse).
- Los tipos de palabra (jerga, marcas, famosos) funcionan con las listas que trae la app y con tu diccionario. Las listas son un punto de partida: lo que falte lo agregás vos.

## Ordenar notas y carpetas

En el inicio, a la derecha de **Carpetas** y de **Sin carpeta** (o **Notas**) hay un botón con el orden actual. Tocalo para elegir por **Modificación**, **Creación** o **Nombre**, y si querés las más nuevas o las más viejas primero (o A → Z / Z → A). Las carpetas y las notas se ordenan por separado, y el orden de las notas vale también dentro de las carpetas. Lo que elegís queda guardado.

- Una carpeta cuenta como modificada cuando se cambió ella o cualquier nota de adentro.
- Por nombre, los números van en orden natural (Álbum 2 antes que Álbum 10) y las notas sin título quedan siempre al final.
- Si no tocás nada, sigue todo como antes: carpetas por nombre y notas por última modificación.

## Actualizar la app

Subí los archivos nuevos al mismo repositorio de GitHub (**Add file → Upload files**; los que tienen el mismo nombre se reemplazan) y esperá un minuto. El link no cambia.
Cada versión nueva trae `sw.js` con un número de caché distinto (`banger-maker-v4`, `v5`…): así los celulares bajan la versión nueva. Abrí la app, cerrala del todo y volvé a abrirla una o dos veces para que se actualice.

**Versión 3.1:** orden de notas y carpetas por fecha de modificación, de creación o por nombre.

**Versión 3:** ícono nuevo, personaje en el logo y en la pantalla vacía, y sugerencias de rimas. Todo lo anterior se mantiene. Si el ícono de la pantalla de inicio no cambia, Android a veces tarda: probá desinstalar la app y volver a instalarla (antes tocá Exportar en Ajustes por las dudas).

**Versión 2:** nuevo diseño, reproductor persistente, fondos y portadas. Las notas, carpetas y la conexión con la nube de la versión 1 se mantienen. El tema «Claro» pasa a ser el estilo Acuarela.

## Después: Play Store

Esta misma app se puede empaquetar para la Play Store (por ejemplo con https://www.pwabuilder.com). Hace falta una cuenta de desarrollador de Google (pago único de unos USD 25) y, para cuentas nuevas, Google puede pedir un período de prueba con testers antes de publicar. Conviene confirmar los requisitos actuales en la página de Google Play Console.
