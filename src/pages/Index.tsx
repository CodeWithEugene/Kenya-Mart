import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(4)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFeaturedProducts(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Shop Smart,
            <br />
            <span className="text-primary">Shop KenyaMart</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your trusted e-commerce platform for electronics and accessories. Fast delivery across Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/products")}
              className="text-lg h-14 px-8 border-2 border-foreground font-black shadow-[6px_6px_0_0_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_hsl(var(--foreground))]"
            >
              Browse Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/products")}
              className="text-lg h-14 px-8 border-2 border-foreground font-bold shadow-[6px_6px_0_0_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_hsl(var(--foreground))]"
            >
              View Deals
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted py-12 border-y-4 border-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg border-2 border-foreground mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Quick checkout and instant order confirmation
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg border-2 border-foreground mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">
                Safe and secure cash on delivery
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg border-2 border-foreground mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
                <Truck className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Free Delivery</h3>
              <p className="text-muted-foreground">
                Fast and free delivery across Kenya
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black mb-2">
              Featured <span className="text-primary">Products</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Check out our latest and greatest deals
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            className="border-2 border-foreground font-bold shadow-[4px_4px_0_0_hsl(var(--foreground))]"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 border-y-4 border-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-primary-foreground mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Kenya
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/products")}
            className="text-lg h-14 px-8 border-2 border-foreground font-black shadow-[6px_6px_0_0_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_hsl(var(--foreground))]"
          >
            Shop Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 border-t-4 border-foreground">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl font-black mb-2">
            Kenya<span className="text-primary">Mart</span>
          </p>
          <p className="text-sm opacity-80">
            © 2025 KenyaMart. All rights reserved. Built with Lovable.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
