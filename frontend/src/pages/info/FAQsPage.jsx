import InfoPageShell from './InfoPageShell';
import { ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';

const categories = [
  {
    name: 'Account Management',
    faqs: [
      { q: 'How do I open a new account?', a: 'You can open a new checking, savings, or credit card account online in minutes. Simply click "Open an Account" from the dashboard, choose your account type, and follow the prompts. You\'ll need your Social Security number, a valid government-issued ID, and a minimum opening deposit (varies by account type). You can also visit any branch to open an account in person.' },
      { q: 'How do I close my account?', a: 'To close an account, please visit your nearest branch or call our customer service line at +1(603)661-9146. You\'ll need to ensure all pending transactions have cleared, outstanding checks have been cashed, and any automatic payments or direct deposits have been redirected. Remaining balances will be transferred to another account or issued as a check.' },
      { q: 'What are the fees for my checking account?', a: 'Our Total Checking account has a $12 monthly service fee, which is waived when you maintain a minimum daily balance of $1,500, receive direct deposits totaling $500 or more per month, or maintain an average beginning day balance of $5,000 or more in qualifying linked accounts. Student accounts have no monthly fee for up to 5 years.' },
      { q: 'How do I update my personal information?', a: 'You can update your email, phone number, and mailing address through the Settings page in online banking. For changes to your legal name or Social Security number, please visit a branch with supporting documentation (court order, marriage certificate, or updated Social Security card).' },
    ]
  },
  {
    name: 'Online & Mobile Banking',
    faqs: [
      { q: 'How do I reset my password?', a: 'Click "Forgot username/password?" on the login page. You\'ll be asked to verify your identity using your email address, phone number, and the last four digits of your Social Security number. Once verified, you can create a new password. For security, passwords must be at least 8 characters and include uppercase, lowercase, and numeric characters.' },
      { q: 'Is online banking secure?', a: 'Yes. We use 256-bit AES encryption, multi-factor authentication, real-time fraud monitoring, and automatic session timeouts. We also offer additional security features including two-factor authentication (2FA) via authenticator app, biometric login on mobile devices, and customizable account alerts for transactions over a threshold you set.' },
      { q: 'Can I deposit checks using my phone?', a: 'Yes! Our mobile check deposit feature allows you to deposit checks by taking a photo with your smartphone. Simply sign the back of the check, write "For Mobile Deposit at RWCB" below your signature, and follow the prompts in the mobile app. Deposits made before 8 PM ET on business days are typically available the next business day.' },
      { q: 'How do I set up account alerts?', a: 'Navigate to Settings > Account Alerts in your online banking or mobile app. You can set up alerts for low balances, large transactions, direct deposit arrivals, payment due dates, and security events like new device logins. Alerts can be delivered via email, push notification, or text message.' },
    ]
  },
  {
    name: 'Transfers & Payments',
    faqs: [
      { q: 'How long do transfers take?', a: 'Internal transfers between Redwood Crest accounts are instant. External transfers to other banks typically take 1-3 business days via ACH. Same-day ACH transfers are available for a fee of $3.00. Wire transfers are processed same-day if initiated before 4 PM ET (domestic) or 3 PM ET (international).' },
      { q: 'What are the wire transfer fees?', a: 'Domestic wire transfers: $25 per outgoing transfer, free for incoming. International wire transfers: $45 per outgoing transfer, $15 for incoming. Wire transfer fees are automatically deducted from the sending account at the time of the transfer.' },
      { q: 'Is there a transfer limit?', a: 'Daily transfer limits vary by account type and transfer method. Standard limits: Internal transfers up to $25,000/day, external ACH transfers up to $10,000/day, wire transfers up to $100,000/day. You can request higher limits by contacting customer service or visiting a branch with valid ID.' },
      { q: 'How do I set up automatic payments?', a: 'Go to Pay & Transfer > Automatic Payments. You can schedule recurring transfers between accounts, set up autopay for your credit card (minimum, statement balance, or full balance), and schedule regular savings transfers. All automatic payments can be modified or cancelled at any time.' },
    ]
  },
  {
    name: 'Security & Fraud',
    faqs: [
      { q: 'What should I do if I suspect fraud?', a: 'Immediately call our 24/7 Fraud Hotline at +1(603)661-9146. You can also lock your debit or credit card instantly through the mobile app or online banking by going to the card details page. We\'ll investigate the unauthorized activity, issue provisional credits if applicable, and send you a replacement card within 1-2 business days.' },
      { q: 'How does two-factor authentication work?', a: 'Two-factor authentication (2FA) adds an extra layer of security by requiring a one-time code in addition to your password. After enabling 2FA in Settings > Security, you\'ll scan a QR code with an authenticator app (like Google Authenticator or Authy). Each time you log in, you\'ll enter the 6-digit code from the app.' },
      { q: 'Does Redwood Crest ever ask for my password?', a: 'No. Redwood Crest Bank will never contact you by phone, email, or text to ask for your password, PIN, full Social Security number, or one-time security codes. If you receive such a request, it is a scam. Do not respond — instead, report it to our fraud team at +1(603)661-9146.' },
    ]
  },
];

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggle = (key) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <InfoPageShell title="Frequently Asked Questions" subtitle="Find answers to common questions about your accounts, online banking, transfers, and security.">
      {/* Search */}
      <div className="relative mb-10">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1E3F] focus:border-transparent"
        />
      </div>

      {/* FAQ sections */}
      <div className="space-y-8">
        {categories.map((cat, ci) => (
          <div key={ci}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{cat.name}</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {cat.faqs
                .filter(f => !searchTerm || f.q.toLowerCase().includes(searchTerm.toLowerCase()) || f.a.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((faq, fi) => {
                  const key = `${ci}-${fi}`;
                  const isOpen = openItems[key];
                  return (
                    <div key={fi} className={fi < cat.faqs.length - 1 ? 'border-b border-gray-100' : ''}>
                      <button
                        onClick={() => toggle(key)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-sm text-gray-900 pr-4">{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-50 rounded-xl p-6 text-center">
        <h3 className="font-bold text-gray-900 mb-2">Can't find what you're looking for?</h3>
        <p className="text-sm text-gray-600 mb-4">Our customer service team is available 24/7 to help.</p>
        <div className="flex justify-center gap-4">
          <button className="bg-[#0A1E3F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0f2847] transition-colors">Call +1(603)661-9146</button>
          <button className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Start Live Chat</button>
        </div>
      </div>
    </InfoPageShell>
  );
}
