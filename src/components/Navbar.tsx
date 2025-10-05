import { ShoppingCart, User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCartCount(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCartCount(session.user.id);
      } else {
        setCartCount(0);
      }
    });

    // Listen for in-app cart updates (same-tab)
    const handleCartUpdated = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        fetchCartCount(session.user.id);
      }
    };
    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  // Subscribe to realtime DB changes (cross-tab/device)
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      channel = supabase
        .channel("cart-items-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cart_items",
            filter: `user_id=eq.${session.user.id}`,
          },
          () => fetchCartCount(session.user.id)
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchCartCount = async (userId: string) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", userId);

    if (!error && data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-foreground bg-card shadow-[0_4px_0_0_hsl(var(--foreground))]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-black tracking-tight hover:scale-105 transition-transform"
        >
          Kenya<span className="text-primary">Mart</span>
        </button>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/cart")}
                className="relative border-2 border-foreground hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[2px_2px_0_0_hsl(var(--foreground))] transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs border-2 border-foreground">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-2 border-foreground hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[2px_2px_0_0_hsl(var(--foreground))] transition-all"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-2 border-foreground">
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="border-2 border-foreground font-bold shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] transition-all"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
