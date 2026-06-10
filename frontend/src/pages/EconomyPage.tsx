import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', value: 4000 },
  { time: '04:00', value: 3000 },
  { time: '08:00', value: 2000 },
  { time: '12:00', value: 2780 },
  { time: '16:00', value: 1890 },
  { time: '20:00', value: 2390 },
  { time: '24:00', value: 3490 },
];

const EconomyPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between border-b border-neon-green/30 pb-4">
        <h1 className="text-3xl flex items-center gap-3">
          <TrendingUp className="text-neon-green" size={32} />
          LIFESPAN EXCHANGE
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex flex-col justify-center items-center">
          <p className="font-rajdhani text-gray-400 text-sm">CURRENT MARKET VALUE (1YR)</p>
          <h2 className="text-4xl font-bold text-neon-green mt-2 font-orbitron">12,450 ¤</h2>
          <div className="flex items-center gap-1 text-neon-green mt-2 text-sm">
            <TrendingUp size={16} />
            <span>+4.2% (24H)</span>
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-3">
          <h3 className="font-orbitron mb-4">GLOBAL LIFESPAN INDEX</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(0,243,255,0.3)' }}
                  itemStyle={{ color: '#00f3ff' }}
                />
                <Line type="monotone" dataKey="value" stroke="#00f3ff" strokeWidth={2} dot={{ fill: '#00f3ff', r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-xl mb-4 border-b border-white/10 pb-2">TIME TRANSACTIONS</h3>
          <div className="space-y-3">
            {[
              { type: 'BUY', amount: '10 YEARS', cost: '124,500 ¤', status: 'COMPLETED' },
              { type: 'SELL', amount: '2 MONTHS', cost: '2,075 ¤', status: 'PENDING' },
              { type: 'TRANSFER', amount: '5 YEARS', to: 'USER_8492', status: 'COMPLETED' },
            ].map((tx, i) => (
              <div key={i} className="flex justify-between items-center bg-dark-800 p-3 rounded border border-white/5 font-rajdhani">
                <div className="flex items-center gap-3">
                  {tx.type === 'BUY' ? <TrendingUp className="text-neon-green" size={16} /> : 
                   tx.type === 'SELL' ? <TrendingDown className="text-red-500" size={16} /> : 
                   <Activity className="text-neon-blue" size={16} />}
                  <span className="font-bold">{tx.type}</span>
                </div>
                <span className="text-gray-300">{tx.amount}</span>
                {tx.to ? <span className="text-gray-500">TO: {tx.to}</span> : <span className="text-neon-blue">{tx.cost}</span>}
                <span className={`text-xs ${tx.status === 'COMPLETED' ? 'text-gray-500' : 'text-neon-purple animate-pulse'}`}>{tx.status}</span>
              </div>
            ))}
          </div>
          <button className="hud-button w-full mt-6 text-sm">INITIATE TRANSFER</button>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl mb-4 border-b border-white/10 pb-2">COST OF LIVING</h3>
          <div className="space-y-4 font-exo text-sm text-gray-300">
            <div className="flex justify-between items-center bg-dark-800 p-3 rounded border border-white/5 hover:border-neon-purple/50 transition-colors cursor-pointer">
              <span>Cybernetic Arm Maintenance</span>
              <span className="text-red-400 font-bold">-2 Days</span>
            </div>
            <div className="flex justify-between items-center bg-dark-800 p-3 rounded border border-white/5 hover:border-neon-purple/50 transition-colors cursor-pointer">
              <span>Premium Rations (Monthly)</span>
              <span className="text-red-400 font-bold">-1 Week</span>
            </div>
            <div className="flex justify-between items-center bg-dark-800 p-3 rounded border border-white/5 hover:border-neon-purple/50 transition-colors cursor-pointer">
              <span>High-Speed Neural Link Subscription</span>
              <span className="text-red-400 font-bold">-1 Month</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded flex gap-4 items-start">
             <DollarSign className="text-red-500 shrink-0" />
             <p className="text-xs text-red-200 font-rajdhani">WARNING: YOUR CURRENT EXPENDITURE RATE WILL DEPLETE YOUR LIFESPAN IN EXACTLY 42 YEARS, 11 MONTHS, 14 DAYS. REDUCE SPENDING TO EXTEND SURVIVAL.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EconomyPage;
