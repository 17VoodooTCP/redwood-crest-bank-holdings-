import InfoPageShell from './InfoPageShell';
import { Shield, Lock, Smartphone, AlertTriangle, Eye, Key, Fingerprint, Bell } from 'lucide-react';

const protections = [
  { icon: Lock, title: '256-Bit Encryption', desc: 'All data transmitted between your device and our servers is protected with bank-grade AES-256 encryption, the same standard used by the U.S. government for classified information.' },
  { icon: Fingerprint, title: 'Biometric Authentication', desc: 'Log in securely with Face ID, Touch ID, or fingerprint recognition on supported devices. Biometric data never leaves your device and is never stored on our servers.' },
  { icon: Eye, title: 'Real-Time Fraud Monitoring', desc: 'Our AI-powered fraud detection system monitors every transaction 24/7, analyzing patterns and flagging suspicious activity in real-time to protect your accounts.' },
  { icon: Key, title: 'Two-Factor Authentication', desc: 'Add an extra layer of security with 2FA. Even if someone obtains your password, they cannot access your account without the second authentication factor.' },
  { icon: Bell, title: 'Instant Security Alerts', desc: 'Receive immediate notifications for new device logins, large transactions, password changes, and other security-sensitive events via push notification, email, or text.' },
  { icon: Smartphone, title: 'Card Lock/Unlock', desc: 'Instantly lock your debit or credit card from the mobile app if it\'s lost or stolen. Unlock it just as easily when you find it, without calling customer service.' },
];

const tips = [
  'Never share your password, PIN, or one-time codes with anyone — Redwood Crest will never ask for these',
  'Use unique passwords for your banking accounts — avoid reusing passwords from other websites',
  'Enable two-factor authentication (2FA) for an extra layer of protection',
  'Keep your contact information up to date so we can reach you about suspicious activity',
  'Monitor your accounts regularly and report unauthorized transactions immediately',
  'Be cautious of emails, texts, or calls claiming to be from your bank — verify by calling us directly',
  'Keep your devices and apps updated with the latest security patches',
  'Use a secure, private Wi-Fi network when accessing online banking — avoid public Wi-Fi',
];

const scamTypes = [
  { title: 'Phishing Emails', desc: 'Fraudulent emails that appear to come from Redwood Crest, asking you to click a link and enter your login credentials. We will never send emails asking for your password.' },
  { title: 'Phone Scams (Vishing)', desc: 'Callers impersonating bank employees requesting account information or one-time codes. If unsure, hang up and call us at +1(603)661-9146.' },
  { title: 'Text Message Scams (Smishing)', desc: 'Fake text messages about suspicious activity with links to fraudulent websites. Our legitimate alerts never include clickable links to login pages.' },
  { title: 'Check Fraud', desc: 'Fake checks deposited into your account with a request to wire money back. If a check seems too good to be true, wait for it to fully clear before acting.' },
];

export default function SecurityCenterPage() {
  return (
    <InfoPageShell title="Security Center" subtitle="Your security is our top priority. Learn about the measures we take to protect your accounts and what you can do to stay safe.">
      {/* Zero liability badge */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-10 flex items-center gap-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <Shield className="w-7 h-7 text-green-700" />
        </div>
        <div>
          <h3 className="font-bold text-green-800 text-lg">Zero Liability Protection</h3>
          <p className="text-sm text-green-700 mt-1">You won't be held responsible for unauthorized transactions on your Redwood Crest accounts when you report them promptly. Our fraud team works around the clock to protect you.</p>
        </div>
      </div>

      {/* How we protect you */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Protect You</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {protections.map((p, i) => (
          <div key={i} className="flex gap-4 p-5 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <p.icon className="w-5 h-5 text-[#0A1E3F]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{p.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Protect yourself */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Protect Yourself</h2>
      <div className="bg-gray-50 rounded-xl p-6 mb-12">
        <div className="grid md:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5 shrink-0">✓</span>
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Common scams */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-yellow-500" /> Common Scams to Watch For
      </h2>
      <div className="space-y-4 mb-10">
        {scamTypes.map((s, i) => (
          <div key={i} className="border border-yellow-200 bg-yellow-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
            <p className="text-sm text-gray-700">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Report fraud */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-red-800 text-lg mb-2">Report Fraud Immediately</h3>
        <p className="text-sm text-red-700 mb-4">If you suspect unauthorized activity on your account, contact us right away.</p>
        <p className="text-xl font-bold text-red-800">+1(603)661-9146</p>
        <p className="text-xs text-red-600 mt-1">Available 24 hours a day, 7 days a week</p>
      </div>
    </InfoPageShell>
  );
}
