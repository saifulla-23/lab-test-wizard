-- Create custom test categories table
CREATE TABLE public.custom_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom tests table
CREATE TABLE public.custom_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.custom_categories(id) ON DELETE CASCADE,
  code TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  address TEXT,
  assandha_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient test selections table (for tracking test orders)
CREATE TABLE public.patient_test_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  selection_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tests JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_test_selections ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth needs)
CREATE POLICY "Enable read access for all" ON public.custom_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.custom_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.custom_categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.custom_categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all" ON public.custom_tests FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.custom_tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.custom_tests FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.custom_tests FOR DELETE USING (true);

CREATE POLICY "Enable read access for all" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.patients FOR DELETE USING (true);

CREATE POLICY "Enable read access for all" ON public.patient_test_selections FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.patient_test_selections FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.patient_test_selections FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.patient_test_selections FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_custom_categories_updated_at
  BEFORE UPDATE ON public.custom_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_tests_updated_at
  BEFORE UPDATE ON public.custom_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();