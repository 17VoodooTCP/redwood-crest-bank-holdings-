import InfoPageShell from './InfoPageShell';
import { Briefcase, MapPin, TrendingUp, Heart, GraduationCap, Users } from 'lucide-react';

const jobs = [
  { title: 'Senior Software Engineer', location: 'San Francisco, CA', dept: 'Technology', type: 'Full-time' },
  { title: 'Financial Analyst II', location: 'New York, NY', dept: 'Finance', type: 'Full-time' },
  { title: 'Branch Manager', location: 'Austin, TX', dept: 'Retail Banking', type: 'Full-time' },
  { title: 'Cybersecurity Specialist', location: 'Remote', dept: 'Information Security', type: 'Full-time' },
  { title: 'UX Designer', location: 'San Francisco, CA', dept: 'Digital Experience', type: 'Full-time' },
  { title: 'Mortgage Loan Officer', location: 'Denver, CO', dept: 'Home Lending', type: 'Full-time' },
];

const benefits = [
  { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive medical, dental, and vision coverage for you and your family from day one.' },
  { icon: TrendingUp, title: '401(k) Match', desc: 'Dollar-for-dollar match up to 6% of your salary, plus additional profit-sharing contributions.' },
  { icon: GraduationCap, title: 'Tuition Reimbursement', desc: 'Up to $5,250 per year for approved undergraduate and graduate programs.' },
  { icon: Users, title: 'Parental Leave', desc: '16 weeks of fully paid parental leave for birth, adoption, and foster placement.' },
];

export default function CareersPage() {
  return (
    <InfoPageShell title="Careers at Redwood Crest" subtitle="Build your future with one of America's most trusted banks. We're looking for passionate people who want to make a difference.">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { num: '48,000+', label: 'Employees worldwide' },
          { num: '1,200+', label: 'Branch locations' },
          { num: '50', label: 'States with presence' },
          { num: '#12', label: 'Best Places to Work' },
        ].map((s, i) => (
          <div key={i} className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-[#0A1E3F]">{s.num}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Redwood Crest?</h2>
      <div className="grid md:grid-cols-2 gap-5 mb-12">
        {benefits.map((b, i) => (
          <div key={i} className="flex gap-4 p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <b.icon className="w-6 h-6 text-[#0A1E3F]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Open positions */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
        {jobs.map((job, i) => (
          <div key={i} className={`flex items-center justify-between p-5 hover:bg-blue-50 transition-colors cursor-pointer ${i < jobs.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div>
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>
                <span>{job.dept}</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{job.type}</span>
              </div>
            </div>
            <button className="text-sm font-medium text-[#0A1E3F] hover:underline">Apply</button>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500">Redwood Crest Bank is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.</p>
    </InfoPageShell>
  );
}
