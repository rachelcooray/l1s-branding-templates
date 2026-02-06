import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, CreditCard, Briefcase, ShieldCheck, Quote,
  Receipt as ReceiptIcon, UserCheck, ClipboardList,
  Download, Eye, Settings, Menu, X, Plus, ChevronRight
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
  const [isEditing, setIsEditing] = useState(true);

  const config = TEMPLATES_CONFIG[activeId];

  useEffect(() => {
    setData(TEMPLATES_CONFIG[activeId].initialData);
  }, [activeId]);

  const handleFieldChange = (path, value) => {
    const newData = _.cloneDeep(data);
    _.set(newData, path, value);
    setData(newData);
  };

  const renderedHtml = useMemo(() => {
    let html = config.html;

    // Inject CSS
    html = `<style>${config.css}</style>\n${html}`;

    // Replace Logo
    html = html.replace(/src="[^"]*l1s-logo\.png"/g, `src="${logo}"`);

    // Replace Placeholders
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

    // Clean up empty tags and comments
    html = html.replace(/{{[\s\S]*?}}/g, '');

    return html;
  }, [activeId, data]);

  const handlePrint = () => {
    const iframe = document.getElementById('preview-iframe');
    if (iframe) {
      iframe.contentWindow.print();
    }
  };

  return (
    <div className="studio-container">
      {/* Sidebar - Navigation */}
      <aside className={`glass transition-all duration-500 ${sidebarOpen ? 'w-80' : 'w-20'} h-full flex flex-col p-6 z-20 shrink-0`}>
        <div className="flex items-center gap-3 mb-10 overflow-hidden">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
            <span className="font-extrabold text-xl text-white">L1</span>
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-extrabold text-xl tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">layer1.studio</h1>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          {TEMPLATE_LIST.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setActiveId(tmpl.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group
                ${activeId === tmpl.id ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-white/5 text-slate-400'}
              `}
            >
              <tmpl.icon size={20} className={activeId === tmpl.id ? 'text-indigo-400' : 'group-hover:text-white transition-colors'} />
              {sidebarOpen && <span className="font-semibold text-sm">{tmpl.name}</span>}
              {sidebarOpen && activeId === tmpl.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mt-6 flex items-center justify-center w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </aside>

      {/* Editor Main Portal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 shrink-0 glass bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Branding Studio</span>
            <span className="text-slate-700">/</span>
            <span className="text-white font-bold">{config.name || activeId.charAt(0).toUpperCase() + activeId.slice(1)}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Visual Editor Form */}
          <div className="w-[400px] border-r border-white/5 flex flex-col glass bg-slate-900/30">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Content Editor</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scroll">
              {config.fields.map((field) => (
                <div key={field.id} className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={_.get(data, field.id) || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[120px] resize-none"
                    />
                  ) : field.type === 'list' ? (
                    <div className="space-y-4">
                      {_.get(data, field.id, []).map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative group">
                          {field.fields.map(subField => (
                            <div key={subField.id}>
                              <input
                                placeholder={subField.label}
                                value={item[subField.id] || ''}
                                onChange={(e) => {
                                  const newList = [...data[field.id]];
                                  newList[idx][subField.id] = e.target.value;
                                  handleFieldChange(field.id, newList);
                                }}
                                className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={_.get(data, field.id) || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* High-Fidelity Preview */}
          <div className="flex-1 bg-[#0f1115] relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="flex-1 w-full overflow-y-auto p-12 custom-scroll flex justify-center perspective-1000">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative group ink-print"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2px] blur opacity-10 group-hover:opacity-20 transition duration-1000 no-print"></div>
                <iframe
                  id="preview-iframe"
                  title="Live Preview"
                  className="relative bg-white shadow-2xl overflow-hidden print:shadow-none print:m-0"
                  style={{ width: '210mm', height: '297mm', border: 'none' }}
                  srcDoc={renderedHtml}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body {
            background: white !important;
          }
          .studio-container > aside, 
          .studio-container > main > header,
          .studio-container > main > .flex-1 > div:first-child,
          .no-print {
            display: none !important;
          }
          .studio-container > main > .flex-1 > .bg-[#0f1115] {
            background: white !important;
            padding: 0 !important;
            overflow: visible !important;
            position: static !important;
          }
          .studio-container > main > .flex-1 > .bg-[#0f1115] > div {
             position: static !important;
          }
          .ink-print {
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
            box-shadow: none !important;
          }
          .ink-print > div {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
