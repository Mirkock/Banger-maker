# Banger Maker

Bloc de notas grande para escribir temas con un beat de YouTube sonando arriba.
Funciona como app instalable en el celular (PWA). Las notas se guardan en el celular y, si querés, también en tu cuenta de Google.

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `styles.css`, `app.js` | La app |
| `manifest.webmanifest`, `sw.js` | Hacen que se pueda instalar y abrir sin internet |
| `icon-*.png`, `favicon.png`, `apple-touch-icon.png` | Íconos |

No hace falta instalar nada ni compilar: son archivos listos para subir tal cual.

## 1. Ponerla en internet (una sola vez)

Android solo deja instalar una app web si está publicada con `https://`. Es gratis.

**Con una computadora (lo más fácil):**
1. Entrá a https://app.netlify.com/drop
2. Arrastrá la carpeta `banger-maker` (la de los archivos, no el zip) a la página.
3. Netlify te da una dirección tipo `https://nombre-raro.netlify.app`. Esa es tu app.

Otras opciones gratis que sirven igual: GitHub Pages, Cloudflare Pages o Firebase Hosting.

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

## Actualizar la app

Si cambiás algún archivo, volvé a subir la carpeta y cambiá `banger-maker-v1` por `banger-maker-v2` en `sw.js` (primera línea de código), para que los celulares bajen la versión nueva.

## Después: Play Store

Esta misma app se puede empaquetar para la Play Store (por ejemplo con https://www.pwabuilder.com). Hace falta una cuenta de desarrollador de Google (pago único de unos USD 25) y, para cuentas nuevas, Google puede pedir un período de prueba con testers antes de publicar. Conviene confirmar los requisitos actuales en la página de Google Play Console.
