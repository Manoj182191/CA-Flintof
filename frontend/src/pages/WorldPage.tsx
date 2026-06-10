import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield, ShieldAlert, ShieldCheck, Activity, Users, Radio, Cpu, RefreshCw, Zap } from 'lucide-react';

interface Sector {
  id: string;
  name: string;
  codename: string;
  status: 'STABLE' | 'RIOT' | 'CRITICAL' | 'ABANDONED';
  lifespanValue: number;
  syndicatePresence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  population: string;
  anomalies: number;
  x: number; // Percent width on map
  y: number; // Percent height on map
  details: string;
}

const SECTORS_DATA: Sector[] = [
  {
    id: 'SEC_01',
    name: 'Neo-Tokyo',
    codename: 'NXS_TOKYO',
    status: 'STABLE',
    lifespanValue: 14200,
    syndicatePresence: 'MEDIUM',
    population: '37.8M',
    anomalies: 0,
    x: 78,
    y: 32,
    details: 'Primary technological hub. High neural bandwidth. Syndicate operates under legal front corporations. Core lifespan banks are heavily fortified.'
  },
  {
    id: 'SEC_04',
    name: 'Neo-Mumbai',
    codename: 'NXS_MUMBAI',
    status: 'CRITICAL',
    lifespanValue: 8100,
    syndicatePresence: 'HIGH',
    population: '21.5M',
    anomalies: 3,
    x: 63,
    y: 45,
    details: 'Severe power fluctuations. 3 temporal anomalies detected in the lower districts. Syndicate forces actively raiding local lifespan reserves. Security forces overloaded.'
  },
  {
    id: 'SEC_07',
    name: 'New Berlin',
    codename: 'NXS_BERLIN',
    status: 'RIOT',
    lifespanValue: 11500,
    syndicatePresence: 'LOW',
    population: '8.9M',
    anomalies: 1,
    x: 48,
    y: 22,
    details: 'Civil unrest in Sector 7 sub-levels due to recent lifespan tax hikes. Local resistance hacking public time-terminals to distribute reserves.'
  },
  {
    id: 'SEC_12',
    name: 'Neo-New York',
    codename: 'NXS_NYC',
    status: 'STABLE',
    lifespanValue: 18900,
    syndicatePresence: 'LOW',
    population: '19.2M',
    anomalies: 0,
    x: 25,
    y: 28,
    details: 'Global financial node. Highest density of immortal-class citizens. Zero tolerance policy for time-theft. Surveillance grids operating at 100% efficiency.'
  },
  {
    id: 'SEC_09',
    name: 'Old London Ruins',
    codename: 'NXS_LDN_RUIN',
    status: 'ABANDONED',
    lifespanValue: 2400,
    syndicatePresence: 'CRITICAL',
    population: '450K',
    anomalies: 5,
    x: 43,
    y: 20,
    details: 'Grid collapsed in 2091. Mostly ruins inhabited by unregistered entities and syndicate scavengers. High temporal decay rates. Enter at own risk.'
  },
  {
    id: 'SEC_15',
    name: 'Neo-São Paulo',
    codename: 'NXS_SAMP',
    status: 'STABLE',
    lifespanValue: 9800,
    syndicatePresence: 'MEDIUM',
    population: '22.0M',
    anomalies: 0,
    x: 32,
    y: 68,
    details: 'Agricultural and biochemical synthesis node. Lifespan exchange rate is relatively stable, though black market activity exists in lower sectors.'
  }
];

