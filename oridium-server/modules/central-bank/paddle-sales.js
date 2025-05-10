import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { withdraw } from './stock.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const historyPath = path.join(__dirname, '../../data/history.json');

/**
 * Crée un lien de paiement dynamique Paddle pour un pack ORID
 * @param {Object} options
 * @param {number} options.price - Prix en EUR ou USD
 * @param {string} options.userId - ID du wallet utilisateur
 * @param {number} options.oridAmount - Quantité d'ORID à livrer
 * @returns {Promise<string>} - URL du paiement Paddle
 */
export async function createPaddlePayLink({ price, userId, oridAmount }) {
  const payload = {
    vendor_id: process.env.PADDLE_VENDOR_ID,
    vendor_auth_code: process.env.PADDLE_API_KEY,
    title: `ORID Pack (${oridAmount})`,
    webhook_url: process.env.PADDLE_WEBHOOK_URL,
    prices: [`EUR:${price.toFixed(2)}`],
    quantity_variable: false,
    passthrough: JSON.stringify({
      user_id: userId,
      orid_amount: oridAmount
    }),
    return_url: process.env.PADDLE_RETURN_URL || 'https://oridium.io/thank-you'
  };

  try {
    const { data } = await axios.post(
      'https://sandbox-vendors.paddle.com/api/2.0/product/generate_pay_link',
      null,
      { params: payload }
    );

    if (!data.success) {
      console.error('❌ Paddle Pay Link error:', data);
      throw new Error('Failed to create Paddle pay link');
    }

    return data.response.url;
  } catch (err) {
    console.error('❌ Error creating Paddle Pay Link:', err.message);
    throw err;
  }
}

/**
 * Créditer un utilisateur après paiement
 * @param {string} userId - ID utilisateur
 * @param {number} oridAmount - Montant à créditer
 */
export async function creditOrid(userId, oridAmount) {
  try {
    console.log(`💸 Retrait du stock : ${oridAmount} ORID pour ${userId}`);
    withdraw(oridAmount);

    console.log(`📝 Ajout au journal d'historique...`);
    let history = [];
    if (fs.existsSync(historyPath)) {
      const raw = fs.readFileSync(historyPath, 'utf-8').trim();
      if (raw) history = JSON.parse(raw);
    }

    history.push({
      timestamp: new Date().toISOString(),
      wallet: userId,
      amount: oridAmount
    });

    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    console.log(`✅ ORID crédités à ${userId} (amount: ${oridAmount})`);
  } catch (err) {
    console.error('❌ Erreur lors du crédit d’ORID :', err.message);
    throw err;
  }
}