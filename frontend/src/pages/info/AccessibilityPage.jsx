import InfoPageShell from './InfoPageShell';
import { Accessibility, Monitor, Smartphone, Headphones, Eye, Keyboard } from 'lucide-react';

const features = [
  { icon: Eye, title: 'Screen Reader Compatibility', desc: 'Our website and mobile app are compatible with popular screen readers including JAWS, NVDA, VoiceOver, and TalkBack. All images include descriptive alt text, and all form fields are properly labeled.' },
  { icon: Keyboard, title: 'Keyboard Navigation', desc: 'All functionality is available using a keyboard alone. We ensure logical tab order, visible focus indicators, and skip navigation links to help keyboard users navigate efficiently.' },
  { icon: Monitor, title: 'Visual Accommodations', desc: 'Our digital services support text resizing up to 200% without loss of content. We maintain sufficient color contrast ratios (4.5:1 minimum) and do not rely solely on color to convey information.' },
  { icon: Smartphone, title: 'Mobile Accessibility', desc: 'Our mobile banking app supports VoiceOver (iOS) and TalkBack (Android), dynamic type scaling, and reduced motion settings. Touch targets meet minimum size requirements of 44x44 pixels.' },
  { icon: Headphones, title: 'Assistive Technology Support', desc: 'Our branches are equipped with hearing loop systems, large-print and Braille documents are available upon request, and TTY/TDD services are available for phone banking.' },
];

export default function AccessibilityPage() {
  return (
    <InfoPageShell title="Accessibility" subtitle="Redwood Crest Bank is committed to ensuring that our products, services, and facilities are accessible to everyone, including individuals with disabilities.">
      {/* Standards */}
      <div className="bg-blue-50 rounded-xl p-6 mb-10">
        <h2 className="font-bold text-gray-900 mb-2">Our Commitment</h2>
        <p className="text-sm text-gray-700 leading-relaxed">We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Our digital accessibility program includes regular automated testing, manual audits by accessibility experts, and ongoing usability testing with people who have disabilities. We continuously work to improve the accessibility of our digital services.</p>
      </div>

      {/* Features */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Accessibility Features</h2>
      <div className="space-y-5 mb-12">
        {features.map((f, i) => (
          <div key={i} className="flex gap-4 p-5 border border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <f.icon className="w-6 h-6 text-[#0A1E3F]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Branch accessibility */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Branch Accessibility</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {[
          'Wheelchair-accessible entrances and service areas',
          'Accessible ATMs with audio instructions and Braille keypads',
          'Hearing loop systems at teller windows',
          'Reserved accessible parking spaces',
          'Service animals welcome in all locations',
          'Large-print and Braille documents available on request',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-green-500 mt-0.5">✓</span>
            {item}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3">Need Assistance?</h3>
        <p className="text-sm text-gray-600 mb-4">If you experience any difficulty accessing our services or have suggestions for improvement, we want to hear from you.</p>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Accessibility Hotline:</strong> +1(603)661-9146</p>
          <p><strong>TTY/TDD:</strong> +1(603)661-9146</p>
          <p><strong>Email:</strong> support@redwoodcresthq.com</p>
          <p><strong>Mail:</strong> Redwood Crest Bank Accessibility Office, 1442 Redwood Valley Road, San Francisco, CA 94105</p>
        </div>
      </div>
    </InfoPageShell>
  );
}
