
// You can deploy without config.js; the app will fall back to localStorage only.

window.LIBRA_CONFIG = {
    supabaseUrl: "https://yhpltqwbdyanpnmpukyt.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocGx0cXdiZHlhbnBubXB1a3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Nzg3OTEsImV4cCI6MjA3NTI1NDc5MX0.Z0kCUtEtskRSkl_8u8bDAg_CeNxXeyN4OlTSQ9S4Y2w",
    // Optional: Provide a userId to scope data per user.
    // Without auth, use a stable string unique to you (e.g., email hash) or leave null for global.
    userId: null
};


