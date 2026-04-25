// DARKLINE X FIESTA — M-Pesa Daraja STK Push
const axios = require('axios');

const CONSUMER_KEY = 'RIMCb963QAxBdgGPSCrheRd8QuAS54QVPvzNSnpjQAlGyuTW';
const CONSUMER_SECRET = 'Wol8ulzxYeHgAYINqgXbA52o6IMnoyX1Zk29TDMg5DFhFOoWR1GMZqybFPQSpXqC';
const SHORTCODE = '174379';
const PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const CALLBACK_URL = 'https://darkline-fiesta.requestcatcher.com/callback';

// Get access token
async function getToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return res.data.access_token;
}

// STK Push
async function stkPush({ phone, amount, ref, name }) {
  const token = await getToken();
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  // Format phone: 0712345678 → 254712345678
  let formattedPhone = phone.replace(/\s+/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
  if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);

  const res = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: ref || 'DarklineFiesta',
      TransactionDesc: `Ticket - ${name}`
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

module.exports = { stkPush, getToken };
