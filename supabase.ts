
import { createClient } from '@supabase/supabase-js';

// Thông tin kết nối Supabase thực tế từ người dùng
const SUPABASE_URL = 'https://iqusdklftkjrvwdspuvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdXNka2xmdGtqcnZ3ZHNwdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNjMxMDUsImV4cCI6MjA4MjczOTEwNX0.BQ8ggeTH5Esl99meodGJnA_S5q9thLUE5eXdGQBITAk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
