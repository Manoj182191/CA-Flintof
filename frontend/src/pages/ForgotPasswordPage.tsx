import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Placeholder for API integration
            // const response = await apiClient.get(`/api-endpoint/${activeCompanyId}`);
            // setData(response.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            
{/*  Background Shader Layer  */}
<div className="fixed inset-0 z-0 pointer-events-none">

</div>
{/*  Decorative Elements  */}
<div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full"></div>
<div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
<main className="w-full max-w-[440px] z-10 relative">
{/*  Logo Section  */}
<div className="flex flex-col items-center mb-lg text-center">
<div className="mb-md bg-primary text-white p-3 rounded-xl shadow-lg">
<span className="material-symbols-outlined !text-[32px]">shield_person</span>
</div>
<h1 className="font-headline-md text-headline-md text-primary tracking-tight">FinPilot Pro</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-xs">Enterprise-grade Financial Intelligence</p>
</div>
{/*  Request State Panel  */}
<div className="glass-panel border border-outline-variant/30 rounded-xl p-xl shadow-sm transition-all-300 ai-glow" id="request-panel">
<div className="mb-lg">
<h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-sm">Forgot password?</h2>
<p className="font-body-md text-body-md text-on-surface-variant">
                    No worries. Enter your registered email and we'll send you a secure link to reset your credentials.
                </p>
</div>
<form className="space-y-lg" id="forgot-password-form">
<div className="space-y-xs">
<label className="font-label-sm text-label-sm text-on-surface ml-1" htmlFor="email">Work Email Address</label>
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
<span className="material-symbols-outlined !text-[20px]">mail</span>
</div>
<input className="w-full pl-[48px] pr-md py-3 bg-surface-container-low border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-all outline-none font-body-md text-body-md" id="email" name="email" placeholder="name@company.com" required={true} type="email"/>
</div>
</div>
<button className="w-full bg-primary text-white font-label-sm text-label-sm py-4 rounded-lg flex items-center justify-center gap-sm hover:bg-primary/90 active:scale-[0.98] transition-all-300 shadow-md group" id="submit-btn" type="submit">
<span id="btn-text">Send Reset Link</span>
<span className="material-symbols-outlined !text-[18px] group-hover:translate-x-1 transition-transform" id="btn-icon">arrow_forward</span>
</button>
</form>
<div className="mt-xl pt-lg border-t border-outline-variant/20 text-center">
<a className="inline-flex items-center gap-xs font-label-sm text-label-sm text-secondary hover:text-secondary-container transition-colors group" href="/login">
<span className="material-symbols-outlined !text-[18px] group-hover:-translate-x-1 transition-transform">chevron_left</span>
                    Back to Login
                </a>
</div>
</div>
{/*  Success State Panel (Hidden by default)  */}
<div className="hidden glass-panel border border-outline-variant/30 rounded-xl p-xl shadow-sm transition-all-300 scale-95 opacity-0 ai-glow" id="success-panel">
<div className="flex flex-col items-center text-center">
<div className="w-16 h-16 bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-lg">
<span className="material-symbols-outlined !text-[32px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
</div>
<h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-sm">Check your inbox</h2>
<p className="font-body-md text-body-md text-on-surface-variant mb-xl max-w-[300px]">
                    We've sent a secure password reset link to <span className="font-bold text-on-surface" id="display-email"></span>. 
                </p>
<div className="w-full space-y-md">
<button className="w-full bg-primary text-white font-label-sm text-label-sm py-4 rounded-lg hover:bg-primary/90 transition-all shadow-md" onClick={() => {}}>
                        Resend Link
                    </button>
<a className="block w-full text-center py-4 font-label-sm text-label-sm text-secondary hover:underline transition-all" href="/login">
                        Return to Login
                    </a>
</div>
<div className="mt-xl p-md bg-surface-container-low rounded-lg border border-outline-variant/20 text-left w-full flex gap-sm">
<span className="material-symbols-outlined text-on-surface-variant !text-[20px]">info</span>
<p className="font-body-md text-[12px] leading-tight text-on-surface-variant">
                        Didn't receive the email? Check your spam folder or contact your system administrator.
                    </p>
</div>
</div>
</div>
{/*  Footer Info  */}
<div className="mt-lg text-center">
<p className="font-label-sm text-[11px] uppercase tracking-[0.1em] text-on-surface-variant/60">
                © 2024 FinPilot Pro • Security &amp; Performance Architecture
            </p>
</div>
</main>


        </div>
    );
};

export default ForgotPasswordPage;
