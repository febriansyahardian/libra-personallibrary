
// You can deploy without config.js; the app will fall back to localStorage only.

window.LIBRA_CONFIG = {
    supabaseUrl: "https://pxahccjbsxcrjedmeuwz.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4YWhjY2pic3hjcmplZG1ldXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODc3NzQsImV4cCI6MjA3NTI2Mzc3NH0.764P3u-K3ExXhyp6pJijTjs1HGtyRaIZpkA3A7dKkU4",
    // Optional: Provide a userId to scope data per user.
    // Without auth, use a stable string unique to you (e.g., email hash) or leave null for global.
    userId: null
};


