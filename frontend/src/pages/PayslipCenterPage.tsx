import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { payrollService, PayrollRecord } from '../services/payrollService';

const PayslipCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompanyId } = useAuth();
  
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'Earnings' | 'Deductions'>('Earnings');
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [currentPayslip, setCurrentPayslip] = useState<PayrollRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeCompanyId) {
      setupData();
    }
  }, [activeCompanyId]);

  const setupData = async () => {
    setIsLoading(true);
    try {
      const employees = await payrollService.listEmployees(parseInt(activeCompanyId!));
      if (employees.length > 0) {
        const empId = employees[0].id!;
        setEmployeeId(empId);
        
        // Let's assume there's an API to get payslips by employee, 
        // but for now we'll fetch the records for the company and filter
        const records = await payrollService.listPayrollRecords(parseInt(activeCompanyId!));
        const myPayslips = records.filter((r: PayrollRecord) => r.employee_id === empId);
        setPayslips(myPayslips);
        
        if (myPayslips.length > 0) {
          setCurrentPayslip(myPayslips[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payslips', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    if (!employeeId || !activeCompanyId) return alert('No context available');
    setIsLoading(true);
    try {
      const todayMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      await payrollService.processPayroll(parseInt(activeCompanyId), {
        employee_id: employeeId,
        salary_month: todayMonth,
        attendance_days: 22,
        leaves_taken: 0,
        regime: 'new'
      });
      alert('Payroll processed for current month');
      setupData();
    } catch (error) {
      console.error('Failed to process payroll', error);
      alert('Failed to process payroll. It might already be processed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 font-body-md overflow-x-hidden flex flex-col">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-md w-full h-16 bg-surface-bright dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
        <div className="flex items-center gap-md">
          <button onClick={() => navigate('/payroll/attendance-leaves')} className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">arrow_back</button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">FinPilot AI Payroll</h1>
        </div>
        <div className="flex items-center gap-md">
          <div className="hidden md:flex gap-md">
            <button onClick={() => navigate('/payroll/employees')} className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors px-3 py-1 rounded-lg">Directory</button>
            <button onClick={() => navigate('/payroll/attendance-leaves')} className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors px-3 py-1 rounded-lg">Attendance & Leaves</button>
            <button className="font-label-sm text-label-sm text-secondary dark:text-secondary-fixed font-bold px-3 py-1 rounded-lg">Payslips</button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6 w-full flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !currentPayslip ? (
          <div className="text-center space-y-md">
            <p className="text-on-surface-variant">No payslips generated yet.</p>
            <button 
              onClick={handleProcessPayroll}
              className="px-md py-2 bg-primary text-on-primary rounded-lg font-label-sm hover:opacity-90 shadow-md"
            >
              Generate Mock Payslip
            </button>
          </div>
        ) : (
          <>
            {/* Month Selector */}
            <section className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Current Period</span>
                <div className="flex items-center gap-1 group cursor-pointer">
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">{currentPayslip.salary_month}</h2>
                  <span className="material-symbols-outlined text-primary group-active:translate-y-0.5 transition-transform">expand_more</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-surface-container rounded-lg text-primary active:scale-90 transition-transform">
                  <span className="material-symbols-outlined">mail</span>
                </button>
                <button className="p-2 bg-secondary text-on-secondary rounded-lg active:scale-90 transition-transform flex items-center gap-2">
                  <span className="material-symbols-outlined">download</span>
                  <span className="font-label-sm text-label-sm hidden sm:block">PDF</span>
                </button>
              </div>
            </section>

            {/* Net Pay Hero Card */}
            <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-on-primary shadow-lg">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary-container/10 rounded-full blur-3xl"></div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="font-label-sm text-label-sm text-primary-fixed opacity-80">Take-home Salary</p>
                <h3 className="font-display-lg text-4xl tracking-tighter">₹{currentPayslip.net_salary.toFixed(2)}</h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs mr-1">trending_up</span> Paid
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown Tabs */}
            <section className="space-y-4">
              <div className="flex gap-4 border-b border-outline-variant/30 overflow-x-auto hide-scrollbar">
                <button 
                  onClick={() => setActiveTab('Earnings')}
                  className={`pb-2 font-label-sm text-label-sm px-2 ${activeTab === 'Earnings' ? 'border-b-2 border-secondary text-secondary' : 'text-on-surface-variant'}`}
                >
                  Earnings
                </button>
                <button 
                  onClick={() => setActiveTab('Deductions')}
                  className={`pb-2 font-label-sm text-label-sm px-2 ${activeTab === 'Deductions' ? 'border-b-2 border-secondary text-secondary' : 'text-on-surface-variant'}`}
                >
                  Deductions
                </button>
              </div>

              {activeTab === 'Earnings' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden p-4 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-body-md text-body-md font-semibold text-primary">Basic Salary</p>
                      <p className="text-[10px] text-on-surface-variant">Fixed Component</p>
                    </div>
                    <p className="font-data-mono text-data-mono text-primary">₹{currentPayslip.basic_salary.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-body-md text-body-md font-semibold text-primary">HRA</p>
                      <p className="text-[10px] text-on-surface-variant">House Rent Allowance</p>
                    </div>
                    <p className="font-data-mono text-data-mono text-primary">₹{currentPayslip.hra.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-body-md text-body-md font-semibold text-primary">Special Allowance</p>
                      <p className="text-[10px] text-on-surface-variant">Taxable Benefit</p>
                    </div>
                    <p className="font-data-mono text-data-mono text-primary">₹{currentPayslip.special_allowance.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-body-md text-body-md font-semibold text-primary">LTA</p>
                      <p className="text-[10px] text-on-surface-variant">Leave Travel Allowance</p>
                    </div>
                    <p className="font-data-mono text-data-mono text-primary">₹{currentPayslip.lta.toFixed(2)}</p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-outline-variant/20 flex justify-between items-center font-bold">
                    <p className="text-primary">Gross Earnings</p>
                    <p className="text-primary">₹{currentPayslip.gross_earnings.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {activeTab === 'Deductions' && (
                <div className="bg-surface-container-low/50 border border-outline-variant rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-error">money_off</span>
                    </div>
                    <div>
                      <h4 className="font-label-sm text-label-sm text-primary">Total Deductions</h4>
                      <p className="font-data-mono text-data-mono text-error">- ₹{currentPayslip.total_deductions.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">PF</p>
                      <p className="font-data-mono text-xs font-bold text-primary">₹{currentPayslip.pf_deduction.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">ESI</p>
                      <p className="font-data-mono text-xs font-bold text-primary">₹{currentPayslip.esi_deduction.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">PT</p>
                      <p className="font-data-mono text-xs font-bold text-primary">₹{currentPayslip.pt_deduction.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">TDS</p>
                      <p className="font-data-mono text-xs font-bold text-primary">₹{currentPayslip.tds_deduction.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Compliance & HR Footer Info */}
            <div className="flex items-center justify-between p-4 bg-surface-container-highest/30 rounded-xl border border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">verified_user</span>
                <span className="font-label-sm text-label-sm text-primary">Certified by FinPilot Core</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PayslipCenterPage;
