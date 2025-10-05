import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package } from "lucide-react";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (!error && data) {
      setOrder(data);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 border-2 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))] text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 mx-auto text-success mb-4" />
            <h1 className="text-4xl font-black mb-2">
              Order <span className="text-primary">Confirmed!</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase
            </p>
          </div>

          <div className="bg-muted p-6 rounded-lg border-2 border-foreground mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5" />
              <span className="font-semibold">Order ID:</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {order.id}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-lg">
              <span>Order Total:</span>
              <span className="font-black text-2xl text-primary">
                {formatPrice(order.total_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-bold">Cash on Delivery</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold capitalize text-warning">{order.status}</span>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded border-2 border-primary mb-6">
            <p className="text-sm font-semibold">
              📦 Your order will be delivered within 3-5 business days
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/orders")}
              variant="outline"
              className="flex-1 border-2 border-foreground font-bold shadow-[4px_4px_0_0_hsl(var(--foreground))]"
            >
              View Orders
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="flex-1 border-2 border-foreground font-bold shadow-[4px_4px_0_0_hsl(var(--foreground))]"
            >
              Continue Shopping
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default OrderConfirmation;
