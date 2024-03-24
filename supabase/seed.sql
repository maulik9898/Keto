-- Create the licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hardware_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);