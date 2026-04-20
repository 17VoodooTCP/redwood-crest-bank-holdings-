import InfoPageShell from './InfoPageShell';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

const releases = [
  { date: 'April 10, 2026', title: 'Redwood Crest Bank Launches AI-Powered Financial Assistant for All Customers', category: 'Innovation', summary: 'The bank introduces a new AI assistant that helps customers manage budgets, detect unusual spending, and optimize savings goals in real-time.' },
  { date: 'March 28, 2026', title: 'Redwood Crest Reports Record Q1 2026 Net Income of $13.2 Billion', category: 'Financial Results', summary: 'Strong performance driven by growth in consumer banking and wealth management, with deposits increasing 12% year-over-year.' },
  { date: 'March 15, 2026', title: 'Redwood Crest Commits $30 Billion to Affordable Housing Initiatives', category: 'Community', summary: 'A new five-year commitment to expand affordable housing access across underserved communities in 25 metropolitan areas.' },
  { date: 'February 20, 2026', title: 'Redwood Crest Named to Fortune\'s "Most Admired Companies" List for 8th Consecutive Year', category: 'Awards', summary: 'Recognition reflects the bank\'s commitment to innovation, financial strength, and social responsibility.' },
  { date: 'February 5, 2026', title: 'New Mobile Banking Features Enable Real-Time Wire Transfers and Enhanced Security', category: 'Innovation', summary: 'Customers can now initiate international wire transfers directly from the mobile app with biometric authentication.' },
  { date: 'January 22, 2026', title: 'Redwood Crest Opens 50 New Community Branches Across the Southeast', category: 'Expansion', summary: 'Expansion includes branches in underbanked communities, creating 800 new jobs and offering free financial literacy workshops.' },
  { date: 'January 14, 2026', title: 'Redwood Crest Bank Reports Full Year 2025 Net Income of $49.6 Billion', category: 'Financial Results', summary: 'Annual results reflect disciplined expense management and record consumer banking revenue across all product lines.' },
  { date: 'December 12, 2025', title: 'Redwood Crest Partners with Leading Universities on Cybersecurity Research', category: 'Security', summary: 'A $15 million investment in cybersecurity research partnerships with MIT, Stanford, and Carnegie Mellon.' },
];

const categoryColors = {
  'Innovation': 'bg-purple-100 text-purple-700',
  'Financial Results': 'bg-green-100 text-green-700',
  'Community': 'bg-blue-100 text-blue-700',
  'Awards': 'bg-yellow-100 text-yellow-700',
  'Expansion': 'bg-teal-100 text-teal-700',
  'Security': 'bg-red-100 text-red-700',
};

export default function PressReleasesPage() {
  return (
    <InfoPageShell title="Press Releases" subtitle="Stay up to date with the latest news and announcements from Redwood Crest Bank.">
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        {['All', 'Financial Results', 'Innovation', 'Community', 'Expansion'].map(f => (
          <button key={f} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${f === 'All' ? 'bg-[#0A1E3F] text-white border-[#0A1E3F]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-0 border border-gray-200 rounded-xl overflow-hidden">
        {releases.map((r, i) => (
          <div key={i} className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${i < releases.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12} />{r.date}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[r.category] || 'bg-gray-100 text-gray-600'}`}>{r.category}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2 hover:text-[#0A1E3F] transition-colors">{r.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.summary}</p>
            <span className="text-sm text-[#0A1E3F] font-medium flex items-center gap-1 hover:underline">Read full release <ArrowRight size={14} /></span>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-3">Media Contact</p>
        <p className="text-sm font-medium text-gray-800">Redwood Crest Bank Corporate Communications</p>
        <p className="text-sm text-gray-600">support@redwoodcresthq.com | +1(603)661-9146</p>
      </div>
    </InfoPageShell>
  );
}
