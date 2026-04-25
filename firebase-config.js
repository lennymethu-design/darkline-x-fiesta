// DARKLINE X FIESTA — Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAC2ctWv8fu06DNYFzeT76pote-KUFbxfA",
  authDomain: "darkline-x-fiesta.firebaseapp.com",
  projectId: "darkline-x-fiesta",
  storageBucket: "darkline-x-fiesta.firebasestorage.app",
  messagingSenderId: "22306597234",
  appId: "1:22306597234:web:c11a440fff8b284d3795eb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── SEED TICKETS (run once) ──
export async function seedTickets() {
  const tickets = [
    { id: "spectator", name: "Fiesta Spectator", type: "Individual", price: 350, total: 100, available: 100, perks: ["Tournament access all day", "Cheer on your favourite team", "General seating area"] },
    { id: "regular", name: "Darkline Regular", type: "Individual", price: 800, total: 150, available: 150, perks: ["Afterparty entry from 8 PM", "Dance floor access", "Bar access"] },
    { id: "vip", name: "Darkline V.I.P", type: "VIP", price: 1500, total: 40, available: 40, perks: ["Panoramic rooftop access", "DJ booth proximity", "Reserved seating", "Exclusive pool table"] },
    { id: "fullpack", name: "Full-Pack VIP", type: "Full Pack", price: 1800, total: 40, available: 40, perks: ["Tournament + afterparty", "All VIP privileges", "Rooftop + reserved seating", "The complete experience"] }
  ];
  for (const t of tickets) {
    await setDoc(doc(db, "tickets", t.id), t);
  }
  console.log("Tickets seeded!");
}

// ── LIVE TICKET LISTENER ──
export function listenToTickets(callback) {
  return onSnapshot(collection(db, "tickets"), (snapshot) => {
    const tickets = [];
    snapshot.forEach(doc => tickets.push({ id: doc.id, ...doc.data() }));
    callback(tickets);
  });
}

// ── BOOK TICKET ──
export async function bookTicket(ticketId, quantity = 1) {
  const ref = doc(db, "tickets", ticketId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Ticket not found");
  const data = snap.data();
  if (data.available < quantity) throw new Error("Not enough tickets available");
  await updateDoc(ref, { available: data.available - quantity });
  // Save booking record
  await setDoc(doc(collection(db, "bookings")), {
    ticketId,
    ticketName: data.name,
    price: data.price,
    quantity,
    total: data.price * quantity,
    timestamp: new Date().toISOString(),
    status: "pending_payment"
  });
  return { success: true, remaining: data.available - quantity };
}

// ── GET ALL BOOKINGS (admin) ──
export async function getBookings() {
  const { getDocs } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const snap = await getDocs(collection(db, "bookings"));
  const bookings = [];
  snap.forEach(d => bookings.push({ id: d.id, ...d.data() }));
  return bookings;
}

export { db };
