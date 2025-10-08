## 📚 Libra — Personal Library Web App

Minimalist personal library manager with a 2025-style UI. Add books with covers, track reading status, filter/search, and persist data locally or via Supabase. Easily deployable as a static site (Vercel-ready).

### ✨ Highlights
- **Book CRUD-lite**: add and delete books with title, author, genre, cover, description
- **Status tracking**: to-read → ongoing → read (toggle on card or in modal)
- **Fast search & filters**: title/author search, status tabs, genre select
- **Images**: upload a file or paste a cover URL (with preview)
- **Persistence**: localStorage by default; optional Supabase integration
- **Responsive UI**: Tailwind-based, modern micro-animations

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ (for building Tailwind)
- npm (or yarn/pnpm)

### Install
```bash
git clone https://github.com/yourusername/libra-personallibrary-main.git
cd libra-personallibrary-main
npm install
```

### Build CSS (Tailwind)
```bash
npm run build
# or live rebuild during development
npm run build:css
```

### Run Locally (static)
Open `public/index.html` directly in a browser, or serve the `public/` folder:
```bash
npx serve public
# or
python -m http.server 8000 --directory public
# or
php -S localhost:8000 -t public
```

---

## ⚙️ Configuration (Optional)

By default, data is stored in the browser’s localStorage under key `libra_books`.

To enable Supabase storage, create `public/config.js` with your settings. Example:

```html
<script src="config.js" defer></script>
```

```js
// public/config.js
// You can deploy without config.js; app will fall back to localStorage only.
window.LIBRA_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_KEY",
  // Optional: provide a user identifier to scope data per user
  userId: null
};
```

Notes:
- When `LIBRA_CONFIG.supabaseUrl` and `supabaseAnonKey` are present, the app will read/write the `books` table in Supabase.
- Without `config.js`, all data remains local to the browser.
- Never put confidential keys in a public static site. Supabase anon keys are public by design, but apply Row Level Security as needed.

---

## 🧱 Project Structure

```
libra-personallibrary-main/
├── public/
│   ├── index.html        # App shell (loads Tailwind CSS + scripts)
│   ├── app.js            # App logic (LibraLibrary class)
│   ├── styles.css        # Built Tailwind output
│   └── config.js         # Optional Supabase config (gitignore this in your repo)
├── src/
│   └── input.css         # Tailwind input
├── tailwind.config.js    # Tailwind theme (colors, animations, etc.)
├── vercel.json           # Static hosting config (Vercel)
├── package.json          # Scripts and dev deps
└── README.md
```

Key entry points:
- `public/index.html` wires the UI and loads scripts (including optional `config.js` and Supabase CDN).
- `public/app.js` defines `LibraLibrary` for state, rendering, modals, search/filters, toasts, and persistence.

---

## 📦 NPM Scripts

- `build`: compile Tailwind from `src/input.css` to `public/styles.css`
- `build:css`: compile in watch mode during development
- `vercel-build`: alias used by Vercel to run `build`

---

## 🌐 Deploy

### Deploy to Vercel (static)
Vercel automatically serves everything in `public/`. This repo includes `vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "public/**", "use": "@vercel/static" }],
  "routes": [{ "src": "/(.*)", "dest": "/public/$1" }],
  "outputDirectory": "public"
}
```

Steps:
1. Push your repo to GitHub/GitLab/Bitbucket.
2. Import into Vercel → New Project → framework: "Other" (static).
3. Build command: `npm run vercel-build` (or `npm run build`).
4. Output directory: `public`.

CLI alternative:
```bash
npm i -g vercel
vercel
```

---

## 🛠️ Customization Tips

- Theme/colors/animations: edit `tailwind.config.js`
- Utility classes or base styles: edit `src/input.css` and rebuild
- UI markup: edit `public/index.html`
- App logic and UI rendering: extend `LibraLibrary` in `public/app.js`

---

## 🔍 How It Works (Brief)

- On load, `LibraLibrary.init()` sets up optional Supabase client, loads books (Supabase → `books` table or localStorage), attaches event listeners, renders sections, and updates counts.
- Card/menu actions call methods like `toggleBookStatus`, `deleteBook`, and `showBookDetails`.
- File uploads are converted to data URLs for local storage; URL cover images are used as-is.
- Toast component provides feedback on success/error actions.

---

## ❓ Troubleshooting

- Blank styles or unstyled UI: run `npm run build` to generate `public/styles.css`.
- Changes to theme not reflected: rebuild Tailwind (`npm run build` or `build:css`).
- Supabase not used: ensure `public/config.js` is loaded and includes valid `supabaseUrl` and `supabaseAnonKey`.
- CORS or 401 with Supabase: verify your anon key, table name `books`, and RLS policies.
- Images not showing: ensure the URL is reachable; file uploads are limited to ~5MB.

---

## 📄 License

MIT

---

## 🙌 Credits

- Tailwind CSS
- Font Awesome
- Unsplash (sample covers)
- Vercel (static hosting)

— Happy reading!
