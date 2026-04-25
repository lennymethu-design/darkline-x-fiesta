const express = require('express');
const cors = require('cors');
const path = require('path');
const { stkPush } = require('./mpesa');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// STK Push endpoint
app.post('/pay', async (req, res) => {
  const { phone, amount, ticketName, customerName } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' });
  try {
    const result = await stkPush({
      phone,
      amount,
      ref: 'DarklineFiesta',
      name: ticketName || 'Ticket'
    });
    console.log(`\n💳 STK Push sent to ${phone} for KSH ${amount}`);
    console.log(`   Customer: ${customerName}`);
    console.log(`   Ticket: ${ticketName}`);
    console.log(`   CheckoutID: ${result.CheckoutRequestID}\n`);
    res.json({ success: true, checkoutId: result.CheckoutRequestID, message: 'M-Pesa prompt sent to your phone!' });
  } catch (err) {
    console.error('STK Push error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Payment failed. Try again.', details: err.response?.data });
  }
});

// M-Pesa callback
app.post('/mpesa/callback', (req, res) => {
  const data = req.body;
  console.log('\n📲 M-Pesa Callback received:');
  console.log(JSON.stringify(data, null, 2));
  const result = data?.Body?.stkCallback;
  if (result?.ResultCode === 0) {
    console.log('✅ Payment SUCCESSFUL');
    console.log('   Amount:', result.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value);
    console.log('   Phone:', result.CallbackMetadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value);
    console.log('   Receipt:', result.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value);
  } else {
    console.log('❌ Payment FAILED or CANCELLED');
  }
  res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// Contact form
app.post('/contact', (req, res) => {
  const { firstName, email, subject, message } = req.body;
  if (!email || !message) return res.status(400).json({ error: 'Email and message required' });
  console.log(`\n📬 Contact from ${firstName} <${email}>: ${subject}`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🔥 DARKLINE × FIESTA server running`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   STK Push: POST http://localhost:${PORT}/pay\n`);
});
