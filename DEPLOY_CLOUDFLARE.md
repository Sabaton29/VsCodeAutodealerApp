# Despliegue en Cloudflare (Pages o Wrangler)

Este proyecto genera un directorio `dist/` con el build de Vite. Puedes desplegarlo de dos formas:

1) Cloudflare Pages (recomendado para sitio estático)

- Build command: `npm run build`
- Build output directory: `dist`
- Añade las variables de entorno necesarias (las que usa `vite.config.ts` con `loadEnv`) en la sección Environment de Pages. Si usas variables expuestas al cliente, prefíjalas con `VITE_`.

2) Wrangler / Workers-site (publicar dist como assets)

- Ya existe `wrangler.toml` en la raíz apuntando a `./dist`.
- Pasos:

```powershell
# Instalar wrangler si no está instalado globalmente
npx wrangler --version

# Publicar el contenido de dist
npx wrangler deploy
```

Si quieres usar `wrangler deploy` desde CI asegúrate de configurar la API token (CF_API_TOKEN) en las variables del entorno del CI o de la plataforma.

Notas y advertencias
- No intentes desplegar `backend/server.js` en Workers: usa un servicio Node (Render, Railway, Fly, Cloud Run) para el backend.
- Si prefieres Pages, no uses `npx wrangler deploy` en el build step: Pages hace su propio deploy después del build.
- Revisa `vite.config.ts` y define en Cloudflare/Pages las env vars que uses en build (GEMINI_API_KEY o variables `VITE_...`).

GitHub Actions (quick setup)

Si vas a usar la acción de GitHub incluida en este repo, crea estos Secrets en GitHub (Repository -> Settings -> Secrets -> Actions):

- `CF_PAGES_API_TOKEN` - token de Cloudflare con permisos de Pages Deploy
- `CF_ACCOUNT_ID` - tu Cloudflare account id
- `CF_PROJECT_NAME` - el nombre del proyecto Pages (project name)

La acción `deploy-cloudflare-pages.yml` hace `npm ci`, `npm run build` y publica `./dist` en Pages.
