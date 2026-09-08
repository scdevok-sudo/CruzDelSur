# Deploy Checklist — Cruz del Sur

## Pre-deploy

- [ ] Correr `npm run build` sin errores
- [ ] Correr `npm run lint` sin errores
- [ ] Verificar `.env.production` con las claves de producción de Supabase
      (plantilla en `.env.example`; el archivo real no se versiona)
- [ ] Ejecutar `supabase-migration-v2.sql` en el SQL Editor de Supabase producción
      (crea `excepciones_disponibilidad` y las columnas de precio/foto)
- [ ] Ejecutar `supabase/rls-produccion.sql` en el SQL Editor de Supabase producción
- [ ] Correr `SUPABASE_SERVICE_ROLE_KEY=... npm run seed:prod` para poblar la DB de producción
      (probar antes con `npm run seed:prod -- --dry-run`)
- [ ] Confirmar que el número de WhatsApp del consultorio está cargado en `VITE_CONSULTORIO_WA_NUMBER`

## Deploy en Vercel

1. Push a `main` en GitHub
2. Vercel detecta el push y buildea automáticamente
3. Configurar las variables de entorno en Vercel Dashboard → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CONSULTORIO_WA_NUMBER`
   - `VITE_APP_ENV=production`
4. Verificar que `vercel.json` está en la raíz (sin el rewrite, `/turno` o `/secretaria`
   dan 404 al entrar por URL directa)

## Post-deploy

- [ ] Abrir `/turno` y hacer un turno de prueba end-to-end
- [ ] Verificar que el turno aparece en `/secretaria`
- [ ] Verificar que no hay errores en la consola del navegador
- [ ] Probar la turnera en un celular real (viewport 390px)
- [ ] Borrar el turno de prueba de la DB
- [ ] Compartir la URL con Flor para validación antes de conectar el bot

## Cuando el número de WhatsApp esté listo

- [ ] Levantar Evolution API en Railway (instancia separada)
- [ ] Conectar el número escaneando el QR desde `/api/instance/qr`
- [ ] Configurar el webhook hacia n8n
- [ ] Activar los 3 workflows de n8n (ver `n8n/README.md`)
- [ ] Los textos de los mensajes están en `src/lib/whatsapp.js` — mantenerlos sincronizados con n8n

## Notas

- `VITE_APP_ENV=production` oculta el botón de fallback "Escribir al consultorio por WhatsApp"
  en la pantalla de turno confirmado. Mientras el bot no esté conectado, se puede dejar
  `VITE_APP_ENV=staging` para que el paciente tenga esa salida manual.
- El sitio está con `<meta name="robots" content="noindex">` hasta que el cliente decida indexarlo.
- Todavía no hay auth: `/secretaria`, `/agenda` y `/admin` son accesibles por URL directa.
  Es lo previsto para Fase 1; el login llega en Fase 2.
