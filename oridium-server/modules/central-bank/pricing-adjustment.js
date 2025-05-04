// modules/central-bank/pricing-adjustment.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStock } from './stock.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePrice = 1.0;
const minPrice = 0.50;
const maxPrice = 100000;

function getRecentSales() {
  const historyPath = path.join(__dirname, '../../data/history.json');
  if (!fs.existsSync(historyPath)) return [];

  const content = fs.readFileSync(historyPath, 'utf-8').trim();
  if (!content) return [];

  try {
    const allSales = JSON.parse(content);
    const now = Date.now();
    return allSales.filter(sale => now - new Date(sale.timestamp).getTime() <= 60 * 60 * 1000);
  } catch (e) {
    console.error("❌ Erreur de parsing JSON dans history.json :", e.message);
    return [];
  }
}

function calculateDynamicPrice(basePrice, stockRemaining, stockInitial, secondsSinceMarketOpen, secondsSinceLastSale) {
  const ratioSold = (stockInitial - stockRemaining) / stockInitial;
  const timeMinutes = secondsSinceMarketOpen / 60;

  const demandBoost = Math.pow(((ratioSold + 0.01) * 600) / (timeMinutes + 10), 1.4);

  let cooldownPenalty = 1;
  if (secondsSinceLastSale > 3600) cooldownPenalty = 0.95;
  if (secondsSinceLastSale > 86400) cooldownPenalty = 0.80;

  let newPrice = basePrice * demandBoost * cooldownPenalty;
  console.log("📊 Détails du calcul de prix :");
  console.log("Stock initial :", stockInitial);
  console.log("Stock restant :", stockRemaining);
  console.log("Vendus :", stockInitial - stockRemaining);
  console.log("Ratio vendu :", ratioSold.toFixed(2));
  console.log("Temps écoulé depuis ouverture :", (secondsSinceMarketOpen / 60).toFixed(2), "minutes");
  console.log("Temps depuis dernière vente :", (secondsSinceLastSale / 60).toFixed(2), "minutes");
  console.log("Boost de demande :", demandBoost.toFixed(3));
  console.log("Pénalité cooldown :", cooldownPenalty.toFixed(2));
  return Math.max(minPrice, Math.min(newPrice, maxPrice));
}

function savePrice(price) {
  const pricingPath = path.join(__dirname, '../../data/pricing.json');
  const obj = {
    price,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(pricingPath, JSON.stringify(obj, null, 2));
}

function adjustPrice() {
  const stock = getStock();
  const sales = getRecentSales();
  console.log("✅ Ventes chargées :", sales);
  const now = Date.now();

  const marketOpenedAt = new Date(stock.generatedAt).getTime();
  const secondsSinceMarketOpen = (now - marketOpenedAt) / 1000;

  const lastSale = sales.length > 0
    ? sales[sales.length - 1]
    : null;

  const secondsSinceLastSale = lastSale
    ? (now - new Date(lastSale.timestamp).getTime()) / 1000
    : 999999; // aucune vente encore

  const price = calculateDynamicPrice(
    basePrice,
    stock.available,
    stock.maxWeeklyQuota,
    secondsSinceMarketOpen,
    secondsSinceLastSale
  );

  savePrice(price);
  console.log("💰 Nouveau prix ajusté :", price.toFixed(6));
}

if (process.argv[1].endsWith('pricing-adjustment.js')) {
  adjustPrice();
}

export { adjustPrice };