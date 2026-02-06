-- Create currency exchange orders table for advance booking flow
CREATE TABLE public.currency_exchange_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_number TEXT UNIQUE,
  
  -- City & Location
  city TEXT NOT NULL,
  delivery_address TEXT,
  
  -- Currency details
  from_currency TEXT NOT NULL DEFAULT 'INR',
  to_currency TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  converted_amount NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL,
  rate_locked_at TIMESTAMP WITH TIME ZONE,
  rate_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Fees
  service_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  
  -- Payment tracking
  advance_amount NUMERIC NOT NULL,
  advance_paid BOOLEAN DEFAULT false,
  advance_paid_at TIMESTAMP WITH TIME ZONE,
  advance_payment_method TEXT,
  advance_reference TEXT,
  
  balance_amount NUMERIC NOT NULL,
  balance_paid BOOLEAN DEFAULT false,
  balance_paid_at TIMESTAMP WITH TIME ZONE,
  balance_payment_method TEXT,
  balance_reference TEXT,
  
  -- Payee details
  payee_name TEXT,
  payee_address TEXT,
  payee_phone TEXT,
  
  -- Delivery
  delivery_date DATE,
  delivery_time_slot TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Status: draft, rate_locked, advance_paid, balance_paid, scheduled, dispatched, delivered, cancelled
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.currency_exchange_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own orders" 
ON public.currency_exchange_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.currency_exchange_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.currency_exchange_orders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" 
ON public.currency_exchange_orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR is_admin_email());

CREATE POLICY "Admins can update all orders" 
ON public.currency_exchange_orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR is_admin_email());

-- Create order number generation trigger
CREATE OR REPLACE FUNCTION public.generate_exchange_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'FX' || TO_CHAR(NOW(), 'YYYYMMDD') || UPPER(SUBSTRING(NEW.id::text, 1, 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_exchange_order_number_trigger
BEFORE INSERT ON public.currency_exchange_orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_exchange_order_number();

-- Add updated_at trigger
CREATE TRIGGER update_currency_exchange_orders_updated_at
BEFORE UPDATE ON public.currency_exchange_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();