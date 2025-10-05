// Copy this file to config.js and fill in your Supabase project settings.
// You can deploy without config.js; the app will fall back to localStorage only.

window.LIBRA_CONFIG = {
    supabaseUrl: "https://yhpltqwbdyanpnmpukyt.supabase.co",
    supabaseAnonKey: process.env.SUPABASE_KEY,
    // Optional: Provide a userId to scope data per user.
    // Without auth, use a stable string unique to you (e.g., email hash) or leave null for global.
    userId: null
};


