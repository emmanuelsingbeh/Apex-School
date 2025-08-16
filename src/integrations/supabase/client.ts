import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://peifrrdxgjnsqwekauko.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaWZycmR4Z2puc3F3ZWthdWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg5NTgsImV4cCI6MjA2OTU0NDk1OH0.krcNuBCNoG_NEbExifsjRG8MmGGKchsZPIzdayMEHe0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)