import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Globe, User, TrendingUp, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const links = [
    { to: '/', label: 'SYS_CORE', icon: <Activity size={18} /> },
    { to: '/world', label: 'WORLD_MAP', icon: <Globe size={18} /> },
    { to: '/character', label: 'ENTITY_DATA', icon: <User size={18} /> },
    { to: '/economy', label: 'LIFESPAN_ECON', icon: <TrendingUp size={18} /> },
    { to: '/admin', label: 'OVERRIDE', icon: <Settings size={18} /> },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 rounded-none border-b border-neon-blue/20 bg-dark-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-blue/10 border border-neon-blue flex items-center justify-center neon-text-blue">
              C
            </div>
            <span className="font-orbitron font-bold text-xl tracking-[0.3em] text-white">CHRONA</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm font-rajdhani uppercase tracking-widest transition-all duration-300 ${
                      isActive
                        ? 'text-neon-blue border-b-2 border-neon-blue neon-text-blue'
                        : 'text-gray-400 hover:text-white hover:border-b-2 hover:border-gray-500'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.icon}
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue shadow-neon-blue"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
