import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

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
  // ⛏️ À adapter selon ta logique de banque centrale
  console.log(`💰 Crédits ORID : ${oridAmount} pour wallet ${userId}`);
  // Appelle ici ta fonction d'injection dans le stock, ex:
  // await injectOridToWallet(userId, oridAmount);
}