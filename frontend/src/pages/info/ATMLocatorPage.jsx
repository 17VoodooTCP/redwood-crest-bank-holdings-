import InfoPageShell from './InfoPageShell';
import { MapPin, Search, Clock, CreditCard, Banknote, Building2 } from 'lucide-react';
import { useState } from 'react';

const locations = [
  { name: 'Redwood Crest - Financial District', address: '100 Market Street, San Francisco, CA 94105', type: 'Branch & ATM', hours: 'Mon-Fri 9 AM - 5 PM', distance: '0.3 mi', services: ['Drive-through', 'Safe deposit boxes', 'Notary'] },
  { name: 'Redwood Crest - Union Square', address: '345 Post Street, San Francisco, CA 94108', type: 'Branch & ATM', hours: 'Mon-Fri 9 AM - 6 PM, Sat 9 AM - 1 PM', distance: '0.8 mi', services: ['Drive-through', 'Mortgage specialist'] },
  { name: 'Redwood Crest ATM - Embarcadero Center', address: '2 Embarcadero Center, San Francisco, CA 94111', type: 'ATM Only', hours: '24/7', distance: '1.1 mi', services: ['Cash deposit', 'Check deposit'] },
  { name: 'Redwood Crest - Mission District', address: '2800 Mission Street, San Francisco, CA 94110', type: 'Branch & ATM', hours: 'Mon-Fri 9 AM - 5 PM', distance: '2.4 mi', services: ['Spanish-speaking staff', 'Business banking'] },
  { name: 'Redwood Crest ATM - SFO Airport', address: 'Terminal 1, SFO Airport, San Francisco, CA 94128', type: 'ATM Only', hours: '24/7', distance: '12.1 mi', services: ['International currency'] },
  { name: 'Redwood Crest - Palo Alto', address: '180 University Avenue, Palo Alto, CA 94301', type: 'Branch & ATM', hours: 'Mon-Fri 9 AM - 5 PM, Sat 9 AM - 1 PM', distance: '33.2 mi', services: ['Wealth management', 'Private client'] },
];

export default function ATMLocatorPage() {
  const [search, setSearch] = useState('');

  return (
    <InfoPageShell title="ATM & Branch Locator" subtitle="Find Redwood Crest Bank branches and ATMs near you. Over 1,200 branches and 16,000 ATMs nationwide.">
      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Enter address, city, state, or ZIP code"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1E3F] focus:border-transparent"
            />
          </div>
          <button className="bg-[#0A1E3F] hover:bg-[#0f2847] text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <MapPin size={16} /> Search
          </button>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" /> Branches
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" /> ATMs
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" /> Open now
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" /> Drive-through
          </label>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-gray-200 rounded-xl h-64 mb-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center"></div>
        <div className="relative z-10 text-center">
          <MapPin className="w-10 h-10 text-[#0A1E3F] mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Interactive map</p>
          <p className="text-xs text-gray-500">Search to see locations near you</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Building2, num: '1,200+', label: 'Branches' },
          { icon: Banknote, num: '16,000+', label: 'ATMs' },
          { icon: CreditCard, num: '50', label: 'States' },
        ].map((s, i) => (
          <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
            <s.icon className="w-6 h-6 text-[#0A1E3F] mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{s.num}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Nearby locations */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Locations</h2>
      <div className="space-y-3">
        {locations.map((loc, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{loc.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${loc.type === 'ATM Only' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>{loc.type}</span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin size={13} />{loc.address}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Clock size={12} />{loc.hours}</p>
                <div className="flex gap-2 mt-2">
                  {loc.services.map((s, j) => (
                    <span key={j} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-sm font-bold text-[#0A1E3F]">{loc.distance}</span>
                <div className="mt-2">
                  <button className="text-xs text-[#0A1E3F] hover:underline font-medium">Get directions</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </InfoPageShell>
  );
}
