import InfoPageShell from './InfoPageShell';
import { Lock, Eye, Shield, FileText, Bell, UserX } from 'lucide-react';

const sections = [
  {
    icon: Eye, title: 'Information We Collect',
    content: `We collect personal information when you open an account, apply for a loan, use our online or mobile banking services, or contact us for customer support. This may include:

• Full name, date of birth, and Social Security number
• Home address, email address, and phone number
• Employment and income information
• Account balances, transaction history, and credit information
• Device information, IP address, and browser type when using digital services
• Geolocation data when you use location-based features with your consent

We also collect information from third parties, including credit reporting agencies, identity verification services, and public databases, to verify your identity and assess creditworthiness.`
  },
  {
    icon: Shield, title: 'How We Protect Your Information',
    content: `Redwood Crest Bank employs industry-leading security measures to protect your personal and financial information:

• 256-bit AES encryption for all data in transit and at rest
• Multi-factor authentication for online and mobile banking access
• Real-time fraud monitoring and transaction anomaly detection
• Regular third-party security audits and penetration testing
• Employee access controls with role-based permissions
• Physical security measures at all data centers and branch locations

Our information security program is regularly assessed against NIST Cybersecurity Framework standards and PCI DSS compliance requirements.`
  },
  {
    icon: FileText, title: 'How We Use Your Information',
    content: `We use personal information to provide and improve our banking services, including:

• Processing transactions and maintaining your accounts
• Verifying your identity and preventing fraud
• Communicating with you about your accounts, products, and services
• Complying with legal and regulatory requirements
• Improving our products, services, and customer experience
• Conducting internal research and analytics

We do not sell your personal information to third parties for their marketing purposes. We may share information with service providers who assist us in operating our business, subject to strict confidentiality agreements.`
  },
  {
    icon: Bell, title: 'Your Privacy Choices',
    content: `You have several choices regarding your personal information:

• Opt out of marketing communications at any time by calling +1(603)661-9146 or through your account settings
• Request access to the personal information we hold about you
• Request correction of inaccurate information
• Set your browser to reject cookies or alert you when cookies are placed
• Opt out of certain information sharing with affiliates for marketing purposes
• Limit sharing of personal information with non-affiliated third parties

To exercise any of these rights, contact us at support@redwoodcresthq.com or call our Privacy Office at +1(603)661-9146.`
  },
  {
    icon: UserX, title: 'Children\'s Privacy',
    content: `Our online services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected information from a child under 13, we will take steps to delete that information promptly.

For custodial accounts opened on behalf of minors, a parent or legal guardian must provide consent and manage the account until the minor reaches the age of majority.`
  },
];

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell title="Privacy Policy">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#0A1E3F] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900">Last Updated: March 1, 2026</p>
          <p className="text-sm text-gray-600 mt-1">This privacy policy describes how Redwood Crest Bank, N.A. and its affiliates collect, use, share, and protect personal information. By using our services, you acknowledge that you have read and understood this policy.</p>
        </div>
      </div>

      <div className="space-y-10">
        {sections.map((s, i) => (
          <div key={i}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <s.icon className="w-5 h-5 text-[#0A1E3F]" />
              {s.title}
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{s.content}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Our Privacy Office</h2>
        <p className="text-sm text-gray-600 mb-4">If you have questions about this policy or wish to exercise your privacy rights, please contact us:</p>
        <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 space-y-1">
          <p><strong>Redwood Crest Bank Privacy Office</strong></p>
          <p>1442 Redwood Valley Road, San Francisco, CA 94105</p>
          <p>Email: support@redwoodcresthq.com</p>
          <p>Phone: +1(603)661-9146</p>
        </div>
      </div>
    </InfoPageShell>
  );
}
