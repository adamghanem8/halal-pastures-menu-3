# Halal Pastures Farm market menu

A dependency-free HTML/CSS/JavaScript MVP. Includes categories, search, availability filtering, product illustrations, descriptions, prices, and units. No checkout or admin dashboard yet. All six products and prices are examples, not verified farm inventory. Replace the sample illustrations with your own photos before publishing.

## Exact structure

```
halal-pastures-menu/
├── package.json
├── server.mjs                  # Local preview; no npm dependencies
├── .gitignore
├── README.md
└── docs/                       # Entire public website
    ├── .nojekyll
    ├── index.html              # Page structure
    ├── styles.css              # Mobile-first layout and visual styling
    ├── app.js                  # Filtering and product cards
    ├── api.js                  # Single data-loading boundary
    ├── data/
    │   └── products.json       # Edit this each week
    └── images/
        ├── carrots.svg
        ├── tomatoes.svg
        ├── broccoli.svg
        ├── peppers.svg
        ├── eggplant.svg
        └── cucumber.svg
```

## Run in VS Code

1. Open this folder in VS Code.
2. Open Terminal → New Terminal.
3. With Node.js 22 or later installed, run:

```sh
npm start
```

4. Open http://localhost:3000 in your browser. No `npm install` or build step is needed. Stop with Ctrl+C.

Use this HTTP preview rather than opening index.html directly: browsers restrict JSON fetches from file URLs. The preview binds to your computer only. Test on a phone using your deployed HTTPS URL.

## Update the weekly menu

Edit `docs/data/products.json`. Each product follows this exact shape:

```json
{
  "id": "carrots",
  "name": "Carrots",
  "category": "Roots",
  "description": "Sweet, freshly harvested carrots.",
  "price": 4,
  "unit": "bunch",
  "available": true,
  "image": "./images/carrots.jpg"
}
```

Use unique, stable IDs. Prices are numbers; USD is configured once at the top of the file. Put photos in docs/images and use matching relative paths. Aim for landscape images around 800 × 600 and under 200 KB. JPG or WebP are good choices. Missing images get a readable fallback.

Categories are generated automatically. Add as many products as needed by copying a product object with a new ID. Set available to false to label a product Sold out; remove its object to omit it entirely. The Available only checkbox hides sold-out products.

Set updatedAt to the date you checked the menu. Set demo to false only after replacing sample content with verified products, prices, and photos. Save and refresh the browser. Customers must refresh an already-open menu to see changes; there is no automatic live sync.

This first version has one shared menu for all markets. If markets have different stock or prices, add separate menu data and stable market URLs before relying on it for those locations.

## Deploy with GitHub Pages

Use a new repository for this project. Commit this folder's contents at the repository root and push to GitHub, using VS Code's Source Control interface or your normal Git workflow. Never commit API credentials.

In the repository, open Settings → Pages. Choose Deploy from a branch, select main and /docs, then save. GitHub will publish the static files. Open the exact URL shown in Pages settings, usually https://YOUR-USERNAME.github.io/halal-pastures-menu/. Keep the repository name and URL stable.

Each future commit to the published branch updates the website after deployment completes. After every update, check the public URL on a phone and verify prices and images. GitHub Pages cannot run Express or a Node.js backend; it serves this MVP's static docs folder only.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Permanent QR code

Finish deployment before generating the QR. Encode the full public HTTPS URL, never localhost or a temporary preview address. You can generate a static QR locally once Node and npm are available:

```sh
npx --yes qrcode -o market-menu-qr.png -w 1200 -m 4 'https://YOUR-USERNAME.github.io/halal-pastures-menu/'
```

Replace the example URL with the tested real one. This command downloads the qrcode CLI and writes a PNG in your current folder. Print it with the heading “Scan for our market menu” and the short web address underneath. Keep the white border and strong contrast; test an actual print with several phones at the stand before making all signs.

For a more durable farm-owned address, configure menu.halalpastures.com before printing, or have your existing site redirect a stable /market-menu address to the hosted menu. That redirect must be configured on the existing site; this starter does not create it. Keep the same address as you update products or change hosts. No new QR is needed for weekly data edits.

## Later: Express admin and BigCommerce

The frontend already calls getMenu() from docs/api.js. Today it fetches a local JSON file. Later change MENU_URL to /api/menu and serve the same JSON response from Express alongside the static docs folder. This keeps all card and filtering code unchanged.

Suggested future structure:

```
server/
  index.js                     # Express: static files + API routes
  routes/menu.js               # Public GET /api/menu
  routes/admin.js              # Protected product/availability updates
  services/bigcommerce.js      # Server-side catalog fetch and mapping
  repositories/market-menu.js  # Persist market overrides in a database
```

A future Express read route would follow this pattern (architectural example, not included as a working backend):

```js
app.get('/api/menu', async (req, res, next) => {
  try {
    const menu = await menuRepository.getPublishedMenu();
    res.set('Cache-Control', 'no-store').json(menu);
  } catch (error) {
    next(error);
  }
});
app.use(express.static('docs'));
```

Fetch BigCommerce catalog data from the server using GET https://api.bigcommerce.com/stores/{store_hash}/v3/catalog/products with the X-Auth-Token header. Use a read-only Products scope when only reading. Keep the store hash and access token in server environment variables, never in docs/, browser JavaScript, or GitHub commits.

Map BigCommerce product IDs, names, images, categories, and descriptions to this menu's schema. Fetch all catalog pages. Convert HTML descriptions to plain text. Store market-specific prices, units, and availability as explicit overrides: online inventory and online prices may differ from what is at the stall. Do not infer a sale unit from a product's shipping weight. Use the appropriate variant when products have multiple options.

Cache or sync the catalog server-side rather than fetching BigCommerce for every customer scan. Save the published market menu in a persistent database. Add authenticated admin access, server-side validation, and CSRF protection where cookie authentication is used before exposing any write endpoints. The admin can then change prices and mark products sold out from a phone.

Deploy that later backend on a Node-capable host and point the same permanent menu address there. The QR code stays unchanged.

Official API reference: https://docs.bigcommerce.com/developer/api-reference/rest/admin/catalog/products/get-products

## Before using at the market

- Replace every sample price, description, availability value, and image.
- Check All, every category, search, Available only, sold-out labels, and a search with no results.
- Check a narrow phone viewport and keyboard focus.
- Temporarily use a bad image path to confirm the image fallback.
- Confirm the public menu and printed QR work over cellular data.
- Keep a small printed price list for customers without a phone or signal.
