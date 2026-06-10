import React from 'react';
import { motion } from 'framer-motion';
import { User, Crosshair, Brain, Heart } from 'lucide-react';

const CharacterPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between border-b border-neon-purple/30 pb-4">
        <h1 className="text-3xl flex items-center gap-3">
          <User className="text-neon-purple" size={32} />
          ENTITY_PROFILES
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Character Card */}
        <div className="md:col-span-1 glass-panel p-6 border-neon-purple/30">
          <div className="aspect-square bg-dark-800 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/20 to-transparent"></div>
             <User size={100} className="text-gray-600" />
             <div className="absolute top-2 right-2 bg-dark-900 border border-neon-blue px-2 py-1 text-xs font-rajdhani text-neon-blue rounded">Lvl 42</div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-center">NEXUS_7</h2>
          <p className="text-center text-sm text-gray-400 font-rajdhani tracking-widest mt-1">CLASS: TIME HACKER</p>
          
          <div className="mt-8 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-rajdhani mb-1 text-gray-400">
                <span>REMAINING LIFESPAN</span>
                <span className="text-neon-blue">42Y 11M 14D</span>
              </div>
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-neon-blue w-[65%] shadow-neon-blue"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-rajdhani mb-1 text-gray-400">
                <span>REPUTATION (SYNDICATE)</span>
                <span className="text-neon-purple">HOSTILE</span>
              </div>
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-neon-purple w-[15%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Skills */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-xl mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
              <Brain className="text-neon-green" size={20} />
              NEURAL CAPABILITIES
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'CHRONO-SHIFT', val: 85, color: 'bg-neon-blue' },
                { name: 'DATA EXTRACTION', val: 92, color: 'bg-neon-purple' },
                { name: 'STEALTH', val: 45, color: 'bg-gray-400' },
                { name: 'COMBAT', val: 60, color: 'bg-red-500' },
              ].map(skill => (
                <div key={skill.name} className="bg-dark-800 p-4 rounded border border-white/5">
                  <div className="flex justify-between text-sm font-rajdhani mb-2">
                    <span>{skill.name}</span>
                    <span>{skill.val}%</span>
                  </div>
                  <div className="h-1 bg-dark-900 rounded-full">
                    <div className={`h-full ${skill.color}`} style={{ width: `${skill.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-xl mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
              <Crosshair className="text-red-500" size={20} />
              EQUIPMENT LOADOUT
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(slot => (
                <div key={slot} className="aspect-square bg-dark-800 rounded border border-white/10 hover:border-neon-blue transition-colors flex items-center justify-center cursor-pointer relative group">
                  <span className="text-gray-600 font-rajdhani text-xs">SLOT {slot}</span>
                  <div className="absolute inset-0 bg-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterPage;
