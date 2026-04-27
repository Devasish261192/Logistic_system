import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Truck, 
  Users, 
  Calendar, 
  Fuel, 
  CreditCard, 
  History, 
  Camera, 
  Plus, 
  LogOut,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
  Package,
  ArrowRightLeft,
  Sun,
  Moon,
  Zap,
  Menu,
  X as XIcon,
  Trash2,
  Pencil,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole, Consignment, Attendance, Maintenance, Payment, FuelRefill, Analytics, ThemeType } from './types';

// --- Components ---

const CameraCapture = ({ onCapture, label }: { onCapture: (url: string) => void, label: string }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [camError, setCamError] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCamera = async () => {
    setCamError(false);
    setPreviewUrl(null);
    setIsStreamReady(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setIsCapturing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // On some browsers, we need to manually call play()
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (err) {
      console.warn("Camera failed, likely insecure context or permission denied:", err);
      setCamError(true);
      fileInputRef.current?.click();
    }
  };

  const snapPhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Safety: ensure video has started rendering
    if (video.readyState < 2) {
      alert("Camera still initializing, please wait a second...");
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const vW = video.videoWidth || 640;
    const vH = video.videoHeight || 480;
    canvas.width = vW;
    canvas.height = vH;
    
    ctx.drawImage(video, 0, 0, vW, vH);
    const url = canvas.toDataURL('image/jpeg', 0.85);
    setPreviewUrl(url);
    onCapture(url);
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setIsStreamReady(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setPreviewUrl(url);
      onCapture(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="col-header">{label}</label>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*"
        className="hidden" onChange={handleFile} />

      {/* Preview area */}
      <div className="relative aspect-video bg-black/5 flex flex-col items-center justify-center
        border border-dashed border-[var(--ink)]/20 overflow-hidden rounded-sm">

        {previewUrl && !isCapturing && (
          <div className="absolute inset-0 group">
            <img src={previewUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
              <button type="button" onClick={openCamera}
                className="btn-primary flex items-center gap-2 scale-90">
                <Camera size={14} /> Retake
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="btn-outline flex items-center gap-2 scale-90">
                <Camera size={14} /> Re-upload
              </button>
            </div>
            <div className="absolute top-2 left-2 bg-[var(--bg)] px-2 py-0.5 border border-[var(--ink)]/10">
              <span className="text-[9px] uppercase font-bold text-green-600">✓ Captured</span>
            </div>
          </div>
        )}

        {/* Live camera view */}
        {isCapturing && (
          <div className="w-full h-full relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              onCanPlay={() => setIsStreamReady(true)}
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <button 
                type="button" 
                onClick={snapPhoto}
                disabled={!isStreamReady}
                className={`bg-white text-black p-4 rounded-full shadow-2xl transition-transform ${!isStreamReady ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}>
                <Camera size={24} />
              </button>
              <button type="button" onClick={stopCamera}
                className="bg-red-500 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform">
                <XIcon size={24} />
              </button>
            </div>
            {!isStreamReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">Initializing Lens...</span>
              </div>
            )}
          </div>
        )}

        {/* Default: always show both buttons */}
        {!isCapturing && !previewUrl && (
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <div className="flex gap-3">
              <button type="button" onClick={openCamera}
                className="btn-primary flex items-center gap-2">
                <Camera size={15} /> Take Photo
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="btn-outline flex items-center gap-2">
                <Camera size={15} /> Upload Photo
              </button>
            </div>
            {camError && (
              <div className="space-y-1">
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Insecure Access (Browser Blocked Camera)</p>
                <p className="text-[9px] opacity-50 px-4">Use "Upload Photo" or "Take Photo" (Native Camera) instead.</p>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

const VehicleNumberInput = ({ value, onChange, placeholder, required = false }: { value: string, onChange: (v: string) => void, placeholder?: string, required?: boolean }) => {
  const formatValue = (raw: string) => {
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let parts = [];
    
    if (clean.length > 0) parts.push(clean.substring(0, 2));
    if (clean.length > 2) parts.push(clean.substring(2, 4));
    if (clean.length > 4) {
      const rest = clean.substring(4);
      const firstDigitIdx = rest.search(/\d/);
      if (firstDigitIdx === -1) {
        // Only letters in the third part so far
        parts.push(rest.substring(0, 2));
      } else {
        // e.g. "B1" or "AX1234"
        const seriesLen = firstDigitIdx === 0 ? 0 : Math.min(firstDigitIdx, 2);
        if (seriesLen > 0) {
          parts.push(rest.substring(0, seriesLen));
          parts.push(rest.substring(seriesLen, seriesLen + 4));
        } else {
          // If first char after district is a digit? Rare for MH-12 but possible.
          parts.push(rest.substring(0, 4));
        }
      }
    }
    return parts.join('-');
  };

  return (
    <input type="text" className="w-full input-architect uppercase font-mono"
      value={value} onChange={e => onChange(formatValue(e.target.value))}
      placeholder={placeholder} required={required} />
  );
};

const formatVehicleDisplay = (raw: string) => {
  if (!raw) return '';
  const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  let parts = [];
  if (clean.length > 0) parts.push(clean.substring(0, 2));
  if (clean.length > 2) parts.push(clean.substring(2, 4));
  if (clean.length > 4) {
    const rest = clean.substring(4);
    const firstDigitIdx = rest.search(/\d/);
    if (firstDigitIdx === -1) {
      parts.push(rest.substring(0, 2));
    } else {
      const seriesLen = firstDigitIdx === 0 ? 0 : Math.min(firstDigitIdx, 2);
      if (seriesLen > 0) {
        parts.push(rest.substring(0, seriesLen));
        parts.push(rest.substring(seriesLen, seriesLen + 4));
      } else {
        parts.push(rest.substring(0, 4));
      }
    }
  }
  return parts.join('-');
};

// --- Views ---

const ConsignmentPreviewModal = ({ data, onClose }: { data: Consignment, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg)]/95 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-4xl card-architect shadow-2xl relative bg-white text-black p-6 md:p-8 border-2 border-black/80 font-mono text-sm leading-tight mt-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-black opacity-50 hover:opacity-100 bg-white p-1 rounded-full shadow-md z-10 transition-transform hover:scale-110">
          <XIcon size={24} />
        </button>
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest">S S Enterprises</h1>
          <p className="text-xs mt-1">Lorry Receipt / Consignment Note</p>
        </div>
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b-2 border-black pb-4 mb-4">
          <div>
            <p><strong>LR No:</strong> {data.lr_no}</p>
            <p><strong>Truck No:</strong> {formatVehicleDisplay(data.truck_number)}</p>
            <p><strong>Date:</strong> {data.invoice_date}</p>
            <p><strong>Route:</strong> {data.from_location} {data.from_location && data.to_location ? 'to' : ''} {data.to_location}</p>
          </div>
          <div className="md:text-right">
            <p><strong>GST Payable By:</strong> {data.gst_payable_by}</p>
            <p className="break-words"><strong>Issuing Office:</strong> {data.issuing_office_address}</p>
          </div>
        </div>
        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b-2 border-black pb-4 mb-4 text-xs">
          <div>
            <h3 className="font-bold underline mb-1 uppercase text-black/60">Consignor</h3>
            <p className="font-bold text-sm tracking-tight">{data.consigner_name}</p>
            <p className="break-words">{data.consigner_address}</p>
            <p className="mt-1">GST: {data.consignor_gst}</p>
          </div>
          <div>
            <h3 className="font-bold underline mb-1 uppercase text-black/60">Consignee</h3>
            <p className="font-bold text-sm tracking-tight">{data.consignee_name}</p>
            <p className="break-words">{data.consignee_address}</p>
            <p className="mt-1">GST: {data.consignee_gst}</p>
          </div>
        </div>
        {/* Package & Freight breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b-2 border-black pb-4 mb-4 text-xs">
           <div className="md:col-span-2">
             <h3 className="font-bold underline mb-1 uppercase text-black/60">Package Details</h3>
             <p><strong>Qty:</strong> {data.package_qty} Units</p>
             <p><strong>Description:</strong> {data.description}</p>
             <p className="break-words"><strong>Delivery Address:</strong> {data.delivery_address}</p>
             <p className="mt-2 text-[10px] uppercase border p-2 text-justify">
              NOTICE: The Consignment covered by this Lorry Receipt shall be stored at destination under control of Transport Operator and shall be delivered to or to the order of consignee Bank.
             </p>
           </div>
           <div>
              <h3 className="font-bold underline mb-1 uppercase text-black/60">Freight Summary</h3>
              <div className="grid grid-cols-2 row-gap-1">
                <span>Actual Wt:</span> <span className="text-right">{data.weight_a}</span>
                <span>Charged Wt:</span> <span className="text-right">{data.weight_c}</span>
                <span>Rate:</span> <span className="text-right">{data.rate}</span>
                <span>Hamali:</span> <span className="text-right">{data.hamali}</span>
                <span>SurCharge:</span> <span className="text-right">{data.sc}</span>
                <span>FOV:</span> <span className="text-right">{(data as any).fov}</span>
                <span>Stat. Chg:</span> <span className="text-right">{data.st}</span>
                <span className="font-bold mt-2 pt-2 border-t border-black/20">TOTAL RS:</span> 
                <span className="font-bold mt-2 pt-2 border-t border-black/20 text-right text-lg">₹ {data.value_rs}</span>
              </div>
           </div>
        </div>
        {/* Images */}
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-center border-b border-black/10 pb-2 uppercase text-[10px]">1. Supervisor's Load Slip</h3>
              {data.initial_slip_url ? (
                <img src={data.initial_slip_url} className="w-full max-h-[300px] object-contain border border-black/20 p-2 shadow-sm" referrerPolicy="no-referrer" />
              ) : <p className="text-center opacity-30 italic border border-black/10 p-12 text-[10px]">No image provided.</p>}
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-center border-b border-black/10 pb-2 uppercase text-[10px]">2. Driver's Delivery Copy</h3>
              {data.delivered_slip_url ? (
                <img src={data.delivered_slip_url} className="w-full max-h-[300px] object-contain border border-black/20 p-2 shadow-sm" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex flex-col items-center justify-center border border-black/10 p-12 opacity-30 italic text-[10px]">
                  {data.status === 'delivered' ? 'Missing proof upload' : 'Pending delivery...'}
                </div>
              )}
            </div>
          </div>
          
          {data.status === 'delivered' && (
            <div className="border-t-2 border-dashed border-black/20 pt-4 flex justify-between items-center px-4">
              <span className="text-[10px] uppercase font-bold tracking-tighter">Status: Fully Delivered & Verified</span>
              <div className="w-16 h-16 border-2 border-green-600 rounded-full flex items-center justify-center opacity-40 rotate-12">
                <span className="text-[10px] font-bold text-green-600 uppercase">Passed</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoginView = ({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const user = await res.json();
      onLoginSuccess(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter uppercase font-mono italic">SS logistic Solution</h1>
          <p className="col-header">Logistics Management System</p>
        </div>

        <form onSubmit={handleLogin} className="card-architect space-y-6">
          <div className="space-y-1">
            <label className="col-header">Username</label>
            <input 
              type="text" 
              className="w-full input-architect" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="col-header">Password</label>
            <input 
              type="password" 
              className="w-full input-architect" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          <button type="submit" className="w-full btn-primary py-4">Login</button>
        </form>

        <div className="flex justify-center gap-6 opacity-30">
          <div className="flex items-center gap-1"><Shield size={12} /> <span className="text-[10px] uppercase font-bold">Encrypted</span></div>
          <div className="flex items-center gap-1"><Clock size={12} /> <span className="text-[10px] uppercase font-bold">v1.2.0</span></div>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  // Restore user immediately from localStorage — no loading delay
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('logitrack-user');
      return stored ? JSON.parse(stored) as User : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('logitrack-theme');
    return (saved as ThemeType) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('logitrack-theme', theme);
  }, [theme]);

  // Background revalidation: only clear session if server explicitly says user is gone (404)
  useEffect(() => {
    const stored = localStorage.getItem('logitrack-user');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as User;
      fetch(`/api/me?id=${parsed.id}`)
        .then(r => {
          if (r.status === 404) {
            // User was deleted from DB — force logout
            localStorage.removeItem('logitrack-user');
            setUser(null);
          } else if (r.ok) {
            r.json().then(freshUser => {
              setUser(freshUser); // refresh role/username in case it changed
              localStorage.setItem('logitrack-user', JSON.stringify(freshUser));
            });
          }
          // Any other error (network, 500, missing route) → keep session alive
        })
        .catch(() => { /* server unreachable — keep session */ });
    } catch {
      localStorage.removeItem('logitrack-user');
    }
  }, []);

  const login = (u: User) => {
    localStorage.setItem('logitrack-user', JSON.stringify(u));
    setUser(u);
  };
  
  // Data State
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fuel, setFuel] = useState<FuelRefill[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [c, a, m, p, f, an, u] = await Promise.all([
        fetch('/api/consignments').then(res => res.json()),
        fetch('/api/attendance').then(res => res.json()),
        fetch('/api/maintenance').then(res => res.json()),
        fetch('/api/payments').then(res => res.json()),
        fetch('/api/fuel').then(res => res.json()),
        fetch('/api/analytics').then(res => res.json()),
        fetch('/api/users').then(res => res.json()),
      ]);
      setConsignments(c);
      setAttendance(a);
      setMaintenance(m);
      setPayments(p);
      setFuel(f);
      setAnalytics(an);
      setAllUsers(u);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user) return <LoginView onLoginSuccess={login} />;

  const logout = () => {
    localStorage.removeItem('logitrack-user');
    setUser(null);
    setActiveTab('dashboard');
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all border-l-2 ${activeTab === id ? 'border-[var(--ink)] bg-[var(--ink)]/5' : 'border-transparent opacity-50 hover:opacity-100'}`}
    >
      <Icon size={18} />
      <span className="text-xs uppercase font-bold tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 border-r border-[var(--ink)]/10 flex flex-col pt-8
          bg-[var(--bg)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Close button — mobile only */}
        <button
          className="md:hidden absolute top-4 right-4 p-1 opacity-50 hover:opacity-100 transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <XIcon size={20} />
        </button>

        <div className="px-6 mb-12">
          <h2 className="text-xl font-bold font-mono tracking-tighter italic">SS logistic Solution</h2>
          <div className="flex items-center gap-2 mt-2 opacity-50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold">{user.role.replace('_', ' ')}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <SidebarItem id="dashboard" icon={BarChart3} label="Dashboard" />
          <SidebarItem id="consignments" icon={Truck} label="Consignments" />

          {(user.role === 'super_admin' || user.role === 'supervisor') && (
            <>
              <SidebarItem id="attendance" icon={History} label="Attendance" />
              <SidebarItem id="maintenance" icon={Package} label="Maintenance" />
              <SidebarItem id="payments" icon={CreditCard} label="Payments" />
            </>
          )}

          {user.role === 'driver' && (
            <SidebarItem id="fuel" icon={Fuel} label="Fuel Log" />
          )}

          {user.role === 'super_admin' && (
            <SidebarItem id="users" icon={Users} label="Users" />
          )}
        </nav>

        <div className="px-6 py-4 space-y-4 border-t border-[var(--ink)]/10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold opacity-40">Theme</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-sm transition-colors ${theme === 'light' ? 'bg-[var(--ink)] text-[var(--bg)]' : 'opacity-40 hover:opacity-100'}`}
                title="Light Mode"
              >
                <Sun size={14} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-sm transition-colors ${theme === 'dark' ? 'bg-[var(--ink)] text-[var(--bg)]' : 'opacity-40 hover:opacity-100'}`}
                title="Dark Mode"
              >
                <Moon size={14} />
              </button>
              <button
                onClick={() => setTheme('solarized')}
                className={`p-1.5 rounded-sm transition-colors ${theme === 'solarized' ? 'bg-[var(--ink)] text-[var(--bg)]' : 'opacity-40 hover:opacity-100'}`}
                title="Solarized Mode"
              >
                <Zap size={14} />
              </button>
            </div>
          </div>

          <button onClick={logout} className="w-full flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <LogOut size={18} />
            <span className="text-xs uppercase font-bold tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Hamburger toggle — always visible, toggles sidebar */}
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          className="fixed top-4 left-4 z-40 p-2 bg-[var(--bg)] border border-[var(--ink)]/20 shadow-md hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors md:top-4 md:left-4"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        {/* Spacer so content doesn't hide behind hamburger */}
        <div className="h-10 md:h-0" />
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="data-grid-header">
                <h1 className="text-4xl font-light italic font-serif">Dashboard</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Total Shipments" value={analytics?.totalConsignments || 0} icon={Truck} />
                <MetricCard label="Fuel Cost" value={`₹${analytics?.totalFuel.toFixed(2) || 0}`} icon={Fuel} />
                <MetricCard label="Maintenance Cost" value={`₹${analytics?.totalMaintenance.toFixed(2) || 0}`} icon={Package} />
                <MetricCard label="Total Payments" value={`₹${analytics?.totalPayments.toFixed(2) || 0}`} icon={CreditCard} />
              </div>

              {user.role === 'super_admin' && (
                <div className="card-architect">
                  <h3 className="col-header mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {consignments.slice(0, 5).map(c => (
                      <div key={c.id} className="flex items-center justify-between text-xs border-b border-[var(--ink)]/5 pb-2">
                        <div className="flex items-center gap-3">
                          <Package size={14} className="opacity-40" />
                          <span className="font-mono">#{c.id.toString().padStart(4, '0')}</span>
                          <span className="opacity-60 text-[10px] uppercase font-bold break-words max-w-[100px] leading-tight">{c.truck_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${c.status === 'delivered' ? 'text-green-600' : 'text-blue-600'} uppercase font-bold`}>{c.status}</span>
                          <ChevronRight size={12} className="opacity-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'consignments' && (
            <ConsignmentsView 
              user={user} 
              data={consignments} 
              onUpdate={() => fetchData()} 
              drivers={allUsers.filter(u => u.role === 'driver')}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView user={user} data={attendance} users={allUsers} onUpdate={() => fetchData()} />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView user={user} data={maintenance} onUpdate={() => fetchData()} />
          )}

          {activeTab === 'payments' && (
            <PaymentsView user={user} data={payments} consignments={consignments} onUpdate={() => fetchData()} />
          )}

          {activeTab === 'fuel' && (
            <FuelView user={user} data={fuel} onUpdate={() => fetchData()} />
          )}

          {activeTab === 'users' && (
            <UsersView data={allUsers} onUpdate={() => fetchData()} currentUser={user} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const MetricCard = ({ label, value, icon: Icon }: { label: string, value: any, icon: any }) => (
  <div className="card-architect group hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors">
    <div className="flex justify-between items-start mb-4">
      <label className="col-header group-hover:text-white/50">{label}</label>
      <Icon size={16} className="opacity-20 group-hover:opacity-60" />
    </div>
    <div className="data-value text-2xl font-bold">{value}</div>
  </div>
);

// --- Sub-Views ---

const ConsignmentsView = ({ user, data, onUpdate, drivers }: { user: User, data: Consignment[], onUpdate: () => void, drivers: User[] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [previewData, setPreviewData] = useState<Consignment | null>(null);
  const initialFormData = {
    truck_number: '', lr_no: '', invoice_number: '', invoice_date: '',
    issuing_office_address: '',
    gst_payable_by: '',
    consigner_name: '', consigner_address: '', consignor_gst: '',
    consignee_name: '', consignee_address: '', consignee_gst: '',
    from_location: '', to_location: '',
    payment_type: 'To Pay' as 'To Pay' | 'Paid', billed_at: '',
    package_qty: 0, description: '', delivery_address: '',
    weight_a: '', weight_c: '', dec_value: '', e_way_bill: '', rate: '',
    hamali: '', rc: '', sc: '', st: '', cpc: '', fov: '', dc_dd: '', mis_ch: '', gst_edu: '',
    remark: '', value_rs: '',
    initial_slip_url: '', driver_id: '',
  } as any;

  const [formData, setFormData] = useState(initialFormData);

  // Draft Persistence: Load from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('consignment-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && !formData.id) { // Only restore if not currently editing an existing record
          setFormData(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Draft Persistence: Save to localStorage on change
  useEffect(() => {
    if (!formData.id && isAdding) { // Only save draft for new consignments
      localStorage.setItem('consignment-draft', JSON.stringify(formData));
    }
  }, [formData, isAdding]);

  const fd = formData;
  const freightKeys = ['hamali','rc','sc','st','cpc','fov','dc_dd','mis_ch','gst_edu'] as const;
  const netTotal = freightKeys.reduce((s, k) => s + (parseFloat(fd[k] || '0') || 0), 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const processedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.trim() === '') {
        const skipKeys = ['driver_id', 'payment_type', 'invoice_date', 'id']; 
        if (!skipKeys.includes(key)) acc[key] = 'NA';
        else acc[key] = value;
      } else acc[key] = value;
      return acc;
    }, {} as any);

    const payload = {
      ...processedFormData,
      supervisor_id: user.id,
      package_qty: parseInt(formData.package_qty.toString()) || 0,
      driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
      weight_a:  parseFloat(formData.weight_a)  || 0,
      weight_c:  parseFloat(formData.weight_c)  || 0,
      dec_value: parseFloat(formData.dec_value) || 0,
      rate:      parseFloat(formData.rate)      || 0,
      hamali:    parseFloat(formData.hamali)    || 0,
      rc:        parseFloat(formData.rc)        || 0,
      sc:        parseFloat(formData.sc)        || 0,
      st:        parseFloat(formData.st)        || 0,
      cpc:       parseFloat(formData.cpc)       || 0,
      fov:       parseFloat(formData.fov)       || 0,
      dc_dd:     parseFloat(formData.dc_dd)     || 0,
      mis_ch:    parseFloat(formData.mis_ch)    || 0,
      gst_edu:   parseFloat(formData.gst_edu)    || 0,
      value_rs:  parseFloat(formData.value_rs)  || 0,
    };
    const res = await fetch(formData.id ? `/api/consignments/${formData.id}` : '/api/consignments', {
      method: formData.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { 
      setIsAdding(false); 
      setFormData(initialFormData); 
      localStorage.removeItem('consignment-draft');
      onUpdate(); 
    }
    else { const err = await res.json(); alert(`Error: ${err.error}`); }
  };


  const markDelivered = async (id: number, url: string) => {
    await fetch(`/api/consignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered', delivered_slip_url: url, driver_id: user.id }),
    });
    onUpdate();
  };

  const F = (key: keyof typeof formData, type: 'text'|'number'|'date' = 'text', placeholder = '') => {
    if (key === 'truck_number') {
      return (
        <VehicleNumberInput value={(formData[key] as string) ?? ''} 
          onChange={v => setFormData(p => ({...p, [key]: v}))} 
          placeholder={placeholder} required />
      );
    }
    return (
      <input type={type} step={type==='number'?'any':undefined} placeholder={placeholder}
        className="w-full input-architect" value={(formData[key] as string) ?? ''}
        onChange={e => setFormData(p => ({...p, [key]: e.target.value}))} />
    );
  };

  const numRight = (key: keyof typeof formData, placeholder='0.00') => (
    <input type="number" step="any" placeholder={placeholder}
      className="input-architect text-right w-full font-mono"
      value={(formData[key] as string) ?? ''}
      onChange={e => setFormData(p => ({...p, [key]: e.target.value}))} />
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="data-grid-header flex justify-between items-center">
        <h1 className="text-4xl font-light italic font-serif">Consignments</h1>
        {(user.role === 'supervisor' || user.role === 'super_admin') && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Consignment
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="card-architect space-y-8 max-w-5xl shadow-xl pb-12">
          {/* ── HEADER ── */}
          <div className="flex justify-between items-center border-b border-[var(--ink)]/10 pb-4">
            <h2 className="text-xl font-bold font-mono italic">{formData.id ? 'EDIT CONSIGNMENT' : 'CONSIGNMENT MANIFEST'}</h2>
            <button type="button" onClick={() => { setIsAdding(false); setFormData(initialFormData); }} className="text-xs uppercase font-bold opacity-50 hover:opacity-100">Cancel</button>
          </div>

          {/* ── ROW 1: LR No / Date / Vehicle / Issuing Office ── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="col-header">LR No.</label>
              {F('lr_no','text','e.g. 6294')}
            </div>
            <div className="space-y-1">
              <label className="col-header">Invoice No.</label>
              {F('invoice_number')}
            </div>
            <div className="space-y-1">
              <label className="col-header">Date</label>
              {F('invoice_date','date')}
            </div>
            <div className="space-y-1">
              <label className="col-header">Vehicle No.</label>
              {F('truck_number','text','e.g. MH12AB8530')}
            </div>
          </div>

          {/* ── Address of Issuing Office ── */}
          <div className="space-y-1">
            <label className="col-header">Address of Issuing Office / Agent</label>
            {F('issuing_office_address','text','Office address')}
          </div>

          {/* ── GST Payable By + Route ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="col-header">GST Payable By</label>
              <div className="flex flex-col gap-2 pt-1">
                {(['consigner', 'consignee', 'transport'] as const).map(v => {
                  const label = v === 'consigner' ? 'Consignor' : v === 'consignee' ? 'Consignee' : 'Transport';
                  const isChecked = formData.gst_payable_by.split(', ').includes(label);
                  return (
                    <label key={v} className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                      <input type="checkbox" name="gst_payable_by" value={v}
                        checked={isChecked}
                        onChange={() => {
                          const current = formData.gst_payable_by ? formData.gst_payable_by.split(', ').filter(x => x) : [];
                          const next = isChecked ? current.filter(x => x !== label) : [...current, label];
                          setFormData(p => ({ ...p, gst_payable_by: next.join(', ') }));
                        }}
                        className="accent-[var(--ink)]" />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1">
              <label className="col-header">From</label>
              {F('from_location','text','City / Location')}
            </div>
            <div className="space-y-1">
              <label className="col-header">To</label>
              {F('to_location','text','City / Location')}
            </div>
          </div>

          {/* ── Consignor & Consignee ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="col-header border-b border-[var(--ink)]/5 pb-1">CONSIGNOR'S NAME & ADDRESS</h3>
              {F('consigner_name','text','Name')}
              <textarea placeholder="Address" className="w-full input-architect h-16 resize-none"
                onChange={e => setFormData(p => ({...p, consigner_address: e.target.value}))} />
              <div className="space-y-1">
                <label className="col-header">Consignor's GST No.</label>
                {F('consignor_gst','text','e.g. 27BFEPM2500R1Z8')}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="col-header border-b border-[var(--ink)]/5 pb-1">CONSIGNEE'S NAME & ADDRESS</h3>
              {F('consignee_name','text','Name')}
              <textarea placeholder="Address" className="w-full input-architect h-16 resize-none"
                onChange={e => setFormData(p => ({...p, consignee_address: e.target.value}))} />
              <div className="space-y-1">
                <label className="col-header">Consignee's GST No.</label>
                {F('consignee_gst','text','e.g. AAC CV3567…')}
              </div>
            </div>
          </div>

          {/* ── Package / Description / Delivery Address (bill's main table row) ── */}
          <div className="space-y-2">
            <h3 className="col-header border-b border-[var(--ink)]/5 pb-1">PACKAGE DETAILS</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="col-header">Package (Qty)</label>
                <input type="number" placeholder="e.g. 2" className="w-full input-architect" required
                  onChange={e => setFormData(p => ({...p, package_qty: parseInt(e.target.value)}))} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="col-header">Description (Said To Contain)</label>
                {F('description','text','e.g. Steel Structure Monopole')}
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="col-header">Delivery Address</label>
                {F('delivery_address','text','Final delivery address')}
              </div>
            </div>
          </div>

          {/* ── Weight/Valuation  +  Freight/Amount  (side by side, mirrors bill) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left: Weight & Valuation */}
            <div className="space-y-2">
              <h3 className="col-header border-b border-[var(--ink)]/5 pb-1">WEIGHT & VALUATION</h3>
              <div className="border border-[var(--ink)]/10 overflow-hidden">
                <div className="grid grid-cols-2 bg-[var(--ink)]/5 px-4 py-2 text-[10px] uppercase font-bold opacity-60">
                  <span>Field</span><span className="text-right">Value</span>
                </div>
                {([
                  { label: 'A. Weight', key: 'weight_a', type: 'number', ph: 'kg' },
                  { label: 'C. Weight', key: 'weight_c', type: 'number', ph: 'kg' },
                  { label: 'Dec / Value', key: 'dec_value', type: 'number', ph: '₹' },
                  { label: 'E-Way Bill No.', key: 'e_way_bill', type: 'text', ph: '' },
                  { label: 'Rate', key: 'rate', type: 'number', ph: '' },
                  { label: 'Consignor\'s GST No.', key: 'consignor_gst', type: 'text', ph: '' },
                  { label: 'Consignee\'s GST No.', key: 'consignee_gst', type: 'text', ph: '' },
                ] as { label: string; key: keyof typeof formData; type: string; ph: string }[]).map(({ label, key, type, ph }, i) => (
                  <div key={key} className={`grid grid-cols-2 items-center px-4 py-2 border-t border-[var(--ink)]/5 ${i%2===0?'':'bg-[var(--ink)]/[0.03]'}`}>
                    <span className="text-xs font-bold opacity-70">{label}</span>
                    <input type={type} step={type==='number'?'any':undefined} placeholder={ph}
                      className="input-architect text-right w-full font-mono text-sm"
                      onChange={e => setFormData(p => ({...p, [key]: e.target.value}))} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Freight & Amount */}
            <div className="space-y-2">
              <h3 className="col-header border-b border-[var(--ink)]/5 pb-1">FREIGHT & AMOUNT</h3>
              <div className="border border-[var(--ink)]/10 overflow-hidden">
                <div className="grid grid-cols-2 bg-[var(--ink)]/5 px-4 py-2 text-[10px] uppercase font-bold opacity-60">
                  <span>Charge</span><span className="text-right">Amount (₹)</span>
                </div>
                {([
                  { label: 'Hamali',    key: 'hamali'  },
                  { label: 'R.C.',     key: 'rc'      },
                  { label: 'S.C.',     key: 'sc'      },
                  { label: 'S.T.',     key: 'st'      },
                  { label: 'C.P.C.',   key: 'cpc'     },
                  { label: 'F.O.V.',   key: 'fov'     },
                  { label: 'DC / DD',  key: 'dc_dd'   },
                  { label: 'Mis CH.',  key: 'mis_ch'  },
                  { label: 'GST. Edu.', key: 'gst_edu' },
                ] as { label: string; key: keyof typeof formData }[]).map(({ label, key }, i) => (
                  <div key={key} className={`grid grid-cols-2 items-center px-4 py-2 border-t border-[var(--ink)]/5 ${i%2===0?'':'bg-[var(--ink)]/[0.03]'}`}>
                    <span className="text-xs font-bold opacity-70">{label}</span>
                    {numRight(key)}
                  </div>
                ))}
                {/* Net Total row */}
                <div className="grid grid-cols-2 items-center px-4 py-3 border-t-2 border-[var(--ink)]/20 bg-[var(--ink)]/5">
                  <span className="text-xs font-bold uppercase tracking-wider">Net Total</span>
                  <span className="text-right font-mono font-bold">₹{netTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── TO PAY / TO BE BILLED ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="col-header">Payment Mode</label>
              <select className="w-full input-architect"
                onChange={e => setFormData(p => ({...p, payment_type: e.target.value as any}))}>
                <option value="To Pay">To Pay / Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="col-header">To Be Billed At</label>
              {F('billed_at','text','Billing location')}
            </div>
          </div>

          {/* ── Remark + Value Rs. (right panel of bill) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="col-header">Remark</label>
              <textarea placeholder="Any remarks…" className="w-full input-architect h-16 resize-none"
                onChange={e => setFormData(p => ({...p, remark: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="col-header">Value Rs. (Declared)</label>
              {F('value_rs','number','0.00')}
            </div>
          </div>

          {/* ── Assign Driver ── */}
          <div className="space-y-1">
            <label className="col-header">Assign Driver</label>
            <select className="w-full input-architect" required
              onChange={e => setFormData(p => ({...p, driver_id: e.target.value}))}>
              <option value="">Choose Driver…</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.username} (UID: {d.id})</option>)}
            </select>
          </div>

          {/* ── Camera ── */}
          <CameraCapture label="Capture Original Consignment Receipt"
            onCapture={url => setFormData(p => ({...p, initial_slip_url: url}))} />

          <button type="submit" className="w-full btn-primary py-6 text-lg tracking-[0.2em]">
            {formData.id ? 'UPDATE CONSIGNMENT' : 'INITIALIZE CONSIGNMENT & ASSIGN DRIVER'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        <div className="hidden md:grid grid-cols-7 px-4 py-2 opacity-50 border-b border-[var(--ink)]/10 text-[10px] uppercase font-bold tracking-widest gap-4">
          <span>Status</span>
          <span>LR NO / Truck</span>
          <span>Route</span>
          <span>Consigner/Consignee</span>
          <span>Details</span>
          <span>Load Slip</span>
          <span className="text-right">Action</span>
        </div>
        {data.map(c => {
          const isAssignedToUser = user.role === 'driver' && c.driver_id === user.id;
          const showRow = user.role !== 'driver' || isAssignedToUser;

          if (!showRow) return null;

          return (
            <div key={c.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-4 px-4 py-6 data-row items-center border-b border-[var(--ink)]/5 group">
              <div className="flex items-center gap-2">
                {c.status === 'loaded' ? <Clock size={14} className="text-blue-600" /> : <CheckCircle2 size={14} className="text-green-600" />}
                <span className={`text-[10px] uppercase font-bold ${c.status === 'loaded' ? 'text-blue-600' : 'text-green-600'}`}>
                  {c.status}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="data-value font-bold text-sm tracking-tight">{c.lr_no}</span>
                <span className="text-[10px] opacity-40 uppercase font-bold break-words max-w-[85px] leading-tight">{formatVehicleDisplay(c.truck_number)}</span>
              </div>
              <div className="flex flex-col text-[11px]">
                <span className="font-bold">{c.from_location}</span>
                <ArrowRightLeft size={10} className="my-1 opacity-20 hidden md:block" />
                <span className="font-bold">{c.to_location}</span>
              </div>
              <div className="flex flex-col text-[10px] gap-1">
                <span className="opacity-60">FR: {c.consigner_name}</span>
                <span className="opacity-60">TO: {c.consignee_name}</span>
              </div>
              <div className="flex flex-col text-[10px]">
                <span className="font-bold">{c.package_qty} Units</span>
                <span className="opacity-60 truncate md:max-w-[120px]">{c.description}</span>
              </div>
              <div>
                {c.initial_slip_url ? (
                  <img src={c.initial_slip_url} className="w-16 h-10 object-cover border border-[var(--ink)]/10 grayscale hover:grayscale-0 transition-all cursor-zoom-in" referrerPolicy="no-referrer" />
                ) : <span className="text-[10px] opacity-30">N/A</span>}
              </div>
              <div className="md:text-right flex items-center justify-start md:justify-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-[var(--ink)]/5">
                <button onClick={() => setPreviewData(c)} className="p-2 text-blue-500 opacity-60 hover:opacity-100 hover:bg-blue-500/10 rounded-full transition-all" title="View Lorry Receipt">
                  <Eye size={16} />
                </button>
                {(user.role === 'super_admin' || user.role === 'supervisor') && (
                  <button onClick={() => { 
                    const cleanC = Object.fromEntries(
                      Object.entries(c).map(([k, v]) => [k, v === 'NA' ? '' : v])
                    ) as Consignment;
                    setFormData({
                      ...cleanC,
                      weight_a: cleanC.weight_a?.toString(),
                      weight_c: cleanC.weight_c?.toString(),
                      dec_value: cleanC.dec_value?.toString(),
                      rate: cleanC.rate?.toString(),
                      hamali: cleanC.hamali?.toString(),
                      rc: cleanC.rc?.toString(),
                      sc: cleanC.sc?.toString(),
                      st: cleanC.st?.toString(),
                      cpc: cleanC.cpc?.toString(),
                      fov: (cleanC as any).fov?.toString(),
                      dc_dd: cleanC.dc_dd?.toString(),
                      mis_ch: cleanC.mis_ch?.toString(),
                      gst_edu: cleanC.gst_edu?.toString(),
                      value_rs: cleanC.value_rs?.toString(),
                      driver_id: cleanC.driver_id?.toString() || ''
                    }); 
                    setIsAdding(true); 
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} className="p-2 opacity-30 hover:opacity-100 transition-opacity" title="Edit Entry">
                    <Pencil size={14} />
                  </button>
                )}
                {user.role === 'driver' && c.status === 'loaded' && (
                  <DeliveryAction onComplete={(url) => markDelivered(c.id, url)} />
                )}
                {c.status === 'delivered' && c.delivered_slip_url && (
                  <div className="flex flex-col md:items-end gap-1 ml-auto md:ml-0">
                    <img src={c.delivered_slip_url} className="w-16 h-10 object-cover border border-green-600/30 md:ml-auto" referrerPolicy="no-referrer" />
                    <span className="text-[9px] uppercase font-bold text-green-600">STAMPED RECEIPT</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {previewData && <ConsignmentPreviewModal data={previewData} onClose={() => setPreviewData(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

const DeliveryAction = ({ onComplete }: { onComplete: (url: string) => void }) => {
  const [showCamera, setShowCamera] = useState(false);
  
  if (showCamera) return (
    <div className="fixed inset-0 bg-[var(--bg)]/95 flex items-center justify-center p-6 z-50">
      <div className="max-w-xl w-full card-architect space-y-4">
        <h2 className="col-header">Confirm Delivery Proof (Stamped Bill)</h2>
        <CameraCapture label="Capture Delivery Slip" onCapture={onComplete} />
        <button onClick={() => setShowCamera(false)} className="w-full btn-outline">Discard</button>
      </div>
    </div>
  );

  return (
    <button onClick={() => setShowCamera(true)} className="btn-primary text-[10px] py-1 px-2 whitespace-nowrap">
      Mark Delivered
    </button>
  );
};

const AttendanceView = ({ user, data, users, onUpdate }: { user: User, data: Attendance[], users: User[], onUpdate: () => void }) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  const drivers = users.filter(u => u.role === 'driver');

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) return alert('Select at least one driver');
    
    // Prepare records: checked = present, unchecked = absent
    const records = drivers.map(d => ({
      user_id: d.id,
      status: selectedUsers.includes(d.id) ? 'present' : 'absent'
    }));

    await fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, records, marked_by_id: user.id }),
    });
    onUpdate();
    alert('Attendance submitted successfully');
  };

  const toggleUser = (id: number) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8">
      <div className="data-grid-header flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-light italic font-serif">Attendance</h1>
          <p className="col-header mt-2 opacity-50">Mark daily presence for all drivers</p>
        </div>
        {(user.role === 'supervisor' || user.role === 'super_admin') && (
          <div className="flex gap-4 items-end">
            <div className="space-y-1">
              <label className="col-header uppercase text-[10px]">Select Date</label>
              <input type="date" className="input-architect block" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <button onClick={handleSubmit} className="btn-primary h-10 px-6">
              Submit Daily Attendance
            </button>
          </div>
        )}
      </div>

      {(user.role === 'supervisor' || user.role === 'super_admin') && (
        <div className="card-architect">
          <div className="flex justify-between items-center mb-6 border-b border-[var(--ink)]/10 pb-4">
            <h3 className="col-header">Driver Presence Checklist</h3>
            <div className="flex gap-4">
               <button onClick={() => setSelectedUsers(drivers.map(d => d.id))} className="text-[10px] uppercase font-bold opacity-40 hover:opacity-100 transition-opacity">Select All</button>
               <button onClick={() => setSelectedUsers([])} className="text-[10px] uppercase font-bold opacity-40 hover:opacity-100 transition-opacity">Clear All</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(d => (
              <label key={d.id} className={`flex items-center gap-4 p-4 border transition-all cursor-pointer ${selectedUsers.includes(d.id) ? 'border-[var(--ink)] bg-[var(--ink)]/5' : 'border-[var(--ink)]/10 opacity-60'}`}>
                <input type="checkbox" className="accent-[var(--ink)] w-4 h-4" 
                  checked={selectedUsers.includes(d.id)} 
                  onChange={() => toggleUser(d.id)} />
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-tight">{d.username}</span>
                  <span className="text-[10px] opacity-50">UID: {d.id}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="col-header opacity-50 px-4">Historical Logs</h3>
        <div className="grid grid-cols-4 col-header opacity-50 px-4 py-2 border-b border-[var(--ink)]/10">
          <span>User</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Marked By</span>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {data.map(a => (
            <div key={a.id} className="grid grid-cols-4 px-4 py-4 data-row border-b border-[var(--ink)]/5">
              <span className="font-bold uppercase">{a.username}</span>
              <span className="data-value opacity-60 font-mono tracking-tighter">{a.date}</span>
              <span className={`uppercase font-bold text-[10px] ${a.status === 'present' ? 'text-green-600' : 'text-red-500'}`}>{a.status}</span>
              <span className="text-right opacity-30 text-[10px] uppercase font-bold tracking-widest">UID-{a.marked_by_id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MaintenanceView = ({ user, data, onUpdate }: { user: User, data: Maintenance[], onUpdate: () => void }) => {
  const initialFormData = { id: undefined, truck_number: '', details: '', cost: '', proof_url: '' };
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(formData.id ? `/api/maintenance/${formData.id}` : '/api/maintenance', {
      method: formData.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        cost: parseFloat(formData.cost.toString()),
        date: new Date().toISOString().split('T')[0]
      }),
    });
    if (res.ok) {
      setFormData(initialFormData);
      onUpdate();
    }
  };

  return (
    <div className="space-y-8">
      <div className="data-grid-header">
        <h1 className="text-4xl font-light italic font-serif">Maintenance</h1>
      </div>

      {(user.role === 'supervisor' || user.role === 'super_admin') && (
        <form onSubmit={handleSubmit} className="card-architect space-y-6 max-w-2xl">
          <h2 className="col-header">{formData.id ? 'Update Maintenance' : 'Log Maintenance'}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="col-header">Truck No</label>
              <VehicleNumberInput 
                value={formData.truck_number}
                onChange={v => setFormData({...formData, truck_number: v})} required />
            </div>
            <div className="space-y-1">
              <label className="col-header">Details</label>
              <input type="text" className="w-full input-architect"
                value={formData.details}
                onChange={e => setFormData({...formData, details: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="col-header">Cost (₹)</label>
              <input type="number" className="w-full input-architect"
                value={formData.cost}
                onChange={e => setFormData({...formData, cost: e.target.value})} required />
            </div>
          </div>
          <CameraCapture label="Attach Proof (Bill / Photo)"
            onCapture={url => setFormData(p => ({...p, proof_url: url}))} />
          <button type="submit" className="w-full btn-primary">{formData.id ? 'Update' : 'Add'} Maintenance Record</button>
          {formData.id && <button type="button" onClick={() => setFormData(initialFormData)} className="w-full btn-outline mt-2">Cancel Edit</button>}
        </form>
      )}

      <div className="grid grid-cols-5 col-header opacity-50 px-4 py-2 border-b border-[var(--ink)]/10">
        <span>Truck No</span>
        <span>Details</span>
        <span>Date</span>
        <span className="text-right">Cost</span>
        <span className="text-right">Proof</span>
      </div>
      {data.map(m => (
        <div key={m.id} className="grid grid-cols-5 px-4 py-4 data-row border-b border-[var(--ink)]/5">
          <span className="font-bold break-words max-w-[100px] leading-tight">{formatVehicleDisplay(m.truck_number)}</span>
          <span className="text-xs">{m.details}</span>
          <span className="data-value opacity-60">{m.date}</span>
          <span className="text-right data-value font-bold">₹{m.cost.toFixed(2)}</span>
          <div className="flex justify-end items-center gap-4">
            {(user.role === 'super_admin' || user.role === 'supervisor') && (
              <button onClick={() => { 
                const cleanM = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v === 'NA' ? '' : v])) as any;
                setFormData(cleanM); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }} className="p-1.5 opacity-30 hover:opacity-100 transition-all" title="Edit Entry">
                <Pencil size={14} />
              </button>
            )}
            {m.proof_url
              ? <img src={m.proof_url} className="w-12 h-8 object-cover border border-[var(--ink)]/10 cursor-pointer"
                  onClick={() => window.open(m.proof_url, '_blank')} referrerPolicy="no-referrer" />
              : <span className="text-[10px] opacity-30 uppercase font-bold self-center">—</span>
            }
          </div>
        </div>
      ))}
    </div>
  );
};

const PaymentsView = ({ user, data, consignments, onUpdate }: { user: User, data: Payment[], consignments: Consignment[], onUpdate: () => void }) => {
  const initialFormData = { id: undefined, consignment_id: '', amount: '', status: 'pending' };
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(formData.id ? `/api/payments/${formData.id}` : '/api/payments', {
      method: formData.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount.toString()), date: new Date().toISOString().split('T')[0] }),
    });
    if (res.ok) {
      setFormData(initialFormData);
      onUpdate();
    }
  };

  return (
    <div className="space-y-8">
      <div className="data-grid-header">
        <h1 className="text-4xl font-light italic font-serif">Payments</h1>
      </div>

      {(user.role === 'supervisor' || user.role === 'super_admin') && (
        <form onSubmit={handleSubmit} className="card-architect space-y-4">
          <h2 className="col-header">{formData.id ? 'Update Payment' : 'New Payment Record'}</h2>
          <div className="grid grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="col-header">Consignment #</label>
            <select className="w-full input-architect" value={formData.consignment_id} onChange={e => setFormData({...formData, consignment_id: e.target.value})} required>
              <option value="">Choose...</option>
              {consignments.map(c => <option key={c.id} value={c.id}>#{c.id.toString().padStart(4, '0')} - {c.truck_number}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="col-header">Amount (₹)</label>
            <input type="number" className="w-full input-architect" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
          </div>
          <div className="space-y-1">
            <label className="col-header">Status</label>
            <select className="w-full input-architect" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
            <button type="submit" className="btn-primary">{formData.id ? 'Update' : 'Add'} Payment</button>
          </div>
          {formData.id && <button type="button" onClick={() => setFormData(initialFormData)} className="btn-outline w-full mt-2">Cancel Edit</button>}
        </form>
      )}

      <div className="grid grid-cols-4 col-header opacity-50 px-4 py-2 border-b border-[var(--ink)]/10">
        <span>Consignment #</span>
        <span>Truck</span>
        <span>Status</span>
        <span className="text-right">Amount</span>
      </div>
      {data.map(p => (
        <div key={p.id} className="grid grid-cols-4 px-4 py-4 data-row border-b border-[var(--ink)]/5">
          <span className="font-mono">#{p.consignment_id.toString().padStart(4, '0')}</span>
          <span className="text-xs uppercase font-bold break-words max-w-[100px] leading-tight">{formatVehicleDisplay(p.truck_number)}</span>
          <span className={`uppercase font-bold text-[10px] ${p.status === 'completed' ? 'text-green-600' : 'text-blue-500'}`}>{p.status}</span>
          <div className="text-right flex items-center justify-end gap-4">
            {(user.role === 'super_admin' || user.role === 'supervisor') && (
              <button onClick={() => { 
                const cleanP = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v === 'NA' ? '' : v])) as any;
                setFormData(cleanP); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }} className="p-1.5 opacity-30 hover:opacity-100 transition-all" title="Edit Entry">
                <Pencil size={14} />
              </button>
            )}
            <span className="data-value font-bold tracking-tight">₹{p.amount.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const FuelView = ({ user, data, onUpdate }: { user: User, data: FuelRefill[], onUpdate: () => void }) => {
  const initialFormData = { id: undefined, truck_number: '', amount: '', cost: '', receipt_url: '' };
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(formData.id ? `/api/fuel/${formData.id}` : '/api/fuel', {
      method: formData.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, driver_id: user.id, amount: parseFloat(formData.amount.toString()), cost: parseFloat(formData.cost.toString()), date: new Date().toISOString().split('T')[0] }),
    });
    if (res.ok) {
      setFormData(initialFormData);
      onUpdate();
    }
  };

  return (
    <div className="space-y-8">
      <div className="data-grid-header">
        <h1 className="text-4xl font-light italic font-serif">Fuel Logs</h1>
      </div>

      <form onSubmit={handleSubmit} className="card-architect space-y-6 max-w-2xl">
        <h2 className="col-header">{formData.id ? 'Edit Fuel Record' : 'Record Refuel'}</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="col-header">Truck No</label>
            <VehicleNumberInput 
              value={formData.truck_number} 
              onChange={v => setFormData({...formData, truck_number: v})} required />
          </div>
          <div className="space-y-1">
            <label className="col-header">Amount (Liters)</label>
            <input type="number" className="w-full input-architect" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
          </div>
          <div className="space-y-1">
            <label className="col-header">Cost (₹)</label>
            <input type="number" className="w-full input-architect" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          </div>
        </div>
        <CameraCapture label="Receipt Photo" onCapture={url => setFormData({...formData, receipt_url: url})} />
        <button type="submit" className="w-full btn-primary">{formData.id ? 'Update Record' : 'Save Record'}</button>
        {formData.id && <button type="button" onClick={() => setFormData(initialFormData)} className="btn-outline w-full mt-2">Cancel Edit</button>}
      </form>

      <div className="grid grid-cols-5 col-header opacity-50 px-4 py-2 border-b border-[var(--ink)]/10">
        <span>Date</span>
        <span>Truck</span>
        <span>Liters</span>
        <span>Cost</span>
        <span className="text-right">Receipt</span>
      </div>
      {data.filter(f => user.role === 'driver' ? f.driver_id === user.id : true).map(f => (
        <div key={f.id} className="grid grid-cols-5 px-4 py-4 data-row border-b border-[var(--ink)]/5">
          <span className="data-value text-[11px] opacity-60">{f.date}</span>
          <span className="font-bold break-words max-w-[100px] leading-tight">{formatVehicleDisplay(f.truck_number)}</span>
          <span className="data-value">{f.amount} L</span>
          <span className="data-value font-bold">₹{f.cost.toFixed(2)}</span>
          <div className="text-right flex items-center justify-end gap-4">
            {(user.role === 'super_admin' || user.role === 'supervisor') && (
              <button onClick={() => { 
                const cleanF = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === 'NA' ? '' : v])) as any;
                setFormData(cleanF); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }} className="p-1.5 opacity-30 hover:opacity-100 transition-all" title="Edit Entry">
                <Pencil size={14} />
              </button>
            )}
            {f.receipt_url && <img src={f.receipt_url} className="w-12 h-8 object-cover border border-[var(--ink)]/10 ml-auto" referrerPolicy="no-referrer" />}
          </div>
        </div>
      ))}
    </div>
  );
};

const UsersView = ({ data, onUpdate, currentUser }: { data: User[], onUpdate: () => void, currentUser: User }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'driver' as UserRole });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setIsAdding(false);
    onUpdate();
  };

  const handleDelete = async (u: User) => {
    if (!window.confirm(`Remove user "${u.username}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    } else {
      onUpdate();
    }
  };

  return (
    <div className="space-y-8">
      <div className="data-grid-header flex justify-between items-center">
        <h1 className="text-4xl font-light italic font-serif">Users</h1>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add User
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="card-architect flex gap-4 items-end">
          <div className="space-y-1">
            <label className="col-header">Username</label>
            <input type="text" className="input-architect w-full" onChange={e => setFormData({...formData, username: e.target.value})} required />
          </div>
          <div className="space-y-1">
            <label className="col-header">Password</label>
            <input type="password" className="input-architect w-full" onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div className="space-y-1">
            <label className="col-header">Role</label>
            <select className="input-architect w-full" onChange={e => setFormData({...formData, role: e.target.value as any})}>
              <option value="driver">Driver</option>
              <option value="supervisor">Supervisor</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Add</button>
            <button type="button" onClick={() => setIsAdding(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-4 col-header opacity-50 px-4 py-2 border-b border-[var(--ink)]/10">
        <span>Username</span>
        <span>Role</span>
        <span>ID</span>
        <span className="text-right">Action</span>
      </div>
      {data.map(u => (
        <div key={u.id} className="grid grid-cols-4 px-4 py-4 data-row border-b border-[var(--ink)]/5">
          <span className="font-bold flex items-center gap-2">
            <Users size={14} className="opacity-40" /> {u.username}
          </span>
          <span className="uppercase font-bold text-[10px] opacity-60">{u.role.replace('_',' ')}</span>
          <span className="data-value opacity-40">{u.id}</span>
          <div className="flex justify-end">
            {u.id !== currentUser.id && (
              <button
                onClick={() => handleDelete(u)}
                className="p-1.5 opacity-30 hover:opacity-100 hover:text-red-500 transition-all"
                title="Remove user"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
