import { getMenu } from './api.js';
const $ = id => document.getElementById(id);
let menu, category = 'All';
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function render() {
  const query = $('search').value.trim().toLowerCase();
  const products = menu.products.filter(p =>
    (category === 'All' || p.category === category) &&
    (!$('available').checked || p.available) &&
    `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query));
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: menu.currency });
  $('products').replaceChildren();
  $('results').textContent = products.length ? `${products.length} ${products.length === 1 ? 'vegetable' : 'vegetables'}` : 'No vegetables match. Try another category or search.';
  for (const p of products) {
    const card = element('article', undefined, `card${p.available ? '' : ' sold'}`);
    const photo = element('div', undefined, 'photo');
    const img = element('img');
    img.alt = p.name; img.loading = 'lazy'; img.width = 640; img.height = 480;
    img.addEventListener('error', () => photo.replaceChildren(element('span', 'Photo coming soon')), { once: true });
    photo.append(img); img.src = p.image;
    const body = element('div', undefined, 'body');
    const price = element('div', money.format(p.price), 'price');
    price.append(element('span', ` / ${p.unit}`, 'unit'));
    body.append(element('span', p.category, 'category'), element('h2', p.name), element('p', p.description, 'description'), price, element('span', p.available ? 'Available' : 'Sold out', 'status'));
    card.append(photo, body); $('products').append(card);
  }
}
async function load() {
  $('retry').hidden = true;
  $('notice').hidden = false;
  $('notice').textContent = 'Loading menu…';
  try {
    menu = await getMenu();
    // Validate currency before rendering partial content.
    new Intl.NumberFormat('en-US', { style: 'currency', currency: menu.currency });
    $('notice').hidden = true;
    $('categories').replaceChildren();
    category = 'All';
    for (const name of ['All', ...new Set(menu.products.map(p => p.category))]) {
      const button = element('button', name);
      button.type = 'button'; button.setAttribute('aria-pressed', String(name === category));
      button.addEventListener('click', () => {
        category = name;
        for (const b of $('categories').children) b.setAttribute('aria-pressed', String(b === button));
        render();
      });
      $('categories').append(button);
    }
    render();
  } catch {
    $('notice').hidden = false;
    $('notice').textContent = 'The menu could not load. Please try again or ask our team at the stand.';
    $('results').textContent = ''; $('products').replaceChildren(); $('retry').hidden = false;
  }
}
$('search').addEventListener('input', () => menu && render());
$('available').addEventListener('change', () => menu && render());
$('retry').addEventListener('click', load);
load();
