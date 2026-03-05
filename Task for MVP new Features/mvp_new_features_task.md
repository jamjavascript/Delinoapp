# MVP New Features — Task Plan

**Project:** Delinoapp
**Created:** March 4, 2026
**Based on:** Phase 4 (Enhancements) from implementation_plan_client.md + additional MVP features
**Current State:** Phases 1-3 complete (backend, frontend, deployment all working)
**Stack:** FastAPI + Next.js 16 + PostgreSQL + Railway/Vercel

---

## Overview

This task plan covers new MVP features organized into 6 feature groups. Each feature group contains actionable tasks with clear scope, file locations, and acceptance criteria.

**Feature Groups:**
1. Search & Advanced Filters (from Phase 4)
2. Price Alerts & Notifications (from Phase 4)
3. Admin Product Management (from Phase 4)
4. Performance Optimizations (from Phase 4)
5. User Accounts & Authentication (new)
6. Analytics & Insights Dashboard (new)

---

## Feature Group 1: Search & Advanced Filters

> **Goal:** Let users quickly find products through text search, price range filtering, and sorting options.

### Task 1.1 — Backend: Full-Text Search Endpoint
**Priority:** High
**Files to modify:**
- `app/api/routes/products.py` — add search endpoint
- `app/models/product.py` — add search index if needed
- `alembic/versions/` — new migration for search index

**Scope:**
- [ ] Add `GET /api/v1/products/search?q=<query>&category=<id>&min_price=<n>&max_price=<n>&sort_by=<field>&order=<asc|desc>&page=<n>&limit=<n>` endpoint
- [ ] Implement PostgreSQL full-text search on `title` and `description` fields using `to_tsvector` / `to_tsquery`
- [ ] Add GIN index on searchable fields via Alembic migration
- [ ] Support combined filtering: text search + category + price range in a single query
- [ ] Return paginated results with total count

**Acceptance Criteria:**
- Searching "laptop" returns relevant products ranked by relevance
- Filters can be combined (e.g., search "phone" in category "smartphones" under $500)
- Empty search with filters still works (browse mode)
- Response includes `total`, `page`, `limit`, and `results` fields

---

### Task 1.2 — Backend: Sorting & Pagination
**Priority:** High
**Files to modify:**
- `app/api/routes/products.py` — update trending/search endpoints
- `app/schemas/product.py` — add pagination response schema

**Scope:**
- [ ] Add sort options: `price_asc`, `price_desc`, `newest`, `name_asc`, `name_desc`
- [ ] Implement offset-based pagination with `page` and `limit` query params
- [ ] Add `PaginatedResponse` schema with `total`, `page`, `limit`, `total_pages`, `results`
- [ ] Apply pagination to existing `/trending` endpoint as well

**Acceptance Criteria:**
- Products can be sorted by price (both directions), date added, and name
- Pagination returns correct page counts and totals
- Default: page=1, limit=20

---

### Task 1.3 — Frontend: Search Bar Component
**Priority:** High
**Files to create/modify:**
- `frontend/components/SearchBar.tsx` — new component
- `frontend/app/page.tsx` — integrate search bar
- `frontend/lib/api.ts` — add search API call

**Scope:**
- [ ] Create `SearchBar` component with text input and debounced search (300ms)
- [ ] Add search icon and clear button
- [ ] Integrate with the search API endpoint
- [ ] Show search results count
- [ ] Sync search query with URL params (`?q=...`) for shareability
- [ ] Handle empty results with a friendly message

**Acceptance Criteria:**
- Typing triggers debounced API calls
- URL updates with search term (back button works)
- Clear button resets to default view
- Mobile responsive

---

### Task 1.4 — Frontend: Advanced Filters Panel
**Priority:** Medium
**Files to create/modify:**
- `frontend/components/FilterPanel.tsx` — new component
- `frontend/components/SortDropdown.tsx` — new component
- `frontend/app/page.tsx` — integrate filters

