import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, ChevronRight, Shield, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const steps = ['Personal Information', 'Create Login', 'Review & Submit'];

const RegisterPage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    ssn4: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setError('');
  };

  // Password strength
  const passChecks = {
    length: form.password.length >= 8,
    lower: /[a-z]/.test(form.password),
    upper: /[A-Z]/.test(form.password),
    digit: /\d/.test(form.password),
  };
  const passStrength = Object.values(passChecks).filter(Boolean).length;

  const validateStep0 = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.password) errs.password = 'Password is required';
    else if (!passChecks.length || !passChecks.lower || !passChecks.upper || !passChecks.digit) {
      errs.password = 'Password does not meet requirements';
    }
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!form.agreeTerms) {
      setError('You must agree to the terms and conditions.');
      return;
    }
    setIsLoading(true);
    setError('');
    const result = await register(form.firstName.trim(), form.lastName.trim(), form.email.trim(), form.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const inputClass = (field) =>
    `w-full border ${fieldErrors[field] ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0A1E3F] focus:ring-1 focus:ring-[#0A1E3F] transition-colors`;

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/login" className="flex items-center gap-2 shrink-0">
            <div style={{ height: '30px', width: '170px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png?v=18" alt="Redwood Crest" style={{ height: '120px', width: 'auto', margin: '-45px 0', maxWidth: 'none', objectFit: 'contain' }} />
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Shield size={14} className="text-green-600" />
            <span className="hidden sm:inline">Secure & encrypted</span>
            <span className="text-gray-300">|</span>
            <Link to="/login" className="text-[#0A1E3F] font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-[580px]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Open an Account</h1>
            <p className="text-sm text-gray-500">Join millions of customers who trust Redwood Crest</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#0A1E3F] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-[#0A1E3F]' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-[2px] mx-2 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 text-sm rounded-r">
                {error}
              </div>
            )}

            {/* Step 0: Personal Info */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Tell us about yourself</h2>
                <p className="text-xs text-gray-500 mb-4">All fields marked with * are required.</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">First name *</label>
                    <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} className={inputClass('firstName')} placeholder="First name" />
                    {fieldErrors.firstName && <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last name *</label>
                    <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} className={inputClass('lastName')} placeholder="Last name" />
                    {fieldErrors.lastName && <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email address *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass('email')} placeholder="your.email@example.com" />
                  {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone number</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass('phone')} placeholder="+1(603)661-9146" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Street address</label>
                  <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className={inputClass('address')} placeholder="123 Main Street" />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <input type="text" value={form.city} onChange={e => set('city', e.target.value)} className={inputClass('city')} placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                    <input type="text" value={form.state} onChange={e => set('state', e.target.value)} className={inputClass('state')} placeholder="NY" maxLength={2} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ZIP</label>
                    <input type="text" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} className={inputClass('zipCode')} placeholder="10001" maxLength={5} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last 4 digits of SSN</label>
                  <input type="password" value={form.ssn4} onChange={e => set('ssn4', e.target.value.replace(/\D/g, ''))} className={inputClass('ssn4')} placeholder="****" maxLength={4} style={{ maxWidth: '140px' }} />
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Lock size={10} /> This information is encrypted and securely stored</p>
                </div>
              </div>
            )}

            {/* Step 1: Create Login */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Create your login credentials</h2>
                <p className="text-xs text-gray-500 mb-4">Your email will be used as your username.</p>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
                  <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">Username:</span> {form.email}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Create password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      className={inputClass('password')}
                      placeholder="Create a strong password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}

                  {/* Strength bar */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            passStrength >= i
                              ? passStrength <= 2 ? 'bg-red-400' : passStrength === 3 ? 'bg-yellow-400' : 'bg-green-500'
                              : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { key: 'length', label: 'At least 8 characters' },
                          { key: 'lower', label: 'One lowercase letter' },
                          { key: 'upper', label: 'One uppercase letter' },
                          { key: 'digit', label: 'One number' },
                        ].map(r => (
                          <div key={r.key} className={`flex items-center gap-1.5 text-[11px] ${passChecks[r.key] ? 'text-green-600' : 'text-gray-400'}`}>
                            <Check size={12} className={passChecks[r.key] ? 'text-green-500' : 'text-gray-300'} />
                            {r.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)}
                      className={inputClass('confirmPassword')}
                      placeholder="Re-enter your password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check size={12} /> Passwords match</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Review your information</h2>
                <p className="text-xs text-gray-500 mb-4">Please verify that everything looks correct before submitting.</p>

                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-gray-500">Name</span>
                      <span className="text-gray-900 font-medium">{form.firstName} {form.lastName}</span>
                      <span className="text-gray-500">Email</span>
                      <span className="text-gray-900 font-medium">{form.email}</span>
                      {form.phone && <><span className="text-gray-500">Phone</span><span className="text-gray-900">{form.phone}</span></>}
                      {form.address && <><span className="text-gray-500">Address</span><span className="text-gray-900">{form.address}{form.city && `, ${form.city}`}{form.state && `, ${form.state}`} {form.zipCode}</span></>}
                      {form.ssn4 && <><span className="text-gray-500">SSN</span><span className="text-gray-900">***-**-{form.ssn4}</span></>}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Login Credentials</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-gray-500">Username</span>
                      <span className="text-gray-900 font-medium">{form.email}</span>
                      <span className="text-gray-500">Password</span>
                      <span className="text-gray-900">{'*'.repeat(form.password.length)}</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={e => set('agreeTerms', e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-[#0A1E3F] focus:ring-[#0A1E3F]"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      I agree to the Redwood Crest <Link to="/terms" className="text-[#0A1E3F] underline">Terms of Use</Link>, <Link to="/privacy" className="text-[#0A1E3F] underline">Privacy Policy</Link>, and <Link to="/terms" className="text-[#0A1E3F] underline">Electronic Communications Agreement</Link>. I understand that Redwood Crest will use the information I provide to manage this fictional portfolio account.
                    </span>
                  </label>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 text-xs text-gray-500 bg-green-50 border border-green-100 rounded-lg p-3">
                  <Shield size={16} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 mb-0.5">Your information is secure</p>
                    <p className="text-green-700">We use 256-bit encryption and multi-layer security to protect your personal data. We will never share your information without your consent.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
              {step > 0 ? (
                <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-[#0A1E3F] hover:underline font-medium">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-1 text-sm text-[#0A1E3F] hover:underline font-medium">
                  <ArrowLeft size={16} /> Sign in instead
                </Link>
              )}

              {step < 2 ? (
                <button
                  onClick={handleNext}
                  className="bg-[#0A1E3F] hover:bg-[#06132A] text-white font-semibold text-sm px-8 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-[#0A1E3F] hover:bg-[#06132A] text-white font-semibold text-sm px-8 py-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  {isLoading ? 'Creating account...' : 'Open your account'}
                </button>
              )}
            </div>
          </div>

          {/* Bottom help */}
          <div className="text-center mt-6 text-xs text-gray-500">
            <p>Need help? Call <strong className="text-gray-700">+1(603)661-9146</strong> or visit a <Link to="/atm-locator" className="text-[#0A1E3F] underline">nearby branch</Link>.</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-gray-400">
          <Link to="/privacy" className="hover:text-[#0A1E3F]">Privacy</Link>
          <Link to="/security-center" className="hover:text-[#0A1E3F]">Security</Link>
          <Link to="/terms" className="hover:text-[#0A1E3F]">Terms of Use</Link>
          <Link to="/accessibility" className="hover:text-[#0A1E3F]">Accessibility</Link>
          <span>© {new Date().getFullYear()} Redwood Crest · Portfolio project · Not a real bank</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