const WorldPage: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<Sector>(SECTORS_DATA[1]); // Default to Neo-Mumbai
  const [hoveredSector, setHoveredSector] = useState<Sector | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const getStatusColor = (status: Sector['status']) => {
    switch (status) {
      case 'STABLE': return 'text-neon-green border-neon-green/30 bg-neon-green/10';
      case 'RIOT': return 'text-neon-purple border-neon-purple/30 bg-neon-purple/10';
      case 'CRITICAL': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'ABANDONED': return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getStatusDotColor = (status: Sector['status']) => {
    switch (status) {
      case 'STABLE': return 'bg-neon-green shadow-[0_0_10px_#00ff66]';
      case 'RIOT': return 'bg-neon-purple shadow-[0_0_10px_#b026ff]';
      case 'CRITICAL': return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
      case 'ABANDONED': return 'bg-gray-600';
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neon-blue/30 pb-4 gap-4">
        <h1 className="text-3xl flex items-center gap-3">
          <Globe className="text-neon-blue" size={32} />
          GLOBAL_TOPOLOGY_MAP
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 font-rajdhani text-sm text-gray-400">
            <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse"></span>
            NETWORK_STATUS: LINKED
          </div>
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className={`hud-button text-xs flex items-center gap-2 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'SCANNING_TOPOLOGY...' : 'SCAN_NETWORK'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization (Col Span 2) */}
        <div className="lg:col-span-2 glass-panel p-6 border-neon-blue/20 relative flex flex-col justify-between min-h-[500px]">
          {/* Futuristic Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] rounded-xl pointer-events-none" />
          
          {/* Scan Line effect when scanning */}
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-neon-blue/50 shadow-[0_0_15px_#00f3ff] z-20 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Header stats on map */}
          <div className="flex justify-between items-center text-xs font-rajdhani text-gray-400 z-10">
            <span>GRID_SYSTEM_V3.8</span>
            <span className="text-neon-blue animate-pulse">TAP_SECTOR_TO_ESTABLISH_NEURAL_ROUTING</span>
          </div>

          {/* Interactive World Map SVG Container */}
          <div className="relative w-full h-[350px] bg-dark-900/50 rounded border border-white/5 my-4 overflow-hidden flex items-center justify-center">
            {/* Minimalist Tech Outline World Map SVG */}
            <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 pointer-events-none">
              <path 
                fill="none" 
                stroke="#00f3ff" 
                strokeWidth="1" 
                strokeDasharray="2 4"
                d="M150,150 L200,140 L250,155 L300,120 L350,180 L400,140 L450,130 L500,160 L550,150 L600,130 L650,110 L700,160 L750,130 L800,145 L850,190 L900,210"
              />
              <path 
                fill="none" 
                stroke="#b026ff" 
                strokeWidth="1.5" 
                d="M100,250 C300,150 400,350 600,250 C700,200 800,300 900,250" 
                className="opacity-40"
              />
              {/* Fake coordinate grid lines */}
              <line x1="100" y1="0" x2="100" y2="500" stroke="rgba(255,255,255,0.05)" />
              <line x1="300" y1="0" x2="300" y2="500" stroke="rgba(255,255,255,0.05)" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255,255,255,0.05)" />
              <line x1="700" y1="0" x2="700" y2="500" stroke="rgba(255,255,255,0.05)" />
              <line x1="900" y1="0" x2="900" y2="500" stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(255,255,255,0.05)" />
            </svg>

            {/* Connection lines between sector nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Draw connection from active sector to others */}
              {SECTORS_DATA.map((sec, idx) => {
                if (sec.id === selectedSector.id) return null;
                return (
                  <motion.line
                    key={`line-${idx}`}
                    x1={`${selectedSector.x}%`}
                    y1={`${selectedSector.y}%`}
                    x2={`${sec.x}%`}
                    y2={`${sec.y}%`}
                    stroke="rgba(0, 243, 255, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                  />
                );
              })}
            </svg>

            {/* Interactive Sector Nodes */}
            {SECTORS_DATA.map((sector) => {
              const isSelected = sector.id === selectedSector.id;
              const isHovered = hoveredSector?.id === sector.id;
              return (
                <div
                  key={sector.id}
                  style={{ left: `${sector.x}%`, top: `${sector.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                  onClick={() => setSelectedSector(sector)}
                  onMouseEnter={() => setHoveredSector(sector)}
                  onMouseLeave={() => setHoveredSector(null)}
                >
                  {/* Outer glowing pulsing ring */}
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] } : { scale: 1, opacity: 0.3 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className={`absolute inset-[-8px] rounded-full border border-neon-blue/60 pointer-events-none ${
                      isSelected ? 'block' : 'hidden group-hover:block'
                    }`}
                  />

                  {/* Node Dot */}
                  <div className={`w-4 h-4 rounded-full border-2 border-dark-900 transition-transform duration-300 flex items-center justify-center ${
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  } ${getStatusDotColor(sector.status)}`} />

                  {/* Tooltip Label */}
                  <div className={`absolute left-6 top-1/2 -translate-y-1/2 bg-dark-900/90 border border-white/10 px-2 py-1 rounded font-rajdhani text-xs whitespace-nowrap transition-all duration-300 pointer-events-none ${
                    isSelected || isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  }`}>
                    <span className="text-white font-bold">{sector.name}</span>
                    <span className="text-gray-500 ml-2">[{sector.codename}]</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer monitor logs */}
          <div className="flex justify-between items-center text-xs font-mono text-gray-500 border-t border-white/5 pt-4 z-10">
            <div className="flex gap-4">
              <span>LATENCY: 14ms</span>
              <span>PACKETS: 100% OK</span>
            </div>
            <span>CHRONA_GRID_V2.0</span>
          </div>
        </div>

        {/* Side Detail Panel (Col Span 1) */}
        <div className="glass-panel p-6 border-neon-blue/20 flex flex-col justify-between min-h-[500px]">
          <div>
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white font-orbitron">{selectedSector.name}</h3>
                <span className="text-xs font-rajdhani text-gray-500 tracking-widest">{selectedSector.id} // {selectedSector.codename}</span>
              </div>
              <span className={`border px-2 py-0.5 rounded text-xs font-rajdhani tracking-widest ${getStatusColor(selectedSector.status)}`}>
                {selectedSector.status}
              </span>
            </div>

            {/* Stats list */}
            <div className="space-y-4 font-rajdhani">
              {/* Stat Item */}
              <div className="bg-dark-800 p-3 rounded border border-white/5">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>LIFESPAN VALUATION</span>
                  <span className="text-neon-blue font-bold">EXCHANGE RATE</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold font-orbitron text-white">{selectedSector.lifespanValue.toLocaleString()} ¤</span>
                  <span className="text-xs text-neon-green flex items-center gap-1 font-bold">+1.8% (24H)</span>
                </div>
              </div>

              {/* Stat Item */}
              <div className="bg-dark-800 p-3 rounded border border-white/5 flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-500">POPULATION DENSITY</div>
                  <div className="text-lg font-bold text-white mt-0.5">{selectedSector.population}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">SYNDICATE RISK</div>
                  <div className={`text-lg font-bold mt-0.5 ${
                    selectedSector.syndicatePresence === 'CRITICAL' || selectedSector.syndicatePresence === 'HIGH'
                      ? 'text-red-500' : 'text-gray-300'
                  }`}>{selectedSector.syndicatePresence}</div>
                </div>
              </div>

              {/* Anomalies Alert */}
              {selectedSector.anomalies > 0 ? (
                <div className="p-3 bg-red-950/20 border border-red-500/50 rounded flex gap-3 items-center text-red-200">
                  <ShieldAlert className="text-red-500 shrink-0" size={20} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">TEMPORAL ANOMALIES DETECTED</div>
                    <div className="text-xs text-red-400 mt-0.5">{selectedSector.anomalies} instability sectors active. Lifespan leak detected.</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-neon-green/5 border border-neon-green/30 rounded flex gap-3 items-center text-neon-green/90">
                  <ShieldCheck className="text-neon-green shrink-0" size={20} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">TEMPORAL INTEGRITY STABLE</div>
                    <div className="text-xs text-gray-400 mt-0.5">Zero temporal deviations detected. Integrity holding at 100%.</div>
                  </div>
                </div>
              )}

              {/* Narrative description */}
              <div className="pt-2">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 font-bold">SECTOR LOGS</div>
                <p className="text-sm text-gray-300 leading-relaxed font-exo">
                  {selectedSector.details}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-6 border-t border-white/10 mt-6">
            <button className="hud-button w-full text-sm flex items-center justify-center gap-2">
              <Zap size={14} />
              ESTABLISH ROUTING
            </button>
            <button className="w-full py-2 bg-dark-800 border border-white/10 text-xs tracking-widest font-rajdhani uppercase text-gray-400 hover:text-white hover:bg-white/5 rounded transition-all duration-300">
              DOWNLOAD SECTOR REPORT
            </button>
          </div>
        </div>
      </div>

      {/* Network overview status panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-4 flex items-center gap-4 border-neon-blue/10">
          <div className="p-3 bg-dark-800 rounded border border-white/5 text-neon-blue">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-rajdhani">GLOBAL NEURAL FLOW</div>
            <div className="text-lg font-bold font-orbitron">2.41 TB/S</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4 border-neon-blue/10">
          <div className="p-3 bg-dark-800 rounded border border-white/5 text-neon-purple">
            <Users size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-rajdhani">COGNITIVE SYNC LIMIT</div>
            <div className="text-lg font-bold font-orbitron">92.4%</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4 border-neon-blue/10">
          <div className="p-3 bg-dark-800 rounded border border-white/5 text-neon-green">
            <Radio size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-rajdhani">SATCOM UPLINKS ACTIVE</div>
            <div className="text-lg font-bold font-orbitron">14 / 16</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WorldPage;
