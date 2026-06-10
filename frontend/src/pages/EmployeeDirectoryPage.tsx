import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { payrollService, Employee } from '../services/payrollService';

const EmployeeDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompanyId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeCompanyId) {
      fetchEmployees();
    }
  }, [activeCompanyId]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await payrollService.listEmployees(parseInt(activeCompanyId!));
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.last_name && emp.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (emp.employee_id && emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-md w-full h-16 bg-surface-bright dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
        <div className="flex items-center gap-md">
          <button onClick={() => navigate('/dashboard')} className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">arrow_back</button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">FinPilot AI Payroll</h1>
        </div>
        <div className="flex items-center gap-md">
          <div className="hidden md:flex gap-md">
            <button className="font-label-sm text-label-sm text-secondary dark:text-secondary-fixed font-bold px-3 py-1 rounded-lg">Directory</button>
            <button onClick={() => navigate('/payroll/attendance-leaves')} className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors px-3 py-1 rounded-lg">Attendance & Leaves</button>
            <button onClick={() => navigate('/payroll/payslips')} className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors px-3 py-1 rounded-lg">Payslips</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content Canvas */}
        <main className="flex-1 p-md md:p-lg lg:p-xl space-y-lg pb-24 max-w-[1440px] mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary">Employee Directory</h2>
              <p className="text-on-surface-variant font-body-md">Manage your workforce, roles, and payroll status in one centralized cockpit.</p>
            </div>
            <div className="flex gap-sm">
              <button className="flex items-center gap-sm px-md py-2 border border-outline rounded-lg font-label-sm text-label-sm hover:bg-surface-container-low transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export List
              </button>
              <button className="flex items-center gap-sm px-md py-2 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-all active:scale-95 shadow-md">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Add Employee
              </button>
            </div>
          </div>

          {/* AI Insight Banner */}
          <div className="bg-surface-container-low rounded-xl p-md flex items-center gap-md border-l-4 border-l-secondary-container shadow-sm">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            </div>
            <div>
              <h4 className="font-label-sm text-label-sm text-secondary font-bold">FinPilot AI Insight</h4>
              <p className="text-on-surface-variant text-[13px]">Found {employees.filter(e => e.status === 'Pending').length} employees with pending verifications.</p>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
            {/* Search */}
            <div className="lg:col-span-5 relative">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                className="w-full pl-xl pr-md py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary-container text-body-md outline-none" 
                placeholder="Search by name, role, or ID..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Filters */}
            <div className="lg:col-span-7 flex flex-wrap gap-sm items-center">
              <select className="bg-surface-container-low border-none rounded-xl py-3 px-md text-body-md focus:ring-2 focus:ring-secondary-container cursor-pointer outline-none">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Product</option>
                <option>Finance</option>
              </select>
              <select className="bg-surface-container-low border-none rounded-xl py-3 px-md text-body-md focus:ring-2 focus:ring-secondary-container cursor-pointer outline-none">
                <option>Active Status</option>
                <option>On Leave</option>
                <option>Terminated</option>
              </select>
              <button className="bg-surface-container-low p-3 rounded-xl hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
              </button>
            </div>
          </div>

          {/* Directory List */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0">
                  <tr>
                    <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider">Employee</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider">ID & Dept</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider">Status</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider">Role</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-surface-container-low transition-colors cursor-pointer group">
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-md">
                          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
                            {emp.first_name.charAt(0)}{emp.last_name ? emp.last_name.charAt(0) : ''}
                          </div>
                          <div>
                            <p className="font-body-md font-semibold text-on-surface">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[12px] text-outline">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <p className="font-data-mono text-data-mono text-primary">{emp.employee_id}</p>
                        <p className="text-[12px] text-on-surface-variant">{emp.department || 'N/A'}</p>
                      </td>
                      <td className="px-lg py-md">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full uppercase tracking-tighter">
                          {emp.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-lg py-md text-on-surface-variant font-body-md">{emp.designation || 'N/A'}</td>
                      <td className="px-lg py-md text-right">
                        <button className="text-outline group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDirectoryPage;
