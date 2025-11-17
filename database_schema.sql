-- MediBot Database Schema
-- This file contains all the necessary tables, indexes, and policies for the MediBot application

-- Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    medical_history TEXT DEFAULT '',
    symptoms TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacy Admin Profiles Table
CREATE TABLE IF NOT EXISTS pharmacy_admin_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pharmacy_id UUID,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Super Admin Profiles Table
CREATE TABLE IF NOT EXISTS super_admin_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    permissions TEXT[] DEFAULT ARRAY['all'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Healthcare Provider Profiles Table
CREATE TABLE IF NOT EXISTS healthcare_provider_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT DEFAULT 'General Practice',
    license_number TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacies Table
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    phone TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    stock INTEGER DEFAULT 0,
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    customer_name TEXT DEFAULT '',
    customer_phone TEXT DEFAULT '',
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'mobile_money')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'family')),
    price_rwf NUMERIC NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_admin_profiles_user_id ON pharmacy_admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_profiles_user_id ON super_admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_provider_profiles_user_id ON healthcare_provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_pharmacy_id ON medicines(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_staff_pharmacy_id ON staff(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_status ON pharmacies(status);

-- Row Level Security Policies
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_profiles
DROP POLICY IF EXISTS "Users can view their own patient profile" ON patient_profiles;
DROP POLICY IF EXISTS "Users can update their own patient profile" ON patient_profiles;
DROP POLICY IF EXISTS "Users can insert their own patient profile" ON patient_profiles;
DROP POLICY IF EXISTS "Super admins can manage all patient profiles" ON patient_profiles;

CREATE POLICY "Users can view their own patient profile" ON patient_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient profile" ON patient_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patient profile" ON patient_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all patient profiles" ON patient_profiles
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));

-- RLS Policies for pharmacy_admin_profiles
DROP POLICY IF EXISTS "Pharmacy admins can view their own profile" ON pharmacy_admin_profiles;
DROP POLICY IF EXISTS "Pharmacy admins can update their own profile" ON pharmacy_admin_profiles;
DROP POLICY IF EXISTS "Pharmacy admins can insert their own profile" ON pharmacy_admin_profiles;
DROP POLICY IF EXISTS "Super admins can manage all pharmacy admin profiles" ON pharmacy_admin_profiles;

CREATE POLICY "Pharmacy admins can view their own profile" ON pharmacy_admin_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pharmacy admins can update their own profile" ON pharmacy_admin_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Pharmacy admins can insert their own profile" ON pharmacy_admin_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all pharmacy admin profiles" ON pharmacy_admin_profiles
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));

-- RLS Policies for super_admin_profiles
DROP POLICY IF EXISTS "Super admins can view their own profile" ON super_admin_profiles;
DROP POLICY IF EXISTS "Super admins can update their own profile" ON super_admin_profiles;
DROP POLICY IF EXISTS "Super admins can insert their own profile" ON super_admin_profiles;

CREATE POLICY "Super admins can view their own profile" ON super_admin_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can update their own profile" ON super_admin_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can insert their own profile" ON super_admin_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for healthcare_provider_profiles
DROP POLICY IF EXISTS "Healthcare providers can view their own profile" ON healthcare_provider_profiles;
DROP POLICY IF EXISTS "Healthcare providers can update their own profile" ON healthcare_provider_profiles;
DROP POLICY IF EXISTS "Healthcare providers can insert their own profile" ON healthcare_provider_profiles;
DROP POLICY IF EXISTS "Super admins can manage all healthcare provider profiles" ON healthcare_provider_profiles;

CREATE POLICY "Healthcare providers can view their own profile" ON healthcare_provider_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Healthcare providers can update their own profile" ON healthcare_provider_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Healthcare providers can insert their own profile" ON healthcare_provider_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all healthcare provider profiles" ON healthcare_provider_profiles
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));

-- RLS Policies for pharmacies
DROP POLICY IF EXISTS "Super admins can manage all pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Pharmacy admins can view their own pharmacy" ON pharmacies;
DROP POLICY IF EXISTS "Pharmacy admins can update their own pharmacy" ON pharmacies;
DROP POLICY IF EXISTS "Public can view approved pharmacies" ON pharmacies;

