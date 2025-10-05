import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
}

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setProduct(data);
    } else {
      toast.error("Product not found");
      navigate("/products");
    }
    setIsLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Please sign in to add items to cart");
      navigate("/auth");
      return;
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

      if (error) {
        toast.error("Failed to update cart");
        return;
      }
    } else {
      // Insert new item
      const { error } = await supabase.from("cart_items").insert({
        user_id: session.user.id,
        product_id: product.id,
        quantity: quantity,
      });

      if (error) {
        toast.error("Failed to add to cart");
        return;
      }
    }

    toast.success(`Added ${quantity} item(s) to cart!`);
    window.dispatchEvent(new Event("cart-updated"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p>Product not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 border-2 border-foreground font-bold shadow-[4px_4px_0_0_hsl(var(--foreground))]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image */}
          <Card className="overflow-hidden border-2 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))]">
            <div className="aspect-square bg-muted">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </Card>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge className="mb-3 border-2 border-foreground">
                  {product.category}
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-5xl font-black text-primary mb-4">
                {formatPrice(product.price)}
              </p>
            </div>

            <Card className="p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]">
              <h2 className="text-xl font-bold mb-3">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </Card>

            <Card className="p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-bold">Availability:</span>
                {product.stock > 0 ? (
                  <Badge className="bg-success text-success-foreground border-2 border-foreground">
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge className="bg-destructive text-destructive-foreground border-2 border-foreground">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {product.stock > 0 && (
                <>
                  <div className="mb-6">
                    <label className="font-bold mb-2 block">Quantity:</label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="h-12 w-12 border-2 border-foreground"
                      >
                        -
                      </Button>
                      <span className="text-2xl font-bold w-12 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        disabled={quantity >= product.stock}
                        className="h-12 w-12 border-2 border-foreground"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="w-full h-14 text-lg border-2 border-foreground font-black shadow-[6px_6px_0_0_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_hsl(var(--foreground))]"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </>
              )}
            </Card>

            <div className="bg-muted p-4 rounded-lg border-2 border-foreground">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Free delivery across Kenya
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Secure cash on delivery payment
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  3-5 business days delivery
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
