const io = require('socket.io-client');
const fetch = require('node-fetch');

const PORT = process.env.PORT || process.env.port || 3000;
const BASE = process.env.API_BASE_URL || `http://localhost:${PORT}`;

async function createConversation() {
  const res = await fetch(`${BASE}/chat/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerName: 'TestUser' }),
  });
  const data = await res.json();
  return data.linkId || data.link || data;
}

async function run() {
  console.log('Using backend at', BASE);
  const linkId = await createConversation();
  console.log('Created conversation linkId=', linkId);

  // Enable AI chat for this conversation so the server will respond when messages arrive
  try {
    await fetch(`${BASE}/chat/conversations/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatGptActive: true }),
    });
    console.log('Enabled ChatGPT for conversation', linkId);
  } catch (e) {
    console.error('Failed to enable ChatGPT:', e);
  }

  // Confirm conversation flags
  try {
    // Poll the conversation until chatGptActive is true (or timeout)
    let ok = false;
    const start = Date.now();
    while (Date.now() - start < 10000) {
      const info = await fetch(`${BASE}/chat/conversations/${linkId}`);
      const js = await info.json();
      console.log('Conversation info:', js);
      if (js && (js.chatGptActive === true || js.AIChatActive === true)) {
        ok = true;
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }
    if (!ok) console.warn('Timed out waiting for chatGptActive to become true');
  } catch (e) {
    console.error('Failed to fetch conversation info:', e);
  }

  // Short delay to avoid race between PATCH and the incoming socket message
  await new Promise(r => setTimeout(r, 300));

  const staff = io(`${BASE}`);
  const customer = io(`${BASE}`);

  staff.on('connect', () => {
    console.log('staff connected:', staff.id);
    staff.emit('join_conversation', linkId);
  });
  customer.on('connect', () => {
    console.log('customer connected:', customer.id);
    customer.emit('join_conversation', linkId);
  });

  staff.on('receive_message', (msg) => console.log('[staff] receive_message', msg));
  customer.on('receive_message', (msg) => console.log('[customer] receive_message', msg));
  staff.on('typing', (d) => console.log('[staff] typing', d));
  customer.on('typing', (d) => console.log('[customer] typing', d));


  await new Promise(r => setTimeout(r, 1000));

  console.log('customer sends message');
  customer.emit('send_message', { conversationId: linkId, sender: 'client', text: 'Hello from customer' });

  // wait to receive events
  setTimeout(() => {
    console.log('closing clients');
    staff.close();
    customer.close();
    process.exit(0);
  }, 5000);
}

run().catch(err => { console.error(err); process.exit(1); });
