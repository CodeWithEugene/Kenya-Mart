import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkAuthAndFetchCart();
  }, []);

  const checkAuthAndFetchCart = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        product:products (
          id,
          name,
          price
        )
      `
      )
      .eq("user_id", session.user.id);

    if (!error && data) {
      setCartItems(data as unknown as CartItem[]);
      if (data.length === 0) {
        navigate("/cart");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: session.user.id,
        total_amount: calculateTotal(),
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      toast.error("Failed to create order");
      setIsProcessing(false);
      return;
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      toast.error("Failed to create order items");
      setIsProcessing(false);
      return;
    }

    // Clear cart
    const { error: clearError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", session.user.id);

    if (clearError) {
      toast.error("Failed to clear cart");
      setIsProcessing(false);
      return;
    }

    toast.success("Order placed successfully!");
    window.dispatchEvent(new Event("cart-updated"));
    navigate(`/order-confirmation/${order.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-black mb-8">
          <span className="text-primary">Checkout</span>
        </h1>

        <Card className="p-6 border-2 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))] mb-6">
          <h2 className="text-2xl font-black mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span className="font-bold">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-foreground pt-4">
            <div className="flex justify-between text-2xl mb-2">
              <span className="font-bold">Total</span>
              <span className="font-black text-primary">
                {formatPrice(calculateTotal())}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Free delivery • Secure checkout
            </p>
          </div>
        </Card>

        <Card className="p-6 border-2 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))] mb-6">
          <h2 className="text-xl font-bold mb-4">Payment Method</h2>
          <div className="space-y-3">
            <div className="p-4 border-2 border-primary bg-primary/5 rounded font-semibold">
              <CheckCircle className="inline mr-2 h-5 w-5 text-primary" />
              Cash on Delivery
            </div>
            <p className="text-sm text-muted-foreground">
              Pay with cash when your order arrives
            </p>
          </div>
        </Card>

        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="w-full h-14 text-lg border-2 border-foreground font-black shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_hsl(var(--foreground))]"
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>
      </main>
    </div>
  );
};

export default Checkout;
