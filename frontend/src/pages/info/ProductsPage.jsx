import InfoPageShell from './InfoPageShell';
import { CreditCard, Wallet, PiggyBank, ArrowRightLeft, Shield, Star, Check, Zap } from 'lucide-react';
import { useParams } from 'react-router-dom';

const products = {
  checking: {
    title: 'Checking Accounts',
    subtitle: 'Everyday banking made simple. Choose the checking account that fits your lifestyle.',
    items: [
      {
        name: 'Premier Checking',
        icon: Wallet,
        fee: '$12/mo',
        feeWaiver: 'Waived with $1,500 min balance or $500 direct deposit',
        apy: '0.01%',
        features: ['No minimum opening deposit', 'Access to 16,000+ ATMs', 'Mobile check deposit', 'Real-time fraud alerts', 'Free online bill pay', 'Zelle integration for instant transfers'],
        highlight: true
      },
      {
        name: 'Secure Checking',
        icon: Shield,
        fee: '$4.95/mo',
        feeWaiver: 'No waiver available — low-cost option',
        apy: '0.01%',
        features: ['No minimum balance required', 'Debit card included', 'Mobile & online banking', 'Direct deposit available', 'ChexSystems-friendly'],
        highlight: false
      },
      {
        name: 'Premier Plus Checking',
        icon: Star,
        fee: '$25/mo',
        feeWaiver: 'Waived with $75,000 in combined balances',
        apy: '0.02%',
        features: ['No ATM fees worldwide', 'Dedicated relationship manager', 'Preferred mortgage rates', 'Free checks & cashier\'s checks', 'No foreign transaction fees', 'Priority customer service line'],
        highlight: false
      },
    ]
  },
  savings: {
    title: 'Savings Accounts',
    subtitle: 'Grow your money with competitive rates and no surprises.',
    items: [
      {
        name: 'Redwood Crest Savings',
        icon: PiggyBank,
        fee: '$5/mo',
        feeWaiver: 'Waived with $300 min balance or linked checking',
        apy: '4.00%',
        features: ['$25 minimum opening deposit', 'Automatic savings plans', 'Unlimited digital transfers', 'FDIC insured up to $250,000', 'Goal-based savings tools', 'No minimum balance to earn APY'],
        highlight: true
      },
      {
        name: 'High-Yield Money Market',
        icon: TrendingUpIcon,
        fee: '$0/mo',
        feeWaiver: 'No monthly fee with $1,000 minimum',
        apy: '4.50%',
        features: ['$1,000 minimum opening deposit', 'Check-writing privileges', 'Debit card access', 'Tiered interest rates', 'FDIC insured', 'Easy access to funds'],
        highlight: false
      },
    ]
  },
  'credit-cards': {
    title: 'Credit Cards',
    subtitle: 'Earn rewards on every purchase with no annual fee options and premium travel benefits.',
    items: [
      {
        name: 'Redwood Preferred Card',
        icon: CreditCard,
        fee: '$95/year',
        feeWaiver: 'Annual fee',
        apy: '19.49%–26.49% variable APR',
        features: ['2X points on travel & dining', '60,000 bonus points after $4,000 spent in 3 months', 'No foreign transaction fees', 'Trip cancellation insurance', 'Primary rental car coverage', 'Transfer points to 14+ travel partners'],
        highlight: true
      },
      {
        name: 'Redwood Unlimited',
        icon: Zap,
        fee: '$0/year',
        feeWaiver: 'No annual fee',
        apy: '20.49%–29.24% variable APR',
        features: ['1.5% cash back on every purchase', '$200 bonus after $500 spent in 3 months', '5% on travel via portal', '3% on dining & drugstores', 'No minimum to redeem', '0% intro APR for 15 months'],
        highlight: false
      },
    ]
  },
  'wire-transfer': {
    title: 'Wire Transfers',
    subtitle: 'Send money domestically or internationally with speed and security.',
    items: [
      {
        name: 'Domestic Wire Transfer',
        icon: ArrowRightLeft,
        fee: '$25 per transfer',
        feeWaiver: 'Free for Premier Plus accounts',
        apy: 'Same-day processing',
        features: ['Same-day delivery if initiated before 4 PM ET', 'Available online, mobile, or in-branch', 'Transfer up to $100,000 per day', 'Real-time tracking', 'Encrypted end-to-end', 'Confirmation notifications'],
        highlight: true
      },
      {
        name: 'International Wire Transfer',
        icon: Globe2Icon,
        fee: '$45 per transfer',
        feeWaiver: 'Reduced to $35 for Premier Plus',
        apy: '1-3 business days',
        features: ['Send to 200+ countries', 'Multiple currency support', 'Competitive exchange rates', 'SWIFT network', 'Full tracking with reference number', 'Recipient notifications available'],
        highlight: false
      },
    ]
  },
};

function TrendingUpIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}
function Globe2Icon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
}

export default function ProductsPage() {
  const { product } = useParams();
  const data = products[product] || products.checking;

  return (
    <InfoPageShell title={data.title} subtitle={data.subtitle}>
      <div className="space-y-6">
        {data.items.map((item, i) => (
          <div key={i} className={`border rounded-xl overflow-hidden ${item.highlight ? 'border-[#0A1E3F] ring-1 ring-[#0A1E3F]' : 'border-gray-200'}`}>
            {item.highlight && (
              <div className="bg-[#0A1E3F] text-white text-xs font-semibold text-center py-1.5">Most Popular</div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-[#0A1E3F]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.feeWaiver}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#0A1E3F]">{item.fee}</div>
                  <div className="text-xs text-gray-500">{item.apy}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {item.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${item.highlight ? 'bg-[#0A1E3F] text-white hover:bg-[#0f2847]' : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50'}`}>
                  {data.title.includes('Credit') ? 'Apply Now' : 'Open Account'}
                </button>
                <button className="px-6 py-2.5 rounded-lg text-sm font-medium text-[#0A1E3F] hover:underline">Learn More</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600">Not sure which option is right for you? <strong className="text-[#0A1E3F]">Call +1(603)661-9146</strong> to speak with a banking specialist.</p>
      </div>
    </InfoPageShell>
  );
}
