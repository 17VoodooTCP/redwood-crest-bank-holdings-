import InfoPageShell from './InfoPageShell';
import { Phone, MessageCircle, Mail, Clock, MapPin, CreditCard, Wallet, Shield, HelpCircle } from 'lucide-react';

const contactMethods = [
  { icon: Phone, title: 'Call Us', primary: '+1(603)661-9146', subtitle: 'Available 24/7 for account inquiries', highlight: true },
  { icon: MessageCircle, title: 'Live Chat', primary: 'Chat with an agent', subtitle: 'Mon-Fri 8 AM - 10 PM ET, Sat 9 AM - 5 PM ET', highlight: true },
  { icon: Mail, title: 'Secure Message', primary: 'Send us a message', subtitle: 'Through your online banking inbox. Response within 24 hours.' },
  { icon: MapPin, title: 'Visit a Branch', primary: '1,200+ locations', subtitle: 'Find your nearest branch or ATM' },
];

const departments = [
  { name: 'General Banking', phone: '+1(603)661-9146', hours: '24/7' },
  { name: 'Credit Card Services', phone: '+1(603)661-9146', hours: '24/7' },
  { name: 'Mortgage & Home Equity', phone: '+1(603)661-9146', hours: 'Mon-Fri 8 AM - 9 PM ET' },
  { name: 'Wire Transfers', phone: '+1(603)661-9146', hours: 'Mon-Fri 8 AM - 8 PM ET' },
  { name: 'Fraud & Security', phone: '+1(603)661-9146', hours: '24/7' },
  { name: 'International Services', phone: '+1(603)661-9146', hours: 'Mon-Fri 9 AM - 6 PM ET' },
];

const quickHelp = [
  { icon: CreditCard, title: 'Lost or Stolen Card', desc: 'Report immediately and get a replacement card sent within 1-2 business days.' },
  { icon: Shield, title: 'Report Fraud', desc: 'Dispute unauthorized transactions and secure your account.' },
  { icon: Wallet, title: 'Account Balance', desc: 'Check balances via phone banking, online, or at any ATM.' },
  { icon: HelpCircle, title: 'Reset Password', desc: 'Regain access to your online banking account securely.' },
];

export default function CustomerServicePage() {
  return (
    <InfoPageShell title="Customer Service" subtitle="We're here to help. Reach us by phone, chat, message, or in person at any of our 1,200+ branches nationwide.">
      {/* Contact cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {contactMethods.map((c, i) => (
          <div key={i} className={`rounded-xl p-5 text-center cursor-pointer transition-all hover:shadow-lg ${c.highlight ? 'bg-[#0A1E3F] text-white' : 'bg-white border border-gray-200 text-gray-800 hover:border-blue-300'}`}>
            <c.icon className={`w-8 h-8 mx-auto mb-3 ${c.highlight ? 'text-blue-200' : 'text-[#0A1E3F]'}`} />
            <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
            <p className={`text-sm font-medium ${c.highlight ? 'text-white' : 'text-[#0A1E3F]'}`}>{c.primary}</p>
            <p className={`text-xs mt-1 ${c.highlight ? 'text-blue-200' : 'text-gray-500'}`}>{c.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Quick Help */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Help</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {quickHelp.map((q, i) => (
          <div key={i} className="flex gap-4 p-5 border border-gray-200 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <q.icon className="w-5 h-5 text-[#0A1E3F]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{q.title}</h3>
              <p className="text-xs text-gray-600 mt-0.5">{q.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department directory */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Department Directory</h2>
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-10">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">Department</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">Phone</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">Hours</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d, i) => (
              <tr key={i} className={`${i < departments.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-blue-50 transition-colors`}>
                <td className="px-5 py-3.5 font-medium text-sm text-gray-900">{d.name}</td>
                <td className="px-5 py-3.5 text-sm text-[#0A1E3F] font-medium">{d.phone}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500 flex items-center gap-1"><Clock size={13} />{d.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600">For TTY/TDD services, call <strong>+1(603)661-9146</strong></p>
        <p className="text-xs text-gray-400 mt-2">International callers: +1(603)661-9146 | support@redwoodcresthq.com</p>
      </div>
    </InfoPageShell>
  );
}
