import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { payrollService, Attendance, Leave } from '../services/payrollService';

const AttendanceLeavesHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompanyId } = useAuth();
  
  // Using a hardcoded employeeId for the demo. In a real app, this would come from the auth context for the logged-in employee.
  // We'll fetch the first employee in the company to use as the context.
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeCompanyId) {
      setupData();
    }
  }, [activeCompanyId]);

  const setupData = async () => {
    setIsLoading(true);
    try {
      // Get an employee to act as the current user
      const employees = await payrollService.listEmployees(parseInt(activeCompanyId!));
      if (employees.length > 0) {
        const empId = employees[0].id!;
        setEmployeeId(empId);
        
        // Fetch their attendance and leaves
        const [attendanceData, leavesData] = await Promise.all([
          payrollService.listAttendance(empId),
          payrollService.listLeaves(empId)
        ]);
        setAttendances(attendanceData);
        setLeaves(leavesData);
      }
    } catch (error) {
      console.error('Failed to fetch attendance data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!employeeId) return alert('No employee context');
    
    const today = new Date().toISOString().split('T')[0];
    try {
      await payrollService.applyLeave({
        employee_id: employeeId,
        leave_type: 'Casual Leave',
        from_date: today,
        to_date: today,
        reason: 'Personal errand'
      });
      alert('Leave applied successfully');
      setupData();
    } catch (error) {
      console.error('Failed to apply leave', error);
      alert('Failed to apply leave');
    }
  };

  const handleMarkAttendance = async () => {
    if (!employeeId) return alert('No employee context');

    const today = new Date().toISOString().split('T')[0];
    try {
      await payrollService.recordAttendance({
        employee_id: employeeId,
        attendance_date: today,
        status: 'Present',
        working_hours: 8
      });
      alert('Attendance marked for today');
      setupData();
    } catch (error) {
      console.error('Failed to mark attendance', error);
      alert('Failed to mark attendance');
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-md w-full h-16 bg-surface-bright dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
        <div className="flex items-center gap-md">
          <button onClick={() => navigate('/payroll/employees')} className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">arrow_back</button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">FinPilot AI Payroll</h1>
        </div>
        <div className="flex items-center gap-md">
          <div className="hidden md:flex gap-md">
            <button onClick={() => navigate('/payroll/employees')} className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors px-3 py-1 rounded-lg">Directory</button>
            <button className="font-label-sm text-label-sm text-secondary dark:text-secondary-fixed font-bold px-3 py-1 rounded-lg">Attendance & Leaves</button>
            <button onClick={() => navigate('/payroll/payslips')} className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors px-3 py-1 rounded-lg">Payslips</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content Canvas */}
        <main className="flex-1 p-md md:p-lg lg:p-xl space-y-lg pb-24 max-w-[1440px] mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary">Attendance & Leaves</h2>
              <p className="text-on-surface-variant font-body-md">Manage your time off and team availability.</p>
            </div>
            <div className="flex gap-sm">
              <button 
                onClick={handleMarkAttendance}
                className="flex items-center gap-sm px-md py-2 border border-outline rounded-lg font-label-sm text-label-sm hover:bg-surface-container-low transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Mark Present Today
              </button>
              <button 
                onClick={handleApplyLeave}
                className="flex items-center gap-sm px-md py-2 bg-secondary text-on-secondary rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-all active:scale-95 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Apply Leave
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
              {/* Leave Balance Widgets (Top row) */}
              <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-md">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Sick Leave</span>
                  <span className="material-symbols-outlined text-error">medical_services</span>
                </div>
                <div>
                  <p className="font-headline-lg text-headline-lg text-primary">08 <span className="text-body-md font-normal text-on-surface-variant">/ 12 days</span></p>
                  <div className="w-full bg-surface-container h-1.5 rounded-full mt-sm overflow-hidden">
                    <div className="bg-error h-full rounded-full w-[66%]"></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-md">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Casual Leave</span>
                  <span className="material-symbols-outlined text-secondary">event_available</span>
                </div>
                <div>
                  <p className="font-headline-lg text-headline-lg text-primary">04 <span className="text-body-md font-normal text-on-surface-variant">/ 10 days</span></p>
                  <div className="w-full bg-surface-container h-1.5 rounded-full mt-sm overflow-hidden">
                    <div className="bg-secondary h-full rounded-full w-[40%]"></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-md">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Earned Leave</span>
                  <span className="material-symbols-outlined text-tertiary-container">beach_access</span>
                </div>
                <div>
                  <p className="font-headline-lg text-headline-lg text-primary">15 <span className="text-body-md font-normal text-on-surface-variant">/ 24 days</span></p>
                  <div className="w-full bg-surface-container h-1.5 rounded-full mt-sm overflow-hidden">
                    <div className="bg-tertiary-container h-full rounded-full w-[62%]"></div>
                  </div>
                </div>
              </div>

              {/* Attendance Log (Left side, large) */}
              <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
                  <h3 className="font-headline-md text-headline-md text-primary">Recent Attendance</h3>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider">Date</th>
                        <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider">Status</th>
                        <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider">Hours</th>
                        <th className="px-lg py-md font-label-sm text-label-sm text-outline uppercase tracking-wider">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {attendances.slice(0, 7).map((att) => (
                        <tr key={att.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-lg py-md font-data-mono text-primary">{att.attendance_date}</td>
                          <td className="px-lg py-md">
                            <span className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-tighter bg-emerald-100 text-emerald-700">
                              {att.status}
                            </span>
                          </td>
                          <td className="px-lg py-md font-body-md text-on-surface-variant">{att.working_hours}h</td>
                          <td className="px-lg py-md font-body-md text-on-surface-variant">{att.remarks || '-'}</td>
                        </tr>
                      ))}
                      {attendances.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-lg py-xl text-center text-on-surface-variant">
                            No recent attendance records.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Requests (Right side) */}
              <div className="lg:col-span-4 flex flex-col gap-lg">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex-1 shadow-sm">
                  <div className="flex items-center justify-between mb-lg">
                    <h3 className="font-headline-md text-headline-md text-primary">Your Leaves</h3>
                  </div>
                  <div className="space-y-md">
                    {leaves.slice(0, 5).map(leave => (
                      <div key={leave.id} className="p-md rounded-lg bg-white border border-outline-variant/30 shadow-sm">
                        <div className="flex items-start justify-between mb-sm">
                          <div>
                            <p className="font-body-md text-body-md font-semibold text-primary">{leave.leave_type}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{leave.from_date} to {leave.to_date}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {leave.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant truncate">{leave.reason}</p>
                      </div>
                    ))}
                    {leaves.length === 0 && (
                      <p className="text-sm text-on-surface-variant text-center py-4">No leave requests found.</p>
                    )}
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg bg-gradient-to-br from-primary-container to-primary text-white shadow-sm">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="material-symbols-outlined text-secondary-fixed">lightbulb</span>
                    <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-widest">Policy Note</span>
                  </div>
                  <p className="font-body-md text-body-md mb-md opacity-90">Leaves exceeding 3 days require a medical certificate or prior approval from HR.</p>
                  <a className="font-label-sm text-label-sm text-secondary-fixed-dim hover:underline flex items-center gap-xs" href="#">
                    View Leave Policy <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AttendanceLeavesHubPage;
