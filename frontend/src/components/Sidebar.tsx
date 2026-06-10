import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Companies', path: '/companies', icon: '🏢' },
    { name: 'Accounting', path: '/accounting', icon: '📘' },
    { name: 'Invoicing', path: '/invoicing', icon: '📄' },
    { name: 'GST', path: '/gst', icon: '📋' },
    { name: 'Reports', path: '/reports', icon: '📈' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">CA ERP</h1>
        <p className="text-gray-400 text-sm">Advanced Accounting</p>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
