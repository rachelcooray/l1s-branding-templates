import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, CreditCard, Briefcase, ShieldCheck, Quote,
  Receipt as ReceiptIcon, UserCheck, ClipboardList,
  Download, Eye, Settings, Menu, X, Plus, ChevronRight,
  Trash2, Palette, Type, Globe, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEMPLATES_CONFIG } from './constants/templates';
import logo from './assets/logo.png';
import _ from 'lodash';

const TEMPLATE_LIST = [
  { id: 'invoice', name: 'Invoice', icon: CreditCard },
  { id: 'quote', name: 'Project Quote', icon: Quote },
  { id: 'letter', name: 'Letter', icon: FileText },
  { id: 'nda', name: 'NDA', icon: ShieldCheck },
  { id: 'receipt', name: 'Receipt', icon: ReceiptIcon },
  { id: 'service_letter', name: 'Service Letter', icon: UserCheck },
  { id: 'sow', name: 'Statement of Work', icon: ClipboardList },
  { id: 'appointment', name: 'Appointment', icon: Briefcase },
];

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#fb7185' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
];

function App() {
  const [activeId, setActiveId] = useState('invoice');
  const [data, setData] = useState(TEMPLATES_CONFIG.invoice.initialData);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'design'
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [fontFamily, setFontFamily] = useState('Outfit'); // 'Outfit' or 'Playfair Display'
  const [toast, setToast] = useState(null);

  const config = TEMPLATES_CONFIG[activeId];

  useEffect(() => {
    setData(TEMPLATES_CONFIG[activeId].initialData);
  }, [activeId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const calculateTotals = (currentData) => {
    if (!currentData.items || !Array.isArray(currentData.items)) return currentData;

    const subtotal = currentData.items.reduce((sum, item) => {
      const amount = parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0;
      return sum + amount;
    }, 0);

    const taxPercent = parseFloat(String(currentData.tax).replace(/[^0-9.]/g, '')) || 0;
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount;

    // Determine currency symbol (default to $)
    const firstAmount = currentData.items[0]?.amount || '$';
    const symbol = firstAmount.match(/[^0-9.]/)?.[0] || '$';

    const newData = _.cloneDeep(currentData);
    newData.subtotal = `${symbol}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    newData.total = `${symbol}${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    // If it's a quote, it might not have tax in the same way, but we'll adapt
    if (currentData.tax !== undefined) {
      newData.tax_amount = `${symbol}${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    return newData;
  };

  const handleFieldChange = (path, value) => {
    let newData = _.cloneDeep(data);
    _.set(newData, path, value);

    if (path.startsWith('items') || path === 'tax') {
      newData = calculateTotals(newData);
    }

    setData(newData);
  };

  const addListItem = (path, fieldConfig) => {
    let newData = _.cloneDeep(data);
    const list = _.get(newData, path, []);
    const newItem = {};
    fieldConfig.fields.forEach(f => newItem[f.id] = '');
    list.push(newItem);
    _.set(newData, path, list);

    newData = calculateTotals(newData);
    setData(newData);
    showToast(`Added new ${fieldConfig.label.slice(0, -1)}`);
  };

  const removeListItem = (path, index) => {
    let newData = _.cloneDeep(data);
    const list = _.get(newData, path, []);
    list.splice(index, 1);
    _.set(newData, path, list);

    newData = calculateTotals(newData);
    setData(newData);
    showToast("Item removed");
  };

  const renderedHtml = useMemo(() => {
    let html = config.html;
    // Inject dynamic branding CSS
    const brandingStyles = `
      :root {
        --primary: ${accentColor};
        --font-main: '${fontFamily}', sans-serif;
      }
      .page { font-family: var(--font-main); }
      .badge { background: var(--primary) !important; }
      .footer-accent { background: var(--primary) !important; }
    `;
    html = `<style>${config.css}\n${brandingStyles}</style>\n${html}`;
    html = html.replace(/src="[^"]*l1s-logo\.png"/g, `src="${logo}"`);

    const replaceStrings = (obj, prefix = '') => {
      for (const key in obj) {
        const value = obj[key];
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          replaceStrings(value, path);
        } else if (Array.isArray(value)) {
          const regex = new RegExp(`{{#each ${path}}}([\\s\\S]*?){{/each}}`, 'g');
          html = html.replace(regex, (_, inner) => {
            return value.map(item => {
              let itemHtml = inner;
              for (const itemKey in item) {
                itemHtml = itemHtml.replace(new RegExp(`{{${itemKey}}}`, 'g'), item[itemKey]);
              }
              return itemHtml;
            }).join('');
          });
        } else {
          html = html.replace(new RegExp(`{{${path}}}`, 'g'), value);
          html = html.replace(new RegExp(`{{{${path}}}}`, 'g'), value);
        }
      }
    };
    replaceStrings(data);
    html = html.replace(/{{[\s\S]*?}}/g, '');
    return html;
  }, [activeId, data, accentColor, fontFamily]);

  const handlePrint = () => {
    const iframe = document.getElementById('preview-iframe');
    if (iframe) {
      iframe.contentWindow.print();
      showToast("Preparing document for print...");
    }
  };

  return (
    <div className="studio-container selection:bg-indigo-500/30" style={{ '--accent-primary': accentColor }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl glass border border-white/10 shadow-2xl flex items-center gap-3"
          >
            <CheckCircle size={18} className="text-emerald-400" />
            <span className="text-sm font-bold text-white tracking-tight">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`glass transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${sidebarOpen ? 'w-80' : 'w-24'} h-full flex flex-col p-6 z-20 shrink-0 border-r border-white/5`}>
        <div className="flex items-center gap-4 mb-12 overflow-hidden px-2">
          <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl relative group overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}, #000)` }}>
            <span className="font-black text-2xl text-white tracking-tighter">L1</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="font-black text-2xl tracking-tighter text-white">layer1.studio</h1>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] leading-none mt-1" style={{ color: accentColor }}>Branding Studio</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 px-1 overflow-y-auto custom-scroll">
          {TEMPLATE_LIST.map((tmpl) => (
            <button key={tmpl.id} onClick={() => setActiveId(tmpl.id)} className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative ${activeId === tmpl.id ? 'text-white' : 'hover:bg-white/5 text-slate-400'}`}>
              {activeId === tmpl.id && <motion.div layoutId="active-bg" className="absolute inset-0 border rounded-2xl" style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30` }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              <tmpl.icon size={21} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${activeId === tmpl.id ? '' : 'group-hover:text-slate-200'}`} style={{ color: activeId === tmpl.id ? accentColor : undefined }} />
              {sidebarOpen && <span className="relative z-10 font-bold text-[13.5px] tracking-tight">{tmpl.name}</span>}
              {sidebarOpen && activeId === tmpl.id && <ChevronRight size={14} className="relative z-10 ml-auto opacity-40" />}
            </button>
          ))}
        </nav>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mt-6 flex items-center justify-center w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-all active:scale-95 border border-white/5">
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#020408]">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 shrink-0 glass bg-slate-900/40 relative z-10">
          <div className="flex items-center gap-5">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button onClick={() => setViewMode('editor')} className={`px-5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'editor' ? 'text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`} style={{ backgroundColor: viewMode === 'editor' ? accentColor : 'transparent' }}>
                <FileText size={14} /> Editor
              </button>
              <button onClick={() => setViewMode('design')} className={`px-5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'design' ? 'text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`} style={{ backgroundColor: viewMode === 'design' ? accentColor : 'transparent' }}>
                <Palette size={14} /> Design
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Status</span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                Ready
              </span>
            </div>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={handlePrint} className="flex items-center gap-3 px-8 py-3.5 rounded-2xl text-white text-[13px] font-black shadow-2xl transition-all" style={{ backgroundColor: accentColor, boxShadow: `0 10px 40px -10px ${accentColor}60` }}>
              <Download size={18} /> Export PDF
            </motion.button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor/Design Form */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-[480px] border-r border-white/5 flex flex-col glass bg-slate-900/20">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>{viewMode === 'editor' ? 'Content Configuration' : 'Global Design Settings'}</h2>
              <p className="text-slate-500 text-xs mt-1">{viewMode === 'editor' ? `Refine your ${activeId} details below.` : 'Customize your brand typography and theme.'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scroll pb-32">
              {viewMode === 'editor' ? (
                config.fields.map((field) => (
                  <div key={field.id} className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                      <span>{field.label}</span>
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea value={_.get(data, field.id) || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-[6px] transition-all min-h-[140px] resize-none" style={{ '--tw-ring-color': `${accentColor}15`, borderColor: _.get(data, field.id) ? `${accentColor}30` : undefined }} />
                    ) : field.type === 'list' ? (
                      <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                          {_.get(data, field.id, []).map((item, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 relative group hover:bg-white/[0.06] transition-all shadow-xl">
                              <button onClick={() => removeListItem(field.id, idx)} className="absolute top-3 right-3 p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-rose-500/10 rounded-lg">
                                <Trash2 size={15} />
                              </button>
                              {field.fields.map(subField => (
                                <div key={subField.id}>
                                  <input placeholder={subField.label} value={item[subField.id] || ''} onChange={(e) => {
                                    const newList = [...data[field.id]];
                                    newList[idx][subField.id] = e.target.value;
                                    handleFieldChange(field.id, newList);
                                  }} className="w-full bg-transparent border-b border-white/10 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-white/30 transition-colors placeholder:text-slate-700" />
                                </div>
                              ))}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <button onClick={() => addListItem(field.id, field)} className="w-full py-4 rounded-2xl border-2 border-dashed border-white/5 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/[0.02]" style={{ borderColor: `${accentColor}20` }}>
                          <Plus size={16} style={{ color: accentColor }} /> Add {field.label.slice(0, -1)}
                        </button>
                      </div>
                    ) : (
                      <input type="text" value={_.get(data, field.id) || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:outline-none focus:ring-[6px] transition-all font-medium" style={{ '--tw-ring-color': `${accentColor}15`, borderColor: _.get(data, field.id) ? `${accentColor}30` : undefined }} />
                    )}
                  </div>
                ))
              ) : (
                <div className="space-y-12">
                  {/* Accent Color */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Palette size={14} /> Brand Accent Color
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {ACCENT_COLORS.map(color => (
                        <button key={color.value} onClick={() => setAccentColor(color.value)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${accentColor === color.value ? 'bg-white/5' : 'bg-transparent border-transparent grayscale hover:grayscale-0'}`} style={{ borderColor: accentColor === color.value ? color.value : 'transparent' }}>
                          <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: color.value }}></div>
                          <span className="text-[10px] font-bold text-slate-400">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Type size={14} /> Typography System
                    </h3>
                    <div className="space-y-4">
                      <button onClick={() => setFontFamily('Outfit')} className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${fontFamily === 'Outfit' ? 'bg-white/5' : 'bg-transparent border-white/5 opacity-50'}`} style={{ borderColor: fontFamily === 'Outfit' ? accentColor : undefined }}>
                        <div className="text-left">
                          <p className="text-white font-black text-sm">Outfit (Modern)</p>
                          <p className="text-slate-500 text-xs mt-0.5">Geometric and clean sans-serif.</p>
                        </div>
                        {fontFamily === 'Outfit' && <CheckCircle size={18} style={{ color: accentColor }} />}
                      </button>
                      <button onClick={() => setFontFamily('Playfair Display')} className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${fontFamily === 'Playfair Display' ? 'bg-white/5' : 'bg-transparent border-white/5 opacity-50'}`} style={{ borderColor: fontFamily === 'Playfair Display' ? accentColor : undefined }}>
                        <div className="text-left">
                          <p className="text-white font-black text-sm">Playfair (Classic)</p>
                          <p className="text-slate-500 text-xs mt-0.5">Elegant italic serif for formal letters.</p>
                        </div>
                        {fontFamily === 'Playfair Display' && <CheckCircle size={18} style={{ color: accentColor }} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Preview Panel */}
          <div className="flex-1 bg-[#010204] relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="flex-1 w-full overflow-y-auto p-16 custom-scroll flex justify-center perspective-2500">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group ink-print">
                <div className="absolute -inset-[50px] opacity-10 blur-[120px] transition-colors duration-1000 no-print pointer-events-none" style={{ backgroundColor: accentColor }}></div>
                <div className="absolute -inset-[2px] bg-gradient-to-br from-white/10 to-transparent rounded-[4px] opacity-20 no-print"></div>

                <iframe id="preview-iframe" title="Live Preview" className="relative bg-white shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8)] overflow-hidden print:shadow-none print:m-0" style={{ width: '210mm', height: '297mm', border: 'none' }} srcDoc={renderedHtml} />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .perspective-2500 { perspective: 2500px; }
        
        @media print {
          body { background: white !important; }
          .studio-container > aside, .studio-container > main > header, .studio-container > main > .flex-1 > div:first-child, .no-print { display: none !important; }
          .studio-container > main > .flex-1 > div:last-child { background: white !important; padding: 0 !important; overflow: visible !important; position: static !important; }
          .ink-print { padding: 0 !important; margin: 0 !important; transform: none !important; box-shadow: none !important; }
          #preview-iframe { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
