/**
 * Chatbot & support API service.
 *   POST /api/chatbot/ask      { question } → { answer, escalatable, sources, confidence }
 *   POST /api/support/tickets  { subject, message } → { ticket }
 *   POST /api/support/escalate { subject, message, transcript? } → { ticket, ... }
 */
import { api } from './client';

export async function sendChatMessage(question) {
  const data = await api('/chatbot/ask', { method: 'POST', body: { question } });
  return {
    answer: data.answer,
    escalatable: !!data.escalatable,
    sources: data.sources || [],
    confidence: data.confidence,
  };
}

export async function createSupportTicket({ subject, message, transcript } = {}) {
  // Escalate when we have a chat transcript to attach, otherwise open a plain ticket.
  const path = transcript ? '/support/escalate' : '/support/tickets';
  const data = await api(path, {
    method: 'POST',
    body: { subject, message, ...(transcript ? { transcript } : {}) },
  });
  const ticket = data.ticket || {};
  return { ticketId: ticket.id || ticket._id || ticket.number || '' };
}
