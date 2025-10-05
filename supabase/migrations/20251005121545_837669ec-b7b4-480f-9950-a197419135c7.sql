-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read access)
CREATE POLICY "Products are viewable by everyone"
  ON public.products
  FOR SELECT
  USING (true);

-- RLS Policies for cart_items (users can only see their own cart)
CREATE POLICY "Users can view their own cart items"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for orders (users can only see their own orders)
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for order_items (users can only see their own order items)
CREATE POLICY "Users can view their own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample products with KES prices
INSERT INTO public.products (name, description, price, image_url, stock, category) VALUES
('Laptop Pro 15"', 'High-performance laptop with 16GB RAM and 512GB SSD', 125000.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 25, 'Electronics'),
('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 2500.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 100, 'Electronics'),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches', 8500.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', 50, 'Electronics'),
('USB-C Hub', '7-in-1 USB-C hub with HDMI and card readers', 4200.00, 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800', 75, 'Electronics'),
('Smartphone X Pro', 'Latest smartphone with 5G and 128GB storage', 65000.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 40, 'Electronics'),
('Wireless Earbuds', 'Noise-cancelling wireless earbuds with charging case', 12000.00, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 120, 'Electronics'),
('Backpack Pro', 'Water-resistant laptop backpack with USB charging port', 5500.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 60, 'Accessories'),
('Smartwatch', 'Fitness tracking smartwatch with heart rate monitor', 18000.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 35, 'Electronics');