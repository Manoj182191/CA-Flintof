import React from 'react';

const InvoicingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Invoicing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Invoices</h3>
          <button className="text-blue-600 hover:underline">Create Invoice</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Purchase Orders</h3>
          <button className="text-blue-600 hover:underline">Create PO</button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Customers</h3>
          <button className="text-blue-600 hover:underline">Manage Customers</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Outstanding Invoices</h2>
        <p className="text-gray-600">No outstanding invoices</p>
      </div>
    </div>
  );
};

export default InvoicingPage;
