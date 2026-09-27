// Later change this to '/api/menu'; keep the JSON response shape the same.
const MENU_URL = './data/products.json';
export async function getMenu() {
  const response = await fetch(MENU_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Menu unavailable');
  const menu = await response.json();
  if (!Array.isArray(menu.products)) throw new Error('Invalid menu');
  const ids = new Set();
  for (const p of menu.products) {
    if (typeof p.id !== 'string' || ids.has(p.id) ||
        !['name','category','description','unit','image'].every(k => typeof p[k] === 'string') ||
        typeof p.available !== 'boolean' || !Number.isFinite(p.price) || p.price < 0) {
      throw new Error('Invalid product');
    }
    ids.add(p.id);
  }
  return menu;
}