CREATE POLICY "Super admins can manage all pharmacies" ON pharmacies
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Pharmacy admins can view their own pharmacy" ON pharmacies
    FOR SELECT USING (id IN (SELECT pharmacy_id FROM pharmacy_admin_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Pharmacy admins can update their own pharmacy" ON pharmacies
    FOR UPDATE USING (id IN (SELECT pharmacy_id FROM pharmacy_admin_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Public can view approved pharmacies" ON pharmacies
    FOR SELECT USING (status = 'approved');

-- RLS Policies for medicines
DROP POLICY IF EXISTS "Pharmacy admins can manage medicines in their pharmacy" ON medicines;
DROP POLICY IF EXISTS "Super admins can manage all medicines" ON medicines;

CREATE POLICY "Pharmacy admins can manage medicines in their pharmacy" ON medicines
    FOR ALL USING (pharmacy_id IN (SELECT pharmacy_id FROM pharmacy_admin_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Super admins can manage all medicines" ON medicines
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));

-- RLS Policies for staff
DROP POLICY IF EXISTS "Pharmacy admins can manage staff in their pharmacy" ON staff;
DROP POLICY IF EXISTS "Super admins can manage all staff" ON staff;

CREATE POLICY "Pharmacy admins can manage staff in their pharmacy" ON staff
    FOR ALL USING (pharmacy_id IN (SELECT pharmacy_id FROM pharmacy_admin_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Super admins can manage all staff" ON staff
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));

-- RLS Policies for prescriptions
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Healthcare providers can view prescriptions they created" ON prescriptions;
DROP POLICY IF EXISTS "Super admins can manage all prescriptions" ON prescriptions;

CREATE POLICY "Users can view their own prescriptions" ON prescriptions
    FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Healthcare providers can view prescriptions they created" ON prescriptions
    FOR SELECT USING (doctor_name IN (SELECT name FROM healthcare_provider_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Super admins can manage all prescriptions" ON prescriptions
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));

-- RLS Policies for sales
DROP POLICY IF EXISTS "Pharmacy admins can manage sales in their pharmacy" ON sales;
DROP POLICY IF EXISTS "Super admins can manage all sales" ON sales;

CREATE POLICY "Pharmacy admins can manage sales in their pharmacy" ON sales
    FOR ALL USING (pharmacy_id IN (SELECT pharmacy_id FROM pharmacy_admin_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Super admins can manage all sales" ON sales
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));

-- RLS Policies for subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Super admins can manage all subscriptions" ON subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can update their own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Super admins can manage all subscriptions" ON subscriptions
    FOR ALL USING (EXISTS (SELECT 1 FROM super_admin_profiles WHERE user_id = auth.uid()));

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_metadata->>'role' = 'patient' THEN
    INSERT INTO public.patient_profiles (user_id, medical_history, symptoms)
    VALUES (NEW.id, '', '');
  ELSIF NEW.user_metadata->>'role' = 'pharmacy_admin' THEN
    INSERT INTO public.pharmacy_admin_profiles (user_id, pharmacy_id, name)
    VALUES (NEW.id, NULL, COALESCE(SPLIT_PART(NEW.email, '@', 1), 'Pharmacy Admin'));
  ELSIF NEW.user_metadata->>'role' = 'super_admin' THEN
    INSERT INTO public.super_admin_profiles (user_id, name, permissions)
    VALUES (NEW.id, COALESCE(SPLIT_PART(NEW.email, '@', 1), 'Super Admin'), ARRAY['all']);
  ELSIF NEW.user_metadata->>'role' = 'healthcare_provider' THEN
    INSERT INTO public.healthcare_provider_profiles (user_id, name, specialty, license_number)
    VALUES (NEW.id, COALESCE(SPLIT_PART(NEW.email, '@', 1), 'Healthcare Provider'), 'General Practice', '');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for testing
-- Sample pharmacies in Rwanda
INSERT INTO pharmacies (name, email, location, latitude, longitude, status) VALUES
('MediCare Pharmacy', 'admin@medicare.com', 'Kigali, Rwanda', -1.9441, 30.0619, 'approved'),
('Rwanda Health Pharmacy', 'info@rwandahealth.com', 'Musanze, Rwanda', -1.4998, 29.6357, 'approved'),
('Kigali Central Pharmacy', 'contact@kigalicentral.com', 'Kigali City Center, Rwanda', -1.9579, 30.1127, 'approved'),
('Eastern Pharmacy', 'eastern@pharma.rw', 'Rwamagana, Rwanda', -1.9487, 30.4347, 'approved'),
('Western Pharmacy Hub', 'western@pharma.rw', 'Rubavu, Rwanda', -1.6898, 29.2687, 'approved'),
('Southern Medical Store', 'southern@medstore.rw', 'Huye, Rwanda', -2.5969, 29.7394, 'approved')
ON CONFLICT DO NOTHING;

-- Sample medicines for the pharmacy
INSERT INTO medicines (name, description, price, stock, pharmacy_id) VALUES
('Aspirin', 'Pain relief medication', 2500, 100, (SELECT id FROM pharmacies WHERE name = 'MediCare Pharmacy' LIMIT 1)),
('Ibuprofen', 'Anti-inflammatory medication', 3200, 75, (SELECT id FROM pharmacies WHERE name = 'MediCare Pharmacy' LIMIT 1)),
('Paracetamol', 'Fever reducer', 1800, 150, (SELECT id FROM pharmacies WHERE name = 'MediCare Pharmacy' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Sample subscriptions (monthly plans)
INSERT INTO subscriptions (patient_id, plan_name, plan_type, price_rwf, status, end_date) VALUES
('00000000-0000-0000-0000-000000000000', 'Basic Health Plan', 'basic', 500, 'active', NOW() + INTERVAL '1 month'),
('00000000-0000-0000-0000-000000000000', 'Premium Health Plan', 'premium', 1000, 'active', NOW() + INTERVAL '1 month'),
('00000000-0000-0000-0000-000000000000', 'Family Health Plan', 'family', 1500, 'active', NOW() + INTERVAL '1 month')
ON CONFLICT DO NOTHING;

-- Sample staff for the pharmacy
INSERT INTO staff (name, email, role, status, pharmacy_id) VALUES
('John Doe', 'john@medicare.com', 'Pharmacist', 'active', (SELECT id FROM pharmacies WHERE name = 'MediCare Pharmacy' LIMIT 1)),
('Jane Smith', 'jane@medicare.com', 'Assistant', 'active', (SELECT id FROM pharmacies WHERE name = 'MediCare Pharmacy' LIMIT 1))
ON CONFLICT DO NOTHING;