**Scope:**
- [ ] Create collapsible filter panel with:
  - Price range slider (min/max)
  - Category multi-select (enhance existing CategoryFilter)
  - Sort dropdown (price, date, name)
- [ ] Sync all filter state with URL params
- [ ] Add "Clear All Filters" button
- [ ] Show active filter count badge
- [ ] Mobile: filters slide in from side or show as bottom sheet

**Acceptance Criteria:**
- All filters combine correctly with search
- URL reflects current filter state (shareable/bookmarkable)
- Clearing filters returns to default view
- Responsive on mobile

---

### Task 1.5 — Frontend: Pagination Component
**Priority:** Medium
**Files to create/modify:**
- `frontend/components/Pagination.tsx` — new component
- `frontend/app/page.tsx` — integrate pagination

**Scope:**
- [ ] Create pagination component with page numbers, prev/next buttons
- [ ] Show current page and total pages
- [ ] Sync with URL params (`?page=...`)
- [ ] Show "Showing X-Y of Z products" text
- [ ] Scroll to top on page change

**Acceptance Criteria:**
- Navigation between pages works correctly
- URL updates with page number
- Works alongside search and filters

---

## Feature Group 2: Price Alerts & Notifications

> **Goal:** Allow users to set price drop alerts and get notified when deals match their criteria.

### Task 2.1 — Backend: Price Alert Model & Endpoints
**Priority:** High
**Files to create/modify:**
- `app/models/price_alert.py` — new model
- `app/models/__init__.py` — register model
- `app/schemas/price_alert.py` — new schemas
- `app/api/routes/alerts.py` — new route file
- `app/main.py` — register router
- `alembic/versions/` — new migration

**Scope:**
- [ ] Create `PriceAlert` model:
  - `id`, `user_id` (nullable until auth), `product_id` (FK), `target_price`, `alert_type` (below/above/percentage_drop), `is_active`, `triggered_at`, `created_at`
- [ ] Create CRUD endpoints:
  - `POST /api/v1/alerts` — create alert
  - `GET /api/v1/alerts` — list user's alerts
  - `GET /api/v1/alerts/{id}` — get single alert
  - `DELETE /api/v1/alerts/{id}` — delete alert
  - `PATCH /api/v1/alerts/{id}` — update alert (e.g., toggle active)
- [ ] Run migration

**Acceptance Criteria:**
- Alerts can be created, listed, updated, and deleted
- Alert stores product reference and target price
- Validation: target_price must be positive, product must exist

---

### Task 2.2 — Backend: Alert Checking in Scheduler
**Priority:** Medium
**Files to modify:**
- `app/services/scheduler.py` — add alert check job
- `app/services/alert_checker.py` — new service

**Scope:**
- [ ] Create `AlertChecker` service that:
  - Queries all active alerts
  - Compares current product price against alert target
  - Marks triggered alerts (`triggered_at` timestamp)
  - Logs triggered alerts (email/push integration later)
- [ ] Add alert check to scheduler (runs after each product refresh)
- [ ] Add `GET /api/v1/alerts/triggered` endpoint for recently triggered alerts

**Acceptance Criteria:**
- After a product price changes below target, alert is marked as triggered
- Triggered alerts appear in the triggered endpoint
- Alert checking does not slow down the refresh cycle significantly

---

### Task 2.3 — Frontend: Price Alert UI
**Priority:** Medium
**Files to create/modify:**
- `frontend/components/PriceAlertButton.tsx` — new component
- `frontend/components/AlertsList.tsx` — new component
- `frontend/app/alerts/page.tsx` — new page
- `frontend/app/product/[id]/page.tsx` — add alert button
- `frontend/lib/api.ts` — add alert API calls

**Scope:**
- [ ] Add "Set Price Alert" button on product detail page
  - Modal/dropdown to set target price
  - Show current price for reference
  - Quick options: "Alert at 10% off", "Alert at 20% off", custom price
- [ ] Create `/alerts` page showing all user alerts
  - List of active alerts with product info and target price
  - Show triggered alerts with notification badge
  - Delete/toggle alerts
