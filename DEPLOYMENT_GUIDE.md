# 🚀 Cloud Deployment Guide — Cold Chain Pro

This project is configured for automated cloud deployment with:
- **Backend**: [Render](https://render.com) (FastAPI + Background ThingSpeak Polling)
- **Frontend**: [Vercel](https://vercel.com) (React + Vite + Tailwind CSS + High-Performance CDN)

---

## Phase 1: Deploy Backend on Render (Free)

1. Open [Render.com](https://dashboard.render.com/) and sign in with your GitHub account.
2. Click **New +** in the top right, then select **Web Service**.
3. Select your repository: `PRAJEENS2024/Cold_Chain_Monitoring`.
4. Configure the service:
   - **Name**: `coldchain-backend` (or your preferred name)
   - **Region**: Choose the region closest to you (e.g., Singapore, Frankfurt, or Oregon)
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

5. Under **Environment Variables**, add the following:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `JWT_SECRET_KEY` | `e8b2c45f9a1d37e69b5c2a1f0d8e4c7b2a9f5d3c1e7a04f8` | Secure encryption secret |
   | `ALGORITHM` | `HS256` | JWT algorithm |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiration (24h) |
   | `CORS_ORIGINS` | `*` | Allows your Vercel domain |
   | `THINGSPEAK_CHANNEL_ID` | `3483882` | Your ESP32 ThingSpeak Channel |
   | `THINGSPEAK_READ_KEY` | `QOJPZL5KTMI8Z8MZ` | ThingSpeak API Read Key |
   | `DEVICE_ONLINE_TIMEOUT_SECONDS` | `90` | Device status timeout |

6. Click **Deploy Web Service**.
7. Once deployed, copy your Render public URL (for example: `https://coldchain-backend.onrender.com`).
   - Test it by opening: `https://coldchain-backend.onrender.com/health` $\rightarrow$ should return `{"status":"healthy"}`.

> **Note**: On the first startup, the backend automatically initializes the database, creates the admin user (`admin` / `admin`), registers `ESP-001`, and seeds all enterprise batches!

---

## Phase 2: Deploy Frontend on Vercel (Free)

1. Open [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Choose `PRAJEENS2024/Cold_Chain_Monitoring` and click **Import**.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://coldchain-backend.onrender.com` *(Replace with your real Render backend URL from Phase 1, without a trailing slash)*
6. Click **Deploy**.
7. In ~60 seconds, Vercel will complete the build and assign your live domain (e.g. `https://cold-chain-monitoring.vercel.app`).

---

## Phase 3: Hardware Verification

- Your physical ESP32 is already programmed to send telemetry to ThingSpeak Channel **3483882**.
- The Render backend will automatically poll new temperature readings and door events every 15 seconds.
- You can access your live Vercel dashboard from any phone, tablet, or PC worldwide to monitor live cold chain metrics!

---

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin`
*(Or sign up with any new account through the `/signup` screen)*
