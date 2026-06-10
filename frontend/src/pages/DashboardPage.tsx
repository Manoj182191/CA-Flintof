import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Shield, Zap } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={containerVariants}
      className="space-y-10"
    >
      <div className="text-center mt-10">
        <motion.h1 
          variants={itemVariants}
          className="text-6xl md:text-8xl font-black mb-4 tracking-tighter"
        >
          EVERY CHOICE <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue neon-text-purple">
            COSTS LIFE.
          </span>
        </motion.h1>
        <motion.p variants={itemVariants} className="text-xl text-gray-400 font-rajdhani max-w-2xl mx-auto">
          SYSTEM_INITIALIZED. GLOBAL LIFESPAN ECONOMY ONLINE. 
          YOUR CURRENT RESERVE IS DEPLETING.
        </motion.p>
        <motion.div variants={itemVariants} className="mt-8">
          <button className="hud-button text-lg">ENTER NEURAL LINK</button>
        </motion.div>
      </div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        {[
          { icon: <Clock size={24} className="text-neon-blue" />, label: 'GLOBAL RESERVE', value: '4.2B YRS' },
          { icon: <Users size={24} className="text-neon-purple" />, label: 'ACTIVE ENTITIES', value: '842,109' },
          { icon: <Zap size={24} className="text-neon-green" />, label: 'SYSTEM LOAD', value: '98.4%' },
          { icon: <Shield size={24} className="text-red-500" />, label: 'SECURITY TIER', value: 'OMEGA' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-panel p-6 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors cursor-default">
            <div className="mb-4 p-3 rounded-full bg-dark-800 border border-white/10 group-hover:border-neon-blue/50 transition-colors">
              {stat.icon}
            </div>
            <h3 className="font-rajdhani text-gray-400 text-sm tracking-widest mb-1">{stat.label}</h3>
            <div className="font-orbitron text-2xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-8 mt-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h2 className="text-2xl mb-4 border-b border-white/10 pb-4 inline-block pr-10">LATEST INTEL</h2>
        <div className="space-y-4 font-exo text-gray-300">
          <p className="flex items-center gap-3">
            <span className="text-neon-blue font-bold">[{new Date().toLocaleTimeString()}]</span>
            Syndicate forces have seized control of the Neo-Tokyo time bank.
          </p>
          <p className="flex items-center gap-3">
            <span className="text-neon-purple font-bold">[{new Date(Date.now() - 3600000).toLocaleTimeString()}]</span>
            Market crash in Sector 4: Lifespan value plummeted by 12%.
          </p>
          <p className="flex items-center gap-3">
            <span className="text-neon-green font-bold">[{new Date(Date.now() - 7200000).toLocaleTimeString()}]</span>
            New longevity tech discovered in the ruins of Old Earth.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