- [ ] Add alert icon in header with badge count for triggered alerts

**Acceptance Criteria:**
- Users can set alerts from product pages
- Alerts page shows all alerts with status
- Triggered alerts are visually distinct
- Works without authentication (stored by session/local storage initially)

---

## Feature Group 3: Admin Product Management

> **Goal:** Simple admin panel for managing products, categories, and data refresh.

### Task 3.1 — Backend: Admin CRUD Endpoints
**Priority:** Medium
**Files to create/modify:**
- `app/api/routes/admin.py` — new route file
- `app/main.py` — register router
- `app/schemas/product.py` — add create/update schemas if missing

**Scope:**
- [ ] Add admin endpoints (prefix `/api/v1/admin`):
  - `POST /admin/products` — create product manually
  - `PUT /admin/products/{id}` — update product details
  - `DELETE /admin/products/{id}` — delete product
  - `POST /admin/categories` — create category
  - `PUT /admin/categories/{id}` — update category
  - `DELETE /admin/categories/{id}` — delete category
  - `POST /admin/refresh` — trigger manual data refresh with status response
  - `GET /admin/stats` — dashboard stats (total products, categories, last refresh time, alert count)
- [ ] Add basic API key middleware for admin routes (before full auth)

**Acceptance Criteria:**
- All CRUD operations work correctly
- Deleting a category handles products in that category (reassign or cascade)
- Stats endpoint returns accurate counts
- Admin routes are protected by API key header

---

### Task 3.2 — Frontend: Admin Dashboard Page
**Priority:** Low
**Files to create/modify:**
- `frontend/app/admin/page.tsx` — new page
- `frontend/app/admin/products/page.tsx` — product management
- `frontend/app/admin/layout.tsx` — admin layout
- `frontend/components/admin/` — admin-specific components

**Scope:**
- [ ] Create admin dashboard with:
  - Stats cards (total products, categories, last refresh, active alerts)
  - Quick actions (refresh data, view recent errors)
- [ ] Product management table:
  - Sortable/filterable table of all products
  - Edit product inline or in modal
  - Delete product with confirmation
  - Add new product form
- [ ] Category management:
  - List categories with product count
  - Add/edit/delete categories
- [ ] Protected by admin API key input (simple gate)

