-- First, drop foreign key constraints
ALTER TABLE public.academic_records DROP CONSTRAINT IF EXISTS academic_records_student_id_fkey;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_academic_record_id_fkey;

-- Remove auto-generation of UUIDs and allow manual ID insertion
ALTER TABLE public.students ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.academic_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.courses ALTER COLUMN id DROP DEFAULT;

-- Change ID columns to TEXT to allow manual IDs
ALTER TABLE public.students ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.academic_records ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.academic_records ALTER COLUMN student_id TYPE TEXT;
ALTER TABLE public.courses ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.courses ALTER COLUMN academic_record_id TYPE TEXT;

-- Recreate foreign key constraints with TEXT types
ALTER TABLE public.academic_records 
ADD CONSTRAINT academic_records_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.courses 
ADD CONSTRAINT courses_academic_record_id_fkey 
FOREIGN KEY (academic_record_id) REFERENCES public.academic_records(id) ON DELETE CASCADE;