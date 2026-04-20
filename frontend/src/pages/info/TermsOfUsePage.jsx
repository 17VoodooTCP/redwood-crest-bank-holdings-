import InfoPageShell from './InfoPageShell';
import { FileText, AlertTriangle } from 'lucide-react';

const sections = [
  { title: 'Acceptance of Terms', content: 'By accessing or using Redwood Crest Bank\'s online banking services, mobile application, or website (collectively, the "Services"), you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing the Services. These Terms of Use apply to all visitors, users, and others who access or use the Services.' },
  { title: 'Account Responsibilities', content: 'You are responsible for maintaining the confidentiality of your account credentials, including your username, password, and any multi-factor authentication devices. You agree to accept responsibility for all activities that occur under your account. You must immediately notify Redwood Crest Bank of any unauthorized use of your account or any other breach of security. The bank will not be liable for any loss arising from your failure to comply with this section.' },
  { title: 'Electronic Communications', content: 'When you use the Services or send emails, text messages, and other communications from your devices to us, you are communicating with us electronically. You consent to receive communications from us electronically. We will communicate with you by email, push notifications, text messages, or by posting notices on our website or through the Services. You agree that all agreements, notices, disclosures, and other communications provided to you electronically satisfy any legal requirement that such communications be in writing.' },
  { title: 'Funds Transfer Services', content: 'Transfers initiated through the Services are subject to applicable laws including the Electronic Fund Transfer Act and Regulation E, as well as the bank\'s Funds Transfer Agreement. Transfer limits, processing times, and fees may apply as disclosed in your account agreement. The bank reserves the right to decline any transfer request that it determines, in its sole discretion, may involve fraud, a violation of law, or unacceptable risk.' },
  { title: 'Prohibited Activities', content: 'You agree not to use the Services for any purpose that is unlawful or prohibited by these Terms. You may not: (a) use the Services in any manner that could damage, disable, overburden, or impair the Services; (b) attempt to gain unauthorized access to any portion of the Services or any systems or networks connected to the Services; (c) use any automated means to access the Services; (d) transmit any viruses, worms, defects, or other items of a destructive nature; or (e) use the Services to transmit unsolicited commercial communications.' },
  { title: 'Intellectual Property', content: 'The Services and their entire contents, features, and functionality are owned by Redwood Crest Bank, N.A., its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. The Redwood Crest name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Redwood Crest Bank, N.A.' },
  { title: 'Disclaimer of Warranties', content: 'THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, REDWOOD CREST BANK DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. THE BANK DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.' },
  { title: 'Limitation of Liability', content: 'IN NO EVENT SHALL REDWOOD CREST BANK, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES. THE BANK\'S TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT OF FEES PAID BY YOU TO THE BANK DURING THE TWELVE MONTHS PRECEDING THE CLAIM.' },
  { title: 'Governing Law', content: 'These Terms of Use shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any dispute arising from these Terms or the Services shall be resolved exclusively in the federal and state courts located in San Francisco County, California. You consent to the personal jurisdiction of such courts.' },
  { title: 'Changes to Terms', content: 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days\' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Services after any revisions become effective, you agree to be bound by the revised terms.' },
];

export default function TermsOfUsePage() {
  return (
    <InfoPageShell title="Terms of Use">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900">Effective Date: January 1, 2026</p>
          <p className="text-sm text-gray-600 mt-1">Please read these terms carefully before using our services. These terms constitute a legally binding agreement between you and Redwood Crest Bank, N.A.</p>
        </div>
      </div>

      {/* Table of contents */}
      <div className="bg-gray-50 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">Table of Contents</h3>
        <div className="grid grid-cols-2 gap-1">
          {sections.map((s, i) => (
            <a key={i} href={`#section-${i}`} className="text-sm text-[#0A1E3F] hover:underline">{i + 1}. {s.title}</a>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((s, i) => (
          <div key={i} id={`section-${i}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{i + 1}. {s.title}</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
        <p>If you have questions about these Terms of Use, contact us at support@redwoodcresthq.com</p>
      </div>
    </InfoPageShell>
  );
}
