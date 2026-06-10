import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  activeCompanyId: string | null;
  login: (token: string) => void;
  logout: () => void;
  setActiveCompany: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const companyId = localStorage.getItem('active_company_id');
    
    if (token) {
      setIsAuthenticated(true);
    }
    if (companyId) {
      setActiveCompanyId(companyId);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('active_company_id');
    setIsAuthenticated(false);
    setActiveCompanyId(null);
  };

  const setActiveCompany = (id: string) => {
    localStorage.setItem('active_company_id', id);
    setActiveCompanyId(id);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, activeCompanyId, login, logout, setActiveCompany }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