**Acceptance Criteria:**
- Admin can view, create, edit, and delete products
- Admin can manage categories
- Dashboard shows accurate stats
- UI is functional (doesn't need to be highly polished)

---

## Feature Group 4: Performance Optimizations

> **Goal:** Faster load times, better caching, and optimized data transfer.

### Task 4.1 — Backend: Response Caching
**Priority:** Medium
**Files to modify:**
- `app/api/routes/products.py` — add caching
- `app/core/config.py` — cache settings

**Scope:**
- [ ] Add in-memory caching for frequently-hit endpoints (trending, categories)
- [ ] Cache TTL: 5 minutes for product lists, 1 minute for single products
- [ ] Cache invalidation on product refresh
- [ ] Add `Cache-Control` headers to responses
- [ ] Add `ETag` support for conditional requests

**Acceptance Criteria:**
- Repeated requests within TTL are served from cache
- Cache is invalidated after data refresh
- Response headers include proper caching directives

---

### Task 4.2 — Frontend: Image Optimization & Lazy Loading
**Priority:** Medium
**Files to modify:**
- `frontend/components/ProductCard.tsx` — optimize images
- `frontend/components/ProductGrid.tsx` — lazy loading
- `frontend/next.config.ts` — image domains

**Scope:**
- [ ] Use Next.js `Image` component with proper `sizes` and `priority` props
- [ ] Add blur placeholder for images (generate or use solid color)
- [ ] Implement intersection observer for lazy loading product cards below the fold
- [ ] Add image error fallback (broken image → placeholder)
- [ ] Configure remote image domains in `next.config.ts`

**Acceptance Criteria:**
- Images load progressively with placeholders
- Below-fold images load on scroll
- Broken images show a clean fallback
- Lighthouse image optimization score improves

---

### Task 4.3 — Frontend: Client-Side Caching & Optimistic Updates
**Priority:** Low
**Files to modify:**
- `frontend/lib/api.ts` — add caching layer
- `frontend/app/page.tsx` — optimistic UI

**Scope:**
- [ ] Add SWR or React Query-style caching to API client
  - Stale-while-revalidate pattern
  - Cache product lists and details
  - Automatic background revalidation
- [ ] Optimistic UI for alert creation (show immediately, sync in background)
- [ ] Add loading skeletons that match content layout (avoid layout shift)

**Acceptance Criteria:**
- Navigating back to product list shows cached data immediately
- Background revalidation updates stale data silently
- No layout shifts during loading

---

## Feature Group 5: User Accounts & Authentication

> **Goal:** User registration and login so users can save preferences, alerts, and have personalized experiences.

### Task 5.1 — Backend: User Model & Auth Endpoints
**Priority:** High
**Files to create/modify:**
- `app/models/user.py` — new model
- `app/models/__init__.py` — register model
- `app/schemas/user.py` — new schemas
- `app/api/routes/auth.py` — new route file
- `app/core/security.py` — new auth utilities
- `app/main.py` — register router
- `alembic/versions/` — new migration

**Scope:**
- [ ] Create `User` model:
  - `id`, `email` (unique), `hashed_password`, `full_name`, `is_active`, `is_admin`, `created_at`, `updated_at`
- [ ] Create `app/core/security.py`:
  - Password hashing with bcrypt
  - JWT token generation and validation
  - Token expiry: 7 days access token
  - Dependency: `get_current_user` for protected routes
- [ ] Auth endpoints:
  - `POST /api/v1/auth/register` — create account (email, password, name)
  - `POST /api/v1/auth/login` — returns JWT token
  - `GET /api/v1/auth/me` — get current user profile
  - `PUT /api/v1/auth/me` — update profile
- [ ] Add `user_id` foreign key to `PriceAlert` model
- [ ] Run migration

**Acceptance Criteria:**
- Users can register with email/password
- Login returns a valid JWT
- Protected routes reject unauthenticated requests with 401
- Passwords are securely hashed (never stored in plain text)
- Duplicate email registration returns 409

---

### Task 5.2 — Backend: User Favorites/Watchlist
**Priority:** Medium
**Files to create/modify:**
- `app/models/favorite.py` — new model (many-to-many: user ↔ product)
- `app/api/routes/favorites.py` — new route file
- `app/schemas/favorite.py` — new schemas
- `alembic/versions/` — new migration

**Scope:**
- [ ] Create `user_favorites` association table (user_id, product_id, created_at)
- [ ] Endpoints (all require auth):
  - `POST /api/v1/favorites/{product_id}` — add to favorites
  - `DELETE /api/v1/favorites/{product_id}` — remove from favorites
  - `GET /api/v1/favorites` — list user's favorites with product details
- [ ] Add `is_favorited` field to product responses when user is authenticated

**Acceptance Criteria:**
- Authenticated users can add/remove favorites
- Favorites list returns full product info
- Product responses include favorite status for logged-in users
- Favoriting the same product twice is idempotent (not an error)

---

### Task 5.3 — Frontend: Auth Pages & Context
**Priority:** High
**Files to create/modify:**
- `frontend/app/login/page.tsx` — login page
- `frontend/app/register/page.tsx` — register page
- `frontend/app/profile/page.tsx` — profile page
- `frontend/lib/auth.ts` — auth context/hooks
- `frontend/components/AuthHeader.tsx` — header with login/user state
- `frontend/lib/api.ts` — add auth token to requests

**Scope:**
- [ ] Create auth context provider:
  - Store JWT in httpOnly cookie or localStorage
  - `useAuth()` hook: `user`, `login()`, `logout()`, `register()`, `isAuthenticated`
  - Auto-refresh token before expiry
- [ ] Login page with email/password form
  - Validation (email format, password length)
  - Error messages for wrong credentials
  - Redirect to home after login
- [ ] Register page with name/email/password form
  - Password strength indicator
  - Redirect to login after registration
- [ ] Update header/navbar:
  - Show login/register buttons when logged out
  - Show user name + avatar/initials + dropdown when logged in
  - Dropdown: Profile, My Alerts, My Favorites, Logout
- [ ] Update API client to attach JWT to all requests

**Acceptance Criteria:**
- Full login/register/logout flow works
- Auth state persists across page refreshes
- Protected pages redirect to login
- Header reflects auth state

---

### Task 5.4 — Frontend: Favorites/Watchlist UI
**Priority:** Medium
**Files to create/modify:**
- `frontend/components/FavoriteButton.tsx` — new component
- `frontend/app/favorites/page.tsx` — new page
- `frontend/components/ProductCard.tsx` — add favorite button

**Scope:**
- [ ] Add heart/bookmark icon on ProductCard (toggle favorite)
- [ ] Create `/favorites` page with user's saved products
- [ ] Show login prompt if user tries to favorite without being logged in
- [ ] Optimistic UI: immediately toggle heart, sync with API in background

**Acceptance Criteria:**
- Heart icon toggles on click
- Favorites page lists all saved products
- Unauthenticated users are prompted to log in
- Favorite state persists after refresh

---

## Feature Group 6: Analytics & Insights Dashboard

> **Goal:** Help users make better purchasing decisions with price trends, deal scoring, and analytics.

### Task 6.1 — Backend: Analytics Endpoints
**Priority:** High
**Files to create/modify:**
- `app/api/routes/analytics.py` — new route file
- `app/services/analytics.py` — new service
- `app/schemas/analytics.py` — new schemas
- `app/main.py` — register router

**Scope:**
- [ ] Create analytics service with calculations:
  - **Price trend**: direction (up/down/stable) based on last N price points
  - **Average price**: rolling average over 7/30 days
  - **Price volatility**: standard deviation of prices
  - **Deal score**: 0-100 score based on current price vs. historical average
  - **Best time to buy**: day-of-week analysis of price patterns
- [ ] Analytics endpoints:
  - `GET /api/v1/analytics/product/{id}` — full analytics for one product
  - `GET /api/v1/analytics/deals` — top deals across all products (highest deal scores)
  - `GET /api/v1/analytics/trends` — trending products (biggest price drops recently)
  - `GET /api/v1/analytics/summary` — platform-wide stats (avg prices by category, total tracked, etc.)

**Acceptance Criteria:**
- Deal score calculation considers historical prices correctly
- Trends endpoint returns products with significant recent price changes
- Handles products with limited price history gracefully (min 2 data points)
- All responses are typed with proper schemas

---

### Task 6.2 — Frontend: Analytics Dashboard Page
**Priority:** High
**Files to create/modify:**
- `frontend/app/analytics/page.tsx` — new page
- `frontend/components/analytics/DealScoreCard.tsx` — new component
- `frontend/components/analytics/TrendIndicator.tsx` — new component
- `frontend/components/analytics/PriceSummaryChart.tsx` — new component
- `frontend/components/analytics/TopDealsSection.tsx` — new component
- `frontend/lib/api.ts` — add analytics API calls

**Scope:**
- [ ] Create analytics dashboard with sections:
  - **Top Deals**: cards showing products with best deal scores
    - Deal score badge (color-coded: green=great, yellow=okay, red=bad)
    - Current price vs. average price
    - Price trend arrow (up/down/stable)
  - **Trending Products**: products with biggest recent price drops
    - Show percentage drop and price difference
  - **Category Overview**: bar/pie chart of average prices by category
  - **Platform Stats**: total products tracked, average deal score, total alerts set
- [ ] Add analytics link to main navigation
- [ ] Each deal card links to the product detail page

**Acceptance Criteria:**
- Dashboard loads with real data from analytics endpoints
- Deal scores are visually clear (color + number)
- Charts render correctly with Recharts
- Page is responsive

---

### Task 6.3 — Frontend: Product Detail Analytics Section
**Priority:** Medium
**Files to modify:**
- `frontend/app/product/[id]/page.tsx` — add analytics section
- `frontend/components/PriceChart.tsx` — enhance with trend lines

**Scope:**
- [ ] Add analytics section to product detail page:
  - Deal score badge with explanation tooltip
  - Price trend indicator (arrow + percentage)
  - "Average price: $X over the last 30 days"
  - "Best time to buy" suggestion
  - Price range: lowest/highest in tracking period
- [ ] Enhance existing PriceChart:
  - Add moving average trend line
  - Add horizontal line for average price
  - Highlight current price vs. average
  - Add time range selector (7d, 30d, 90d, all)

**Acceptance Criteria:**
- Analytics data displays correctly on product page
- Chart enhancements don't break existing functionality
- Tooltip explanations are clear to non-technical users
- Handles products with limited data (shows what's available)

---

### Task 6.4 — Backend: Deal Score in Product Responses
**Priority:** Low
**Files to modify:**
- `app/schemas/product.py` — add deal_score field
- `app/api/routes/products.py` — compute and include deal score

**Scope:**
- [ ] Add optional `deal_score` field to product response schema
- [ ] Compute deal score on-the-fly or cache it for product list responses
- [ ] Allow sorting products by deal score (best deals first)

**Acceptance Criteria:**
- Product list includes deal_score for each product
- Sorting by deal_score works correctly
- Performance impact is minimal (cache if needed)

---

## Implementation Priority & Suggested Order

| Priority | Task | Estimated Effort | Dependencies |
|----------|------|-----------------|--------------|
| 1 | 1.1 Backend: Full-Text Search | 3-4 hrs | None |
| 2 | 1.2 Backend: Sorting & Pagination | 2-3 hrs | None |
| 3 | 1.3 Frontend: Search Bar | 2-3 hrs | Task 1.1 |
| 4 | 5.1 Backend: User Model & Auth | 4-5 hrs | None |
| 5 | 5.3 Frontend: Auth Pages & Context | 4-5 hrs | Task 5.1 |
| 6 | 6.1 Backend: Analytics Endpoints | 4-5 hrs | None |
| 7 | 6.2 Frontend: Analytics Dashboard | 4-5 hrs | Task 6.1 |
| 8 | 2.1 Backend: Price Alert Model | 3-4 hrs | None |
| 9 | 2.3 Frontend: Price Alert UI | 3-4 hrs | Task 2.1 |
| 10 | 1.4 Frontend: Advanced Filters | 3-4 hrs | Task 1.1, 1.2 |
| 11 | 1.5 Frontend: Pagination | 2-3 hrs | Task 1.2 |
| 12 | 5.2 Backend: Favorites/Watchlist | 2-3 hrs | Task 5.1 |
| 13 | 5.4 Frontend: Favorites UI | 2-3 hrs | Task 5.2, 5.3 |
| 14 | 2.2 Backend: Alert Checker | 2-3 hrs | Task 2.1 |
| 15 | 6.3 Frontend: Product Analytics | 3-4 hrs | Task 6.1 |
| 16 | 4.1 Backend: Response Caching | 2-3 hrs | None |
| 17 | 4.2 Frontend: Image Optimization | 2-3 hrs | None |
| 18 | 3.1 Backend: Admin CRUD | 3-4 hrs | None |
| 19 | 3.2 Frontend: Admin Dashboard | 4-5 hrs | Task 3.1 |
| 20 | 4.3 Frontend: Client Caching | 2-3 hrs | None |
| 21 | 6.4 Backend: Deal Score in Products | 1-2 hrs | Task 6.1 |

**Total Estimated Effort:** ~58-75 hours

---

## Notes

- All new backend routes need corresponding tests
- All new frontend pages need to be added to navigation
- Database migrations must be created for each new model
- API documentation (Swagger) will auto-update with new endpoints
- Auth should be implemented early since alerts and favorites depend on it
- Analytics can be built in parallel with auth since they're independent
