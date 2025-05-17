const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bgtclsztsuodczvwpbyw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJndGNsc3p0c3VvZGN6dndwYnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzAyODgsImV4cCI6MjA1ODMwNjI4OH0.ZVk4wtFMAmHRFN0g6RIdzbCm48myqDvS8uFvWSFrb74';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;