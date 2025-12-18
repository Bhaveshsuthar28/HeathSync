# HeathSync

## Deploy on Render (Backend + Aiven MySQL)

### Backend (Spring Boot)
- Create a **Web Service** on Render
- **Root Directory:** `Backend`
- **Runtime:** Docker (uses `Backend/Dockerfile`)

#### Required Environment Variables (Render → Service → Environment)
- `DB_URL` = `jdbc:mysql://<AIVEN_HOST>:<AIVEN_PORT>/<DB_NAME>?sslMode=REQUIRED`
- `DB_USER` = your Aiven username
- `DB_PASS` = your Aiven password
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `CORS_ALLOWED_ORIGINS` = your frontend URL (example: `https://your-frontend.onrender.com`)
- (If using Cloudinary) `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Render automatically provides `PORT`.

#### Aiven note
If the backend can’t connect, make sure your Aiven MySQL **allowlist** permits Render’s outbound IPs (or temporarily `0.0.0.0/0` for testing).

### Frontend (Vite)
- Create a **Static Site** on Render
- **Root Directory:** `frontend`
- **Build Command:** `npm ci && npm run build`
- **Publish Directory:** `dist`
- Set `VITE_BASE_URL` to your backend URL (example: `https://your-backend.onrender.com/api/v1`)

## Local development
- Backend env template: `Backend/.env.example`
- Copy to `Backend/.env` and fill values (do not commit secrets)