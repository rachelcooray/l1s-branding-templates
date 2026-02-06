import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, CreditCard, Briefcase, ShieldCheck, Quote,
  Receipt as ReceiptIcon, UserCheck, ClipboardList,
  Download, Eye, Settings, Menu, X, Plus, ChevronRight, Trash2
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

function App() {
  const [activeId, setActiveId] = useState('invoice');
  const [data, setData] = useState(TEMPLATES_CONFIG.invoice.initialData);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'settings'

  const config = TEMPLATES_CONFIG[activeId];

  useEffect(() => {
    setData(TEMPLATES_CONFIG[activeId].initialData);
  }, [activeId]);

  const handleFieldChange = (path, value) => {
    const newData = _.cloneDeep(data);
    _.set(newData, path, value);
    setData(newData);
  };

  const addListItem = (path, fieldConfig) => {
    const newData = _.cloneDeep(data);
    const list = _.get(newData, path, []);
    const newItem = {};
    fieldConfig.fields.forEach(f => newItem[f.id] = '');
    list.push(newItem);
    _.set(newData, path, list);
    setData(newData);
  };

  const removeListItem = (path, index) => {
    const newData = _.cloneDeep(data);
    const list = _.get(newData, path, []);
    list.splice(index, 1);
    _.set(newData, path, list);
    setData(newData);
  };

  const renderedHtml = useMemo(() => {
    let html = config.html;
    html = `<style>${config.css}</style>\n${html}`;
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
  }, [activeId, data]);

  const handlePrint = () => {
    const iframe = document.getElementById('preview-iframe');
    if (iframe) iframe.contentWindow.print();
  };

  return (
    <div className="studio-container selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className={`glass transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${sidebarOpen ? 'w-80' : 'w-24'} h-full flex flex-col p-6 z-20 shrink-0 border-r border-white/5`}>
        <div className="flex items-center gap-4 mb-12 overflow-hidden px-2">
          <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-500/40 relative group">
            <span className="font-black text-2xl text-white tracking-tighter">L1</span>
          </motion.div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="font-black text-2xl tracking-tighter text-white">layer1.studio</h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] leading-none mt-1">Branding Studio</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 px-1 overflow-y-auto custom-scroll">
          {TEMPLATE_LIST.map((tmpl) => (
            <button key={tmpl.id} onClick={() => setActiveId(tmpl.id)} className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative ${activeId === tmpl.id ? 'bg-indigo-600/15 text-white' : 'hover:bg-white/5 text-slate-400'}`}>
              {activeId === tmpl.id && <motion.div layoutId="active-bg" className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              <tmpl.icon size={22} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${activeId === tmpl.id ? 'text-indigo-400' : 'group-hover:text-slate-200'}`} />
              {sidebarOpen && <span className="relative z-10 font-bold text-[13px] tracking-tight">{tmpl.name}</span>}
              {sidebarOpen && activeId === tmpl.id && <ChevronRight size={14} className="relative z-10 ml-auto opacity-40" />}
            </button>
          ))}
        </nav>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mt-6 flex items-center justify-center w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-all active:scale-95 border border-white/5">
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 shrink-0 glass bg-slate-900/40 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full animate-pulse bg-indigo-500"></div>
              <span className="text-white font-black text-lg tracking-tight">{config.name || activeId.charAt(0).toUpperCase() + activeId.slice(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={handlePrint} className="flex items-center gap-3 px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-black shadow-[0_10px_30px_-10px_rgba(99,102,241,0.5)] transition-all">
              <Download size={18} />
              Export PDF
            </motion.button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor Form */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-[450px] border-r border-white/5 flex flex-col glass bg-slate-900/20">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">Content Configuration</h2>
              <p className="text-slate-500 text-xs mt-1">Refine your document details below.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scroll pb-24">
              {config.fields.map((field) => (
                <motion.div key={field.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span>{field.label}</span>
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea value={_.get(data, field.id) || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className="w-full bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/40 focus:ring-[6px] focus:ring-indigo-500/5 transition-all min-h-[140px] resize-none placeholder:text-slate-700" />
                  ) : field.type === 'list' ? (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {_.get(data, field.id, []).map((item, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 relative group hover:bg-white/[0.05] transition-colors overflow-hidden">
                            <button onClick={() => removeListItem(field.id, idx)} className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all z-20">
                              <Trash2 size={14} />
                            </button>
                            {field.fields.map(subField => (
                              <div key={subField.id}>
                                <input placeholder={subField.label} value={item[subField.id] || ''} onChange={(e) => {
                                  const newList = [...data[field.id]];
                                  newList[idx][subField.id] = e.target.value;
                                  handleFieldChange(field.id, newList);
                                }} className="w-full bg-transparent border-b border-white/5 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-700" />
                              </div>
                            ))}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <button onClick={() => addListItem(field.id, field)} className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Plus size={16} />
                        Add {field.label.slice(0, -1)}
                      </button>
                    </div>
                  ) : (
                    <input type="text" value={_.get(data, field.id) || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/40 focus:ring-[6px] focus:ring-indigo-500/5 transition-all font-medium" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Preview */}
          <div className="flex-1 bg-[#010204] relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="flex-1 w-full overflow-y-auto p-16 custom-scroll flex justify-center perspective-2000">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group ink-print">
                <div className="absolute -inset-10 bg-indigo-500 opacity-5 blur-[100px] transition duration-1000 no-print pointer-events-none"></div>
                <iframe id="preview-iframe" title="Live Preview" className="relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden print:shadow-none print:m-0" style={{ width: '210mm', height: '297mm', border: 'none' }} srcDoc={renderedHtml} />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .perspective-2000 { perspective: 2000px; }
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
