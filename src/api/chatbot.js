/**
 * Chatbot & support ticket API service.
 * Client-side FAQ matching is used now (instant, no latency).
 * Swap for real endpoints when backend is ready:
 *   POST /api/chatbot/message  → { reply: string }
 *   POST /api/support/ticket   → { ticketId: string }
 */

export async function sendChatMessage(message) {
  // When backend is ready, replace with:
  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chatbot/message`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
  //   },
  //   body: JSON.stringify({ message }),
  // })
  // return res.json()

  await new Promise((r) => setTimeout(r, 800))
  return { reply: null } // client-side FAQ lookup handles response
}

export async function createSupportTicket({ subject, message }) {
  // When backend is ready, replace with:
  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/support/ticket`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
  //   },
  //   body: JSON.stringify({ subject, message }),
  // })
  // return res.json()

  await new Promise((r) => setTimeout(r, 1200))
  return { ticketId: `SP-${Math.floor(1000 + Math.random() * 9000)}` }
}
