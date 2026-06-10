import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, ShieldAlert, Database, Server } from 'lucide-react';

const AdminPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between border-b border-red-500/50 pb-4">
        <h1 className="text-3xl flex items-center gap-3 text-red-500">
          <Terminal size={32} />
          SYSTEM_OVERRIDE
        </h1>
        <div className="animate-pulse flex items-center gap-2 text-red-500 font-rajdhani border border-red-500 px-3 py-1 rounded bg-red-500/10">
          <ShieldAlert size={16} />
          UNAUTHORIZED ACCESS DETECTED
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <button className="w-full text-left px-4 py-3 bg-red-900/20 border border-red-500/50 text-red-500 font-rajdhani hover:bg-red-900/40 transition-colors flex items-center gap-3">
             <Database size={18} /> ENTITY DATABASE
          </button>
          <button className="w-full text-left px-4 py-3 bg-dark-800 border border-white/10 text-gray-400 font-rajdhani hover:bg-white/5 transition-colors flex items-center gap-3">
             <Server size={18} /> NETWORK TOPOLOGY
          </button>
          <button className="w-full text-left px-4 py-3 bg-dark-800 border border-white/10 text-gray-400 font-rajdhani hover:bg-white/5 transition-colors flex items-center gap-3">
             <Terminal size={18} /> COMMAND LINE
          </button>
        </div>

        <div className="lg:col-span-3 glass-panel p-0 overflow-hidden border-red-500/30">
          <div className="bg-dark-900 p-3 border-b border-red-500/30 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 font-mono text-xs text-gray-500">root@chrona-core:~#</span>
          </div>
          
          <div className="p-6 font-mono text-sm space-y-2 h-[500px] overflow-y-auto bg-black text-green-500">
            <p className="text-gray-400">CHRONA OS v9.4.2 [Restricted Mode]</p>
            <p>Initializing connection to core database...</p>
            <p className="text-blue-400">[OK] Connection established.</p>
            <p>Scanning for temporal anomalies...</p>
            <p className="text-yellow-400">[WARN] 3 anomalies detected in Sector 4.</p>
            <br/>
            <p>root@chrona-core:~# <span className="typing-animation">select * from entities where lifespan &gt; 1000;</span></p>
            <div className="mt-4 border border-green-500/30 p-4">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-green-500/50">
                     <th className="pb-2">ID</th>
                     <th className="pb-2">ALIAS</th>
                     <th className="pb-2">LIFESPAN_REMAINING</th>
                     <th className="pb-2">STATUS</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td className="py-1">001</td>
                     <td>FOUNDER_A</td>
                     <td>9,999 YRS</td>
                     <td className="text-blue-400">IMMORTAL</td>
                   </tr>
                   <tr>
                     <td className="py-1">042</td>
                     <td>ARCHITECT</td>
                     <td>1,240 YRS</td>
                     <td className="text-green-400">ACTIVE</td>
                   </tr>
                   <tr>
                     <td className="py-1">899</td>
                     <td>UNKNOWN</td>
                     <td>ERR_OVRFLW</td>
                     <td className="text-red-500 animate-pulse">CORRUPT</td>
                   </tr>
                 </tbody>
               </table>
            </div>
            <br/>
            <p>root@chrona-core:~# _</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;
