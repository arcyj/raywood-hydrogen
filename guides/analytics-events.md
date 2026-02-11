# Add to cart & analytics events

This app publishes **product_added_to_cart** (and related events) via Hydrogen’s `useAnalytics` and pushes them to `window.dataLayer` for GTM. Below is where to see them in **Shopify** and **GA4**.

---

## 1. Where to see the event in Shopify

- **Shopify Admin → Settings → Customer events**  
  If you use Shopify’s native customer events / web pixels, events from Hydrogen’s `Analytics.Provider` can be sent here. Not all Hydrogen custom events show up unless you’ve added a custom pixel that listens for them.

- **Shopify Admin → Reports → Analytics**  
  High-level store analytics (visits, sales, etc.). Add-to-cart may appear only if you use Shopify’s built-in or recommended tracking (e.g. standard checkout/conversion events), not necessarily the custom `product_added_to_cart` from Hydrogen.

- **Custom web pixel / app**  
  To see **product_added_to_cart** (or `product-added-to-cart` on the front end) in Shopify, you’d add a **web pixel** or app that subscribes to that event (e.g. in Shopify Admin: **Settings → Customer events** and add a custom pixel that receives the event name and payload you send).

So: the event is **published in your storefront** and sent to the **dataLayer**; to “see it in Shopify” you need a pixel or app that listens for it and/or reports it in the admin.

---

## 2. How to see add_to_cart in GA4

The app pushes two things to `window.dataLayer` when something is added to cart:

1. **Custom event:**  
   `event: 'product-added-to-cart'`  
   with full `payload` (cart, currentLine, shop, url, etc.).

2. **GA4-style event:**  
   `event: 'add_to_cart'`  
   with `ecommerce: { currency, value, items }` so GA4 ecommerce reports can use it.

### In the browser (quick check)

1. Open DevTools → **Console**.
2. Run:  
   `window.dataLayer.filter(e => e.event && (e.event === 'add_to_cart' || e.event === 'product-added-to-cart'))`
3. Add a product to the cart on the site.
4. Run the same line again; you should see new entries for `add_to_cart` and/or `product-added-to-cart`.

### In Google Tag Manager

1. **Trigger**  
   - **Trigger type:** Custom Event  
   - **Event name:** `add_to_cart` (or `product-added-to-cart` if you prefer)

2. **Tag (GA4)**  
   - **Tag type:** Google Analytics: GA4 Event  
   - **Event name:** `add_to_cart` (GA4’s recommended name)  
   - **Event parameters:**  
     - Add `currency` → `{{DLV - ecommerce.currency}}`  
     - Add `value` → `{{DLV - ecommerce.value}}`  
   - **Optional:** enable “Send ecommerce data” / use the built-in **Ecommerce** variable so `ecommerce.items` is sent.

3. **Variables**  
   - Create **Data Layer Variables** for:  
     - `ecommerce.currency`  
     - `ecommerce.value`  
     - `ecommerce.items` (if you want to send item-level data).

4. Link the **GA4 Event** tag to the **add_to_cart** trigger and publish the container.

### In GA4

- **Reports → Monetization → Ecommerce purchases** (and related ecommerce reports) will show data once the GA4 tag is firing and sending `add_to_cart` with `ecommerce` data.
- **Reports → Engagement → Events**  
  Look for the event name **add_to_cart**.
- **DebugView**  
  - In GA4: **Admin → DebugView** (with debug mode enabled in the GA4 tag or via `gtag('config', 'G-XXX', { 'debug_mode': true })`).  
  - Add to cart on the site and confirm **add_to_cart** (and optionally **product-added-to-cart**) appear in real time.

If you don’t see **add_to_cart** in GA4, check: (1) dataLayer has `add_to_cart` after adding to cart (console check above), (2) GTM trigger fires on that event, (3) GA4 tag is linked to that trigger and the container is published, (4) GA4 Measurement ID is correct and the tag fires on the right pages.
