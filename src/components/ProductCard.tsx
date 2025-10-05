import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  image_url,
  stock,
}: ProductCardProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
      .eq("product_id", id)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (error) {
        toast.error("Failed to update cart");
        return;
      }
    } else {
      // Insert new item
      const { error } = await supabase.from("cart_items").insert({
        user_id: session.user.id,
        product_id: id,
        quantity: 1,
      });

      if (error) {
        toast.error("Failed to add to cart");
        return;
      }
    }

    toast.success("Added to cart!");
    window.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <Card
      onClick={() => navigate(`/product/${id}`)}
      className="group cursor-pointer overflow-hidden border-2 border-foreground transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_hsl(var(--foreground))]"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image_url}
          alt={name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-primary">
            {formatPrice(price)}
          </span>
          <Button
            size="icon"
            onClick={handleAddToCart}
            disabled={stock === 0}
            className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
        {stock < 10 && stock > 0 && (
          <p className="text-xs text-warning mt-2 font-semibold">
            Only {stock} left in stock!
          </p>
        )}
        {stock === 0 && (
          <p className="text-xs text-destructive mt-2 font-semibold">
            Out of stock
          </p>
        )}
      </div>
    </Card>
  );
};
