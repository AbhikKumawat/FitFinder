<div align="center">

<img src="https://img.shields.io/badge/FitFinder-AI%20Fashion%20Platform-8BC58D?style=for-the-badge&logo=sparkles&logoColor=white" alt="FitFinder" />

# 🛍️ FitFinder — Your perfect fit, across every brand.

**An AI-powered fashion shopping platform that finds clothes and shoes matching your exact body measurements across Amazon, Myntra, H&M, Zara, Nike, and Adidas.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-FFD67E?style=flat-square)](LICENSE)

</div>

---

## ✨ What is FitFinder?

FitFinder solves one of the biggest pain points in online fashion shopping — **buying clothes that don't fit**.

You enter your body measurements once. FitFinder's AI agents then search across multiple fashion platforms, analyse each product's sizing data, and recommend the **exact size** that matches your body and preferred fit style — whether that's Slim, Regular, Relaxed, or Oversized.

> **"Stop returning clothes. Start buying clothes that actually fit you."**

---

## 🚀 Features

### 🤖 AI-Powered Search
- Type natural language queries like `"black jeans under ₹2,000 that fit me"`
- Parses **price ranges** automatically — `under ₹X`, `between X and Y`, `above X`, `X to Y`
- Strips filler words and extracts real keywords
- Simulates **5 specialised agents** running in parallel:
  - 🛒 **Amazon Agent** — searches product catalogue
  - 🛍️ **Myntra Agent** — compares size charts
  - 👔 **H&M Agent** — analyses garment measurements
  - 📐 **Fit Agent** — calculates personalised size
  - 🏆 **Ranking Agent** — scores and ranks results by fit confidence
- Results sorted by **Fit Match %** (best fit first)
- Smart **"No results"** empty state with one-tap retry without price filter

### 👗 Personalised Fit Scoring
- Each product shows a **circular Fit Match badge** (e.g. 96%)
- Full fit breakdown on product page:
  - Your chest measurement vs garment chest
  - Preferred fit style comparison
  - Plain-English explanation of why a size is recommended
- AI-recommended size highlighted with a badge in the size selector

### 📐 Body Measurement Profile
- Enter 6 measurements: Height, Chest, Waist, Hips, Shoulders, Foot Length
- **cm ↔ inch toggle** with automatic unit conversion
- Choose your preferred fit style: Slim / Regular / Relaxed / Oversized
- Profile completion progress bar

### 🛒 Multi-Platform Store Links
- Every product links directly to the retailer's website
- "Also available on" quick links — Amazon, Myntra, Flipkart
- Inline "Visit [Store] ↗" link on every search result card

### 🎨 Premium Dark UI
- Near-black charcoal background (`#17181D`)
- Pastel accent palette — Mint, Yellow, Pink, Purple
- Rounded cards, clean typography (Inter), spacious layouts
- Smooth hover animations and transitions
- Fully responsive — desktop three-panel layout + mobile bottom nav

### ❤️ Wishlist
- Heart-toggle any product from any screen
- Dedicated Wishlist page
- Persisted in React state (ready for localStorage / backend)

### 🗂️ Categories & Filters
- Browse by: Shirts, T-Shirts, Jeans, Trousers, Shoes, Jackets
- Category filter works across Discover and Categories pages
- Brand and price filter built into the AI search engine

---

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **TypeScript 5** | Type safety |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Lucide React** | Icon library |
| **Inter (Google Fonts)** | Typography |

---

## 📁 Project Structure

