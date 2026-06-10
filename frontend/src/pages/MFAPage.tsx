import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const MFAPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState('');
  const [setupData, setSetupData] = useState<{ secret: string; provisioning_uri: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated but needs to setup 2FA
    // In a real flow, you'd check a user.mfa_enabled flag
    if (isAuthenticated) {
        checkMfaStatus();
    }
  }, [isAuthenticated]);

  const checkMfaStatus = async () => {
      try {
          const user = await authService.getCurrentUser();
          // If the user object doesn't have mfa_enabled, we will just assume we can set it up if requested
      } catch (err) {
          console.error(err);
      }
  };

  const handleSetup = async () => {
      setLoading(true);
      setError('');
      try {
          const data = await authService.setup2fa();
          setSetupData(data);
      } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to generate 2FA setup');
      } finally {
          setLoading(false);
      }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verify2fa(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Two-Factor Auth</h1>
          <p className="text-gray-600 mt-2">Secure your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!setupData && (
            <div className="text-center mb-6">
                <button
                    onClick={handleSetup}
                    disabled={loading}
                    className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition"
                >
                    Setup New Device
                </button>
            </div>
        )}

        {setupData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-bold text-gray-700 mb-2">Setup Code:</p>
                <code className="bg-white px-2 py-1 rounded text-blue-600 border block break-all">
                    {setupData.secret}
                </code>
                <p className="text-xs text-gray-500 mt-2">Enter this code in Google Authenticator or Authy.</p>
            </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authenticator Code
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || token.length !== 6}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition mt-6"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MFAPage;
