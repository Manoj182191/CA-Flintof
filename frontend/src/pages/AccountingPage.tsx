import React from 'react';

const AccountingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Accounting</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Chart of Accounts</h3>
          <button className="text-blue-600 hover:underline">View COA</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Vouchers</h3>
          <button className="text-blue-600 hover:underline">Create Voucher</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Reports</h3>
          <button className="text-blue-600 hover:underline">View Reports</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Vouchers</h2>
        <p className="text-gray-600">No vouchers yet</p>
      </div>
    </div>
  );
};

export default AccountingPage;
