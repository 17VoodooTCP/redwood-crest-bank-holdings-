import InfoPageShell from './InfoPageShell';
import { Phone, Mail, MapPin, MessageCircle, Globe, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <InfoPageShell title="Contact Us" subtitle="We'd love to hear from you. Whether you have a question, feedback, or need assistance, our team is ready to help.">
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Contact form */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800 mb-2">Message Sent!</h3>
              <p className="text-sm text-green-700">Thank you for reaching out. A member of our team will respond within 1-2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1E3F] focus:border-transparent" placeholder="Alex Johnson" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1E3F] focus:border-transparent" placeholder="alex@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1E3F] focus:border-transparent">
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="account">Account Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="complaint">File a Complaint</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="business">Business Banking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1E3F] focus:border-transparent resize-none" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="w-full bg-[#0A1E3F] hover:bg-[#0f2847] text-white py-3 rounded-lg text-sm font-semibold transition-colors">Send Message</button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Other Ways to Reach Us</h2>
          <div className="space-y-4">
            {[
              { icon: Phone, title: 'Phone', lines: ['General: +1(603)661-9146', 'Credit Cards: +1(603)661-9146', 'Fraud Hotline: +1(603)661-9146'] },
              { icon: MessageCircle, title: 'Live Chat', lines: ['Available through online banking', 'Mon-Fri 8 AM - 10 PM ET', 'Sat 9 AM - 5 PM ET'] },
              { icon: Mail, title: 'Email', lines: ['support@redwoodcrestholdings.com', 'P.O. Box 15298', 'San Francisco, CA 94115-0298'] },
              { icon: MapPin, title: 'Headquarters', lines: ['1442 Redwood Valley Road', 'San Francisco, CA 94105', 'United States'] },
              { icon: Globe, title: 'International', lines: ['From outside the US:', '+1(603)661-9146', 'Mon-Fri 9 AM - 6 PM ET'] },
            ].map((c, i) => (
              <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-xl">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-[#0A1E3F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{c.title}</h3>
                  {c.lines.map((l, j) => (
                    <p key={j} className="text-xs text-gray-600">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center text-sm">
        <p className="font-medium text-yellow-800">For urgent matters such as fraud or stolen cards, please call us immediately at <strong>+1(603)661-9146</strong> (24/7)</p>
        <p className="text-yellow-700 text-xs mt-1">Do not include sensitive information such as account numbers, Social Security numbers, or passwords in email or web form communications.</p>
      </div>
    </InfoPageShell>
  );
}
