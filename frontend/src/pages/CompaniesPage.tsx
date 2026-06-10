import React, { useState, useEffect } from 'react';
import { companyService, Company } from '../services/companyService';

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    pan: '',
    gstin: '',
    business_type: '',
    currency: 'INR',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await companyService.listCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await companyService.createCompany(formData);
      setFormData({
        name: '',
        legal_name: '',
        pan: '',
        gstin: '',
        business_type: '',
        currency: 'INR',
      });
      setShowForm(false);
      loadCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Companies</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Company
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Create New Company</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Legal Name"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="PAN"
              value={formData.pan}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="GSTIN"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Business Type"
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <button
              type="submit"
              className="col-span-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Create Company
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : companies.length === 0 ? (
        <p className="text-gray-600">No companies found. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800">{company.name}</h3>
              {company.pan && <p className="text-gray-600">PAN: {company.pan}</p>}
              {company.gstin && <p className="text-gray-600">GSTIN: {company.gstin}</p>}
              <p className="text-gray-600 text-sm mt-2">Currency: {company.currency}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
