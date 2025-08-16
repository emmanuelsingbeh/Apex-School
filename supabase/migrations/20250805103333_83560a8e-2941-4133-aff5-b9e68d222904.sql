-- Remove auto-generation of UUIDs and allow manual ID insertion for students table
ALTER TABLE public.students ALTER COLUMN id DROP DEFAULT;

-- Remove auto-generation of UUIDs and allow manual ID insertion for academic_records table  
ALTER TABLE public.academic_records ALTER COLUMN id DROP DEFAULT;

-- Remove auto-generation of UUIDs and allow manual ID insertion for courses table
ALTER TABLE public.courses ALTER COLUMN id DROP DEFAULT;

-- Also change the ID columns to TEXT instead of UUID to allow any manual ID format
ALTER TABLE public.students ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.academic_records ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.academic_records ALTER COLUMN student_id TYPE TEXT;
ALTER TABLE public.courses ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.courses ALTER COLUMN academic_record_id TYPE TEXT;