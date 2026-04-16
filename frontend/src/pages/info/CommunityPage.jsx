import InfoPageShell from './InfoPageShell';
import { Heart, Home, GraduationCap, Leaf, Users, DollarSign } from 'lucide-react';

const initiatives = [
  { icon: Home, title: 'Affordable Housing', amount: '$30B', desc: 'Committed to expanding affordable housing access through low-interest mortgages, grants, and partnerships with nonprofit developers in 25 metropolitan areas.', img: '🏘️' },
  { icon: GraduationCap, title: 'Financial Literacy', amount: '$500M', desc: 'Free workshops, online courses, and in-school programs reaching over 2 million people annually. Topics include budgeting, credit building, and retirement planning.', img: '📚' },
  { icon: Users, title: 'Small Business Support', amount: '$12B', desc: 'Lending and mentorship programs for small businesses and minority-owned enterprises, including microloans starting at $500 and free business advisory services.', img: '🏪' },
  { icon: Leaf, title: 'Environmental Sustainability', amount: '$2.5B', desc: 'Financing for renewable energy projects, green building initiatives, and sustainable agriculture. Committed to carbon neutrality by 2030.', img: '🌿' },
];

const stats = [
  { value: '$50B+', label: 'Community investments since 2020' },
  { value: '750K+', label: 'Volunteer hours by employees annually' },
  { value: '2M+', label: 'People reached through financial education' },
  { value: '15,000+', label: 'Nonprofit partnerships' },
];

export default function CommunityPage() {
  return (
    <InfoPageShell title="Community Impact" subtitle="At Redwood Crest, we believe in the power of community. Our investments in people, neighborhoods, and businesses drive lasting change.">
      {/* Impact numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-gradient-to-br from-[#0A1E3F] to-[#1a3a6b] text-white rounded-xl p-5 text-center">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-blue-200 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Initiatives */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Commitments</h2>
      <div className="space-y-6 mb-12">
        {initiatives.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-48 bg-gray-100 flex items-center justify-center py-8 md:py-0 text-5xl">
                {item.img}
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <item.icon className="w-5 h-5 text-[#0A1E3F]" />
                  <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{item.amount}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Volunteer */}
      <div className="bg-blue-50 rounded-xl p-8 text-center mb-8">
        <Heart className="w-10 h-10 text-[#0A1E3F] mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Employee Volunteer Program</h3>
        <p className="text-sm text-gray-600 max-w-xl mx-auto mb-4">Every Redwood Crest employee receives 40 hours of paid volunteer time per year. Last year, our team contributed over 750,000 hours to communities across the country.</p>
        <button className="bg-[#0A1E3F] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0f2847] transition-colors">Learn about our programs</button>
      </div>
    </InfoPageShell>
  );
}
