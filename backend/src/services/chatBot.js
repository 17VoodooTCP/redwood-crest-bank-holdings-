/**
 * AI Chat Bot — handles automated responses before agent takeover
 */

const WELCOME_MESSAGE = {
  content: "Welcome to Redwood Crest Bank! I'm your virtual assistant. How can I help you today?",
  suggestions: [
    "Check my account balance",
    "Report a lost or stolen card",
    "Transfer funds between accounts",
    "Dispute a transaction",
    "Speak with a live agent"
  ]
};

const BOT_RESPONSES = [
  {
    keywords: ['balance', 'account balance', 'check balance', 'how much'],
    response: "I can help you check your balance! For security, I'm unable to display your account details in this chat. You can view your balances on your dashboard, or I can connect you with a live agent who can assist further.",
    suggestions: ["Go to my dashboard", "Speak with a live agent", "Something else"]
  },
  {
    keywords: ['lost card', 'stolen card', 'lost or stolen', 'report card', 'missing card'],
    response: "I'm sorry to hear about your card. For immediate assistance with a lost or stolen card, I recommend speaking with a live agent who can freeze your card and issue a replacement right away.",
    suggestions: ["Speak with a live agent", "Freeze my card", "Something else"]
  },
  {
    keywords: ['transfer', 'send money', 'move money', 'transfer funds'],
    response: "You can transfer funds between your accounts from the Pay & Transfer section. Would you like me to guide you there, or would you prefer to speak with an agent?",
    suggestions: ["Go to transfers", "Speak with a live agent", "Something else"]
  },
  {
    keywords: ['dispute', 'unauthorized', 'fraud', 'charge I didn', 'didn\'t make'],
    response: "I understand you'd like to dispute a transaction. For transaction disputes, I'll need to connect you with a specialist who can review the charge and initiate the dispute process.",
    suggestions: ["Speak with a live agent", "View recent transactions", "Something else"]
  },
  {
    keywords: ['live agent', 'speak with', 'real person', 'human', 'representative', 'talk to someone'],
    response: "I'll connect you with the next available agent. Please hold on while I transfer you...",
    suggestions: [],
    action: 'REQUEST_AGENT'
  },
  {
    keywords: ['wire', 'wire transfer', 'international transfer'],
    response: "Wire transfers can be initiated from the Wire Transfer section. Domestic wires have a $25 fee and international wires have a $45 fee. Would you like to proceed or speak with an agent?",
    suggestions: ["Go to wire transfers", "Speak with a live agent", "Something else"]
  },
  {
    keywords: ['payment', 'pay bill', 'credit card payment', 'pay credit'],
    response: "You can make credit card payments from the Pay & Transfer section. You can pay the minimum, statement balance, current balance, or a custom amount.",
    suggestions: ["Go to payments", "Speak with a live agent", "Something else"]
  },
  {
    keywords: ['hours', 'open', 'business hours', 'when are you'],
    response: "Our digital banking services are available 24/7. Live chat agents are available Monday through Friday, 8 AM - 10 PM ET, and Saturday 9 AM - 5 PM ET.",
    suggestions: ["Speak with a live agent", "Something else"]
  },
  {
    keywords: ['password', 'reset password', 'forgot password', 'change password', 'locked out'],
    response: "For password resets and account access issues, please visit the Security Center in your settings. If you're locked out, a live agent can help verify your identity and restore access.",
    suggestions: ["Go to security settings", "Speak with a live agent", "Something else"]
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    response: "Hello! How can I assist you with your banking needs today?",
    suggestions: ["Check my account balance", "Transfer funds", "Report a lost card", "Speak with a live agent"]
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate'],
    response: "You're welcome! Is there anything else I can help you with?",
    suggestions: ["No, that's all", "Speak with a live agent", "Something else"]
  },
  {
    keywords: ['no', 'that\'s all', 'nothing else', 'i\'m good', 'all set'],
    response: "Thank you for banking with Redwood Crest! Have a great day. Feel free to chat with us anytime you need assistance.",
    suggestions: []
  }
];

const FALLBACK_RESPONSE = {
  content: "I appreciate your question. Let me see how I can help. For more complex inquiries, I'd recommend speaking with one of our live agents who can provide personalized assistance.",
  suggestions: ["Speak with a live agent", "Check my balance", "Transfer funds", "Something else"]
};

function getWelcomeMessage() {
  return WELCOME_MESSAGE;
}

function getBotResponse(userMessage) {
  const lower = userMessage.toLowerCase().trim();

  for (const entry of BOT_RESPONSES) {
    const matched = entry.keywords.some(kw => lower.includes(kw));
    if (matched) {
      return {
        content: entry.response,
        suggestions: entry.suggestions,
        action: entry.action || null
      };
    }
  }

  return { ...FALLBACK_RESPONSE, action: null };
}

module.exports = { getWelcomeMessage, getBotResponse };
