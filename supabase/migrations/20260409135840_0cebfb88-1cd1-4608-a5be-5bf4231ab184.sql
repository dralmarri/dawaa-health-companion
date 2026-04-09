
-- Medications table
CREATE TABLE public.medications (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  form TEXT NOT NULL,
  dosage NUMERIC NOT NULL DEFAULT 0,
  concentration TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  times JSONB NOT NULL DEFAULT '[]',
  start_date TEXT,
  is_chronic BOOLEAN NOT NULL DEFAULT false,
  duration_days INTEGER,
  meal_relation TEXT NOT NULL DEFAULT 'No preference',
  notes TEXT DEFAULT '',
  stock NUMERIC NOT NULL DEFAULT 0,
  initial_stock NUMERIC,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own medications" ON public.medications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Blood pressure readings
CREATE TABLE public.blood_pressure_readings (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  heart_rate INTEGER NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'Morning',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blood_pressure_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own readings" ON public.blood_pressure_readings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Appointments
CREATE TABLE public.appointments (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT,
  specialty TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT DEFAULT '',
  reminder_before TEXT DEFAULT '15',
  notes TEXT DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Lab tests
CREATE TABLE public.lab_tests (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT DEFAULT '',
  file_url TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lab tests" ON public.lab_tests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Dose records
CREATE TABLE public.dose_records (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id TEXT NOT NULL,
  medication_name TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  taken_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dose_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dose records" ON public.dose_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'ar',
  user_name TEXT DEFAULT '',
  notifications BOOLEAN NOT NULL DEFAULT false,
  voice_notifications BOOLEAN NOT NULL DEFAULT false,
  reminder_before TEXT NOT NULL DEFAULT '5',
  escalation_on_missed BOOLEAN NOT NULL DEFAULT false,
  emergency_contact JSONB,
  daily_summary BOOLEAN NOT NULL DEFAULT false,
  daily_summary_time TEXT NOT NULL DEFAULT '08:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
