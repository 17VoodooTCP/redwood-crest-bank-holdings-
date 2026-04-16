import InfoPageShell from './InfoPageShell';
import { TrendingUp, FileText, Calendar, DollarSign, BarChart3, ArrowUpRight } from 'lucide-react';

const financials = [
  { label: 'Total Assets', value: '$3.4 Trillion', change: '+8.2%' },
  { label: 'Net Revenue', value: '$142.6B', change: '+5.1%' },
  { label: 'Net Income', value: '$49.6B', change: '+12.3%' },
  { label: 'Return on Equity', value: '17.2%', change: '+1.8pp' },
];

const reports = [
  { title: '2025 Annual Report', date: 'February 28, 2026', type: 'Annual' },
  { title: 'Q4 2025 Earnings Release', date: 'January 14, 2026', type: 'Quarterly' },
  { title: 'Q3 2025 Earnings Release', date: 'October 13, 2025', type: 'Quarterly' },
  { title: 'Q2 2025 Earnings Release', date: 'July 14, 2025', type: 'Quarterly' },
  { title: 'Q1 2025 Earnings Release', date: 'April 11, 2025', type: 'Quarterly' },
];

const events = [
  { title: 'Q1 2026 Earnings Call', date: 'April 11, 2026', time: '8:30 AM ET' },
  { title: 'Annual Shareholder Meeting', date: 'May 20, 2026', time: '10:00 AM CT' },
  { title: 'Morgan Stanley Financials Conference', date: 'June 10, 2026', time: '2:00 PM ET' },
];

export default function InvestorRelationsPage() {
  return (
    <InfoPageShell title="Investor Relations" subtitle="Delivering long-term value for our shareholders through disciplined growth, sound risk management, and operational excellence.">
      {/* Stock info */}
      <div className="bg-gray-50 rounded-xl p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500 font-medium">NASDAQ: RWCB</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">$198.42</div>
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1">
            <ArrowUpRight size={16} /> +$2.37 (1.21%) today
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <div>Market Cap: <strong className="text-gray-800">$587.2B</strong></div>
          <div>Dividend Yield: <strong className="text-gray-800">2.54%</strong></div>
          <div>P/E Ratio: <strong className="text-gray-800">11.85</strong></div>
        </div>
      </div>

      {/* Key financials */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Financial Highlights</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {financials.map((f, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm text-gray-500 mb-2">{f.label}</div>
            <div className="text-xl font-bold text-gray-900">{f.value}</div>
            <div className="text-sm text-green-600 font-medium mt-1">{f.change} YoY</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Reports */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={20} /> SEC Filings & Reports</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {reports.map((r, i) => (
              <div key={i} className={`p-4 flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer ${i < reports.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{r.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.date}</div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{r.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={20} /> Upcoming Events</h2>
          <div className="space-y-4">
            {events.map((e, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">{e.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={13} />{e.date}</span>
                  <span>{e.time}</span>
                </div>
                <button className="mt-3 text-sm text-[#0A1E3F] font-medium hover:underline">Register for webcast</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Shareholder Services</h3>
        <p className="text-sm text-gray-600 mb-3">For questions about your shares, dividends, or transfer agent services, please contact our shareholder services team.</p>
        <p className="text-sm font-medium text-[#0A1E3F]">+1(603)661-9146 | support@redwoodcrestholdings.com</p>
      </div>
    </InfoPageShell>
  );
}
