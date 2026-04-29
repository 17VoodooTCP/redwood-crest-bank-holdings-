import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BankLogo from '../../components/BankLogo';

export default function InfoPageShell({ title, subtitle, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-gradient-to-b from-[#0f2847] to-[#0A1E3F] text-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-blue-200 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <BankLogo size="nav" />
          </div>
          <button onClick={() => navigate('/')} className="text-sm text-blue-200 hover:text-white transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Hero */}
      {subtitle && (
        <div className="bg-gradient-to-br from-[#0A1E3F] to-[#1a3a6b] text-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
            <p className="text-blue-200 text-lg max-w-2xl">{subtitle}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {!subtitle && <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>}
        {children}
      </div>

      {/* Footer */}
      <div className="bg-[#2c2c2c] text-gray-400 text-xs py-6 text-center">
        <p>© {new Date().getFullYear()} Redwood Crest · Built by Antonio Hill · Software engineering portfolio · Accounts shown are fictional</p>
      </div>
    </div>
  );
}
