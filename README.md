## Kenya‑Mart

A modern, mobile‑first e‑commerce web app for electronics and accessories in Kenya. Built with React + TypeScript, Vite, Tailwind CSS, shadcn/ui, and Supabase for authentication, data and realtime.

Repository: https://github.com/CodeWithEugene/Kenya-Mart

### Features

- Customer‑facing storefront with product listing, detail pages, and cart/checkout
- Secure authentication (email/password) via Supabase Auth
- Shopping cart with real‑time badge updates in the navbar
  - Same‑tab updates via `cart-updated` window event
  - Cross‑tab/device updates via Supabase Realtime on `cart_items`
- Order placement flow with order confirmation and order history
- Responsive UI built with Tailwind CSS and shadcn/ui components
- Client‑side routing with React Router v6
- Production‑ready Vercel config (SPA rewrites for deep links/refresh)

### Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui (Radix primitives)
- Supabase (Postgres, Auth, Realtime, JS client)
- React Router v6

### Project Structure

```
src/
  components/
    Navbar.tsx
    ProductCard.tsx
    Footer.tsx
    ui/*                 # shadcn/ui generated primitives
  hooks/
  integrations/
    supabase/
      client.ts         # Supabase client initialization
      types.ts
  pages/
    Index.tsx           # Home/landing
    Products.tsx        # Catalog
    ProductDetail.tsx   # PDP with Add to Cart
    Cart.tsx            # Cart & quantity management
    Checkout.tsx        # Place order
    OrderConfirmation.tsx
    Orders.tsx          # Order history
    Auth.tsx            # Sign in / Sign up
    NotFound.tsx
```

### Getting Started

#### Prerequisites

- Node.js 18+
- A Supabase project (URL + anon key)

#### Install

```bash
npm install
```

#### Environment

Create `.env` (or `.env.local`) at the project root with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The client reads these from `import.meta.env` in `src/integrations/supabase/client.ts`.

#### Run Dev Server

```bash
npm run dev
```

- App runs at http://localhost:5173 by default

#### Build

```bash
npm run build
npm run preview
```

### Database Schema (Supabase)

The app expects the following core tables (simplified):

- `products` (
  `id` uuid primary key,
  `name` text,
  `description` text,
  `price` numeric,
  `image_url` text,
  `stock` integer,
  `category` text,
  `created_at` timestamptz default now()
)

- `cart_items` (
  `id` uuid primary key,
  `user_id` uuid references `auth.users` (user),
  `product_id` uuid references `products`(id),
  `quantity` integer
)

- `orders` (
  `id` uuid primary key,
  `user_id` uuid references `auth.users` (user),
  `total_amount` numeric,
  `status` text, -- e.g. pending/confirmed/delivered
  `created_at` timestamptz default now()
)

- `order_items` (
  `id` uuid primary key,
  `order_id` uuid references `orders`(id),
  `product_id` uuid references `products`(id),
  `quantity` integer,
  `price` numeric
)

You can adapt your actual schema or run migrations from `supabase/migrations` if provided.

#### Realtime

The navbar subscribes to Supabase Realtime on `cart_items` filtered by the signed‑in `user_id`, and also listens for a window `cart-updated` event fired by add‑to‑cart flows. Ensure Realtime is enabled for your project and table.

### Deployment

#### Vercel

This is a Single Page Application (SPA) built with React Router. To support deep links and refreshes in production, a rewrite is included:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

- Commit `vercel.json` at the repository root (already included here)
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in Vercel
- Deploy

### Key UX Notes

- The cart button badge in the navbar reflects the total quantity across all cart items for the current user.
- Adding/removing items dispatches `window.dispatchEvent(new Event("cart-updated"))` for instant same‑tab updates.
- Cross‑tab/device updates rely on Supabase Realtime.

### Scripts

- `npm run dev` – start the dev server
- `npm run build` – build for production
- `npm run preview` – preview the production build locally
- `npm run lint` – run eslint

### Contributing

Issues and pull requests are welcome. Please open an issue to discuss substantial changes before submitting a PR.

### License

MIT © Eugenius

