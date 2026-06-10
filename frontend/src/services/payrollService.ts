import { apiClient } from './apiClient';

export interface Employee {
  id?: number;
  company_id?: number;
  employee_id?: string;
  employee_code?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  pan?: string;
  aadhaar?: string;
  date_of_joining?: string;
  designation?: string;
  department?: string;
  salary_structure?: Record<string, any>;
  bank_account?: string;
  ifsc_code?: string;
  pf_account?: string;
  esic_account?: string;
  status?: string;
}

export interface Attendance {
  id?: number;
  employee_id: number;
  attendance_date: string;
  status: string;
  working_hours?: number;
  remarks?: string;
}

export interface Leave {
  id?: number;
  employee_id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason?: string;
  status?: string;
}

export interface PayrollRecord {
  id: number;
  company_id: number;
  employee_id: number;
  salary_month: string;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  lta: number;
  gross_earnings: number;
  pf_deduction: number;
  esi_deduction: number;
  pt_deduction: number;
  tds_deduction: number;
  total_deductions: number;
  net_salary: number;
}

export interface ProcessPayrollRequest {
  employee_id: number;
  salary_month: string;
  attendance_days?: number;
  leaves_taken?: number;
  regime?: string;
}

export const payrollService = {
  // Employees
  createEmployee: async (data: Employee) => {
    const response = await apiClient.post('/payroll/employees', data);
    return response.data;
  },

  listEmployees: async (companyId: number, status?: string) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/payroll/employees/${companyId}`, { params });
    return response.data;
  },

  getEmployee: async (employeeId: number) => {
    const response = await apiClient.get(`/payroll/employees/by-id/${employeeId}`);
    return response.data;
  },

  // Attendance
  recordAttendance: async (data: Attendance) => {
    const response = await apiClient.post('/payroll/attendance', data);
    return response.data;
  },

  listAttendance: async (employeeId: number, fromDate?: string, toDate?: string) => {
    const params: any = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    const response = await apiClient.get(`/payroll/attendance/${employeeId}`, { params });
    return response.data;
  },

  // Leaves
  applyLeave: async (data: Leave) => {
    const response = await apiClient.post('/payroll/leaves', data);
    return response.data;
  },

  listLeaves: async (employeeId: number) => {
    const response = await apiClient.get(`/payroll/leaves/${employeeId}`);
    return response.data;
  },

  updateLeaveStatus: async (leaveId: number, status: string) => {
    const response = await apiClient.patch(`/payroll/leaves/${leaveId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // Payroll Processing
  processPayroll: async (companyId: number, data: ProcessPayrollRequest) => {
    const response = await apiClient.post('/payroll/process', data, {
      params: { company_id: companyId },
    });
    return response.data;
  },

  getPayslip: async (payrollId: number) => {
    const response = await apiClient.get(`/payroll/payslip/${payrollId}`);
    return response.data;
  },

  getPayrollRegister: async (companyId: number, salaryMonth: string) => {
    const response = await apiClient.get(`/payroll/register/${companyId}`, {
      params: { salary_month: salaryMonth },
    });
    return response.data;
  },

  listPayrollRecords: async (companyId: number, salaryMonth?: string) => {
    const params: any = {};
    if (salaryMonth) params.salary_month = salaryMonth;
    const response = await apiClient.get(`/payroll/records/${companyId}`, { params });
    return response.data;
  },

  // Calculators
  calculatePF: async (basicSalary: number) => {
    const response = await apiClient.post('/payroll/calculate/pf', { basic_salary: basicSalary });
    return response.data;
  },

  calculateESI: async (grossSalary: number) => {
    const response = await apiClient.post('/payroll/calculate/esi', { gross_salary: grossSalary });
    return response.data;
  },

  calculatePT: async (grossSalary: number, month: number) => {
    const response = await apiClient.post('/payroll/calculate/pt', { gross_salary: grossSalary, month });
    return response.data;
  },

  calculateTDS: async (annualSalary: number, regime: string = 'new') => {
    const response = await apiClient.post('/payroll/calculate/tds', { annual_salary: annualSalary, regime });
    return response.data;
  }
};
