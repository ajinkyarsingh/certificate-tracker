# Student Achievement Tracker

Full-stack web app for students to upload achievement certificates (PDF or images), with a **faculty panel** for moderating submissions, **app-admin** user promotion, and a leaderboard. Built with **React (Vite)**, **Tailwind CSS v4**, **Firebase** (Authentication + Firestore), and **Cloudinary** for media uploads.

## Features

- **Google sign-in** via Firebase Authentication  
- **Roles** — `student` or `faculty` stored in Firestore `users/{uid}`; first sign-in creates a **student** profile  
- **App admins** (`VITE_ADMIN_EMAILS`, aligned with `firestore.rules`) — **Admin** screen at `/admin` to promote users to **faculty** or demote to student  
- **Faculty Panel** (`/faculty`) — table of all achievements (newest first), filters (name/email, category, achievement date range), **View** (Cloudinary URL) and **Delete**; only users with `role: faculty`  
- **Optional domain restriction** — only emails matching `VITE_ALLOWED_EMAIL_DOMAINS` can sign in  
- **Student dashboard** — form (title, description, date, category), image preview, **unsigned Cloudinary upload**, metadata in Firestore, list and delete **own** entries only (deleting only removes the Firestore row; Cloudinary assets are left as-is)  
- **Leaderboard** — top students by upload count (`userStats` collection)  
- **Dark / light** theme (persisted)  
- **Responsive** card layout  
- **Validation** — PDF + common image types only, **5 MB** max (enforced in UI and `cloudinaryService`)  

## Prerequisites

- Node.js 20+ recommended  
- A [Firebase](https://console.firebase.google.com/) project  
- A [Cloudinary](https://cloudinary.com/) account with an **unsigned** upload preset  

## 1. Clone and install

```bash
cd "Certificate tracker"
npm install
```

## 2. Firebase (Auth + Firestore only)

1. Create a project in the Firebase console.  
2. **Authentication → Sign-in method** — enable **Google**.  
3. **Firestore Database** — create a database (production mode), pick a region.  
4. **Project settings → Your apps** — add a **Web** app and copy config into `.env`.  
5. You do **not** need Firebase Storage for this app.  

## 3. Cloudinary

1. In the [Cloudinary Console](https://console.cloudinary.com/), note your **Cloud name**.  
2. **Settings → Upload → Upload presets** — add a preset, set signing mode to **Unsigned**, and allow resource types you need (e.g. image + raw for PDF).  
3. Put `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env`.  

## 4. Environment variables

```bash
copy .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_*` | Web app config from Firebase (see `.env.example`; `VITE_FIREBASE_STORAGE_BUCKET` is optional). |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name. |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name. |
| `VITE_ADMIN_EMAILS` | Comma-separated **app super-admin** emails (**lowercase**). Must match `isAppAdmin()` in `firestore.rules` — used to manage user roles, not for faculty day-to-day moderation. |
| `VITE_ALLOWED_EMAIL_DOMAINS` | Optional sign-in restriction (see `.env.example`). |

## 5. Firestore security rules

Edit `firestore.rules` and set the same admin emails as `VITE_ADMIN_EMAILS`. Deploy:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

## 6. Run locally

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Visit `/setup` to confirm Firebase + Cloudinary env vars are detected.

## 7. Build for production

```bash
npm run build
```

Output is in `dist/`.

## Deployment

### Firebase Hosting

```bash
firebase deploy --only hosting
```

Add your production URL under **Authentication → Settings → Authorized domains**.

### Vercel

Set all `VITE_*` variables in the project settings. `vercel.json` includes SPA rewrites.

## Project structure

```
src/
  services/
    firebase.ts          # Auth + Firestore only
    cloudinaryService.ts # Unsigned upload + file validation
    achievementService.ts
    userService.ts       # users collection + role updates
  context/
    UserProfileContext.tsx
  hooks/
    useUserRole.ts
  pages/
    FacultyPanel.tsx
    AdminUsersPage.tsx
  ...
firestore.rules
firestore.indexes.json
firebase.json
```

## Data model

- **`users/{userId}`** — `userId`, `name`, `email`, `role` (`student` \| `faculty`), `createdAt` on first create.  
- **`achievements`** — `userId`, `userEmail`, `userName`, form fields, **`fileUrl`** (Cloudinary `secure_url`), **`fileType`** (`image` \| `pdf`), `fileName`, `mimeType`, `createdAt`.  
- **`userStats/{userId}`** — `displayName`, `email`, `count`.  

## Troubleshooting

- **Upload errors** — Check Cloudinary preset is **unsigned**, allowed formats, and max size (app limits to 5 MB; you can also set limits on the preset).  
- **Permission denied (Firestore)** — Deploy rules; ensure `VITE_ADMIN_EMAILS` matches `isAppAdmin()` in rules. Faculty must have `users/{uid}.role == 'faculty'`.  
- **Missing index** — Deploy `firestore.indexes.json` or use the console link from the error.  

## License

Private / your institution — adjust as needed.