```
FitFinder/
├── public/
├── src/
│   ├── components/
│   │   ├── AgentSearchPanel.tsx   # AI search with agent simulation & price parsing
│   │   ├── CategoriesPage.tsx     # Browse by category
│   │   ├── CategoryCard.tsx       # Pastel category cards
│   │   ├── DiscoverPage.tsx       # Main discovery feed
│   │   ├── FitProfile.tsx         # User profile & measurements display
│   │   ├── FitScoreBadge.tsx      # Animated circular fit score ring
│   │   ├── MeasurementForm.tsx    # Edit measurements with cm/in toggle
│   │   ├── NavigationBar.tsx      # Desktop sidebar + mobile bottom nav
│   │   ├── ProductCard.tsx        # 3 variants: featured, list, compact
│   │   ├── ProductDetails.tsx     # Full product page with size recommendation
│   │   └── WishlistPage.tsx       # Saved products
│   ├── data/
│   │   └── products.ts            # Demo product data + user profile defaults
│   ├── lib/
│   │   └── utils.ts               # cn() class merge utility
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── App.tsx                    # Root — layout orchestration
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind base + custom scrollbar styles
├── tailwind.config.js             # Custom design tokens
├── index.html
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AbhikKumawat/FitFinder.git
cd FitFinder

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173/** in your browser.

### Build for Production

```bash
npm run build        # Outputs to /dist
npm run preview      # Preview the production build locally
```

---

## 🎯 How to Use

### 1. Set Your Measurements
Click **My Fit** in the navigation → **Update My Measurements**
Enter your Height, Chest, Waist, Hips, Shoulders, and Foot Length in cm or inches.
Choose your preferred fit style (Slim / Regular / Relaxed / Oversized).

### 2. Discover Products
The **Discover** page shows personalised recommendations immediately.
Browse by category or scroll through the product list.

### 3. AI Search
Click **Search** or type a query in the search bar and press **Search with AI**.

**Example queries that work:**
```
shoes under ₹500
black jeans under ₹2,000 that fit me
white shirt for office under ₹1,500
jacket between 3000 and 8000
oversized tee above ₹500
running shoes
```

### 4. View Product Details
Click any product to see the full fit breakdown, available sizes, colour options, and product specs.
Your AI-recommended size is highlighted automatically.
Click **Visit [Store]** to open the retailer's website directly.

### 5. Wishlist
Tap the ❤️ heart icon on any product to save it. View saved items in the **Wishlist** tab.

---

## 🔌 Adding Real Retailer APIs (Future)

The architecture is designed for real integrations. To connect a live API:

1. **Replace** the demo data in `src/data/products.ts` with API responses
2. **Implement** real agent functions in `src/components/AgentSearchPanel.tsx` inside `runSearch()`
3. **Add** environment variables for API keys in `.env`

Each agent corresponds to one retailer. The UI layer is fully decoupled from the data layer.

```ts
// Example: Replace mock delay with a real API call
const amazonResults = await fetch(
  `https://your-backend.com/api/amazon/search?q=${query}&maxPrice=${maxPrice}`
).then(r => r.json());
```

---

## 🎨 Design Tokens

| Token | Value | Usage |
|---|---|---|
| `bg-primary` | `#17181D` | Main background |
| `bg-card` | `#23242C` | Card backgrounds |
| `bg-elevated` | `#2A2B35` | Hover states |
| `accent-mint` | `#8BC58D` | Primary accent, CTAs, fit scores |
| `accent-yellow` | `#FFD67E` | Secondary accent, ratings |
| `accent-pink` | `#F49BC1` | Wishlist, tertiary accent |
| `accent-purple` | `#7866D9` | AI features, search |
| `text-primary` | `#FFFFFF` | Headings |
| `text-secondary` | `#A4A5B1` | Body text |
| `text-muted` | `#6B6C7A` | Labels, placeholders |

---

## 🗺️ Roadmap

- [ ] Real retailer API integrations (Amazon PA API, Myntra, H&M)
- [ ] User authentication & persistent profiles
- [ ] Size history and fit feedback after purchase
- [ ] Image-based body measurement (via camera)
- [ ] Price drop alerts for wishlisted items
- [ ] Browser extension for auto-recommending sizes on retailer sites
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Built with ❤️ by [Abhik Kumawat](https://github.com/AbhikKumawat)

⭐ **Star this repo** if FitFinder helped you!

</div>
