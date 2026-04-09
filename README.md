# 🎯 Quiz App Multijugador

Aplicación de quiz en tiempo real con React, Node.js, MongoDB y Socket.io. Lista para convertir en APK con Capacitor.

---

## Requisitos previos

- Node.js 18+
- MongoDB (local o Atlas)
- Android Studio + JDK 17 (solo para APK)

---

## 1. Backend

```bash
cd quiz-app/backend
cp .env.example .env        # edita MONGO_URI y JWT_SECRET
npm install
npm run dev                 # puerto 5000
```

---

## 2. Frontend

```bash
cd quiz-app/frontend
npm install
npm run dev                 # puerto 5173 (desarrollo)
```

---

## 3. Generar APK con Capacitor

### Paso 1 — Build del frontend (apunta a mobile/www)
```bash
cd quiz-app/frontend
npm run build
```

### Paso 2 — Instalar dependencias mobile
```bash
cd quiz-app/mobile
npm install
npx cap add android         # solo la primera vez
```

### Paso 3 — Sincronizar con Capacitor
```bash
npx cap sync android
```

### Paso 4 — Generar APK debug
```bash
cd android
./gradlew assembleDebug
# APK en: android/app/build/outputs/apk/debug/app-debug.apk
```

O abrir en Android Studio:
```bash
cd quiz-app/mobile
npx cap open android
# Build > Build APK desde Android Studio
```

> Para producción usa `./gradlew assembleRelease` con keystore firmado.

---

## Estructura del CSV para preguntas

| question | answer1 | answer2 | answer3 | answer4 |
|----------|---------|---------|---------|---------|
| ¿Capital de Francia? | París | Madrid | Roma | Berlín |

- `answer1` siempre es la respuesta correcta.
- El sistema mezcla las opciones automáticamente.

---

## Roles

| Rol | Acceso |
|-----|--------|
| user | Jugar, ver ranking |
| admin | Todo lo anterior + subir preguntas |

---

## Variables de entorno (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizapp
JWT_SECRET=cambia_esto
```

---

## Flujo del juego

1. Login / Registro
2. Seleccionar quiz + ID de sala
3. Lobby — esperar jugadores
4. Un jugador presiona "Iniciar"
5. 10 preguntas × 30 segundos
6. Puntuación = segundos restantes si acierta
7. Resultados finales → guardados en DB
8. Ranking global top 10
