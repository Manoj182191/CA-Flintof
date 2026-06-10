import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const ResetPasswordPage: React.FC = () => {
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
            
{/*  Top Navigation Bar  */}
<header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm sticky top-0 z-50 flex justify-between items-center w-full px-gutter h-16">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</span>
</div>
<div className="flex items-center gap-4">
<div className="hidden md:flex gap-6 items-center">
<span className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer hover:text-primary transition-colors">Support</span>
<span className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer hover:text-primary transition-colors">Security Center</span>
</div>
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>help</span>
</div>
</div>
</header>
<main className="flex-grow flex items-center justify-center p-gutter relative overflow-hidden">
{/*  Background decorative elements  */}
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -z-10"></div>
<div className="w-full max-w-[480px] glass-panel ai-focus-glow rounded-xl p-8 md:p-10">
{/*  Header Section  */}
<div className="mb-8">
<div className="inline-flex items-center justify-center w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg mb-6">
<span className="material-symbols-outlined" style={{ fontSize: '28px' }}>lock_reset</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-primary mb-2">Reset Password</h1>
<p className="text-on-surface-variant font-body-md">Your security is our priority. Choose a strong, unique password to protect your financial data.</p>
</div>
{/*  Form Section  */}
<form className="space-y-6" id="reset-form">
{/*  New Password Field  */}
<div className="space-y-2">
<label className="font-label-sm text-label-sm text-on-surface flex justify-between" htmlFor="new-password">
                        New Password
                        <span className="text-on-surface-variant font-normal" id="strength-label">Min 12 characters</span>
</label>
<div className="relative group input-focus-ring border border-outline-variant bg-surface-container-low rounded-lg transition-all">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
<input className="w-full bg-transparent border-none py-3 pl-10 pr-10 focus:ring-0 text-on-surface placeholder:text-outline/60 font-body-md" id="new-password" placeholder="••••••••••••" required={true} type="password"/>
<button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary" onClick={() => {}} type="button">
<span className="material-symbols-outlined" id="eye-icon-new">visibility</span>
</button>
</div>
{/*  Strength Indicators  */}
<div className="pt-2">
<div className="flex gap-1.5 h-1 w-full mb-3">
<div className="flex-1 bg-surface-container-highest rounded-full transition-colors duration-500" id="strength-1"></div>
<div className="flex-1 bg-surface-container-highest rounded-full transition-colors duration-500" id="strength-2"></div>
<div className="flex-1 bg-surface-container-highest rounded-full transition-colors duration-500" id="strength-3"></div>
<div className="flex-1 bg-surface-container-highest rounded-full transition-colors duration-500" id="strength-4"></div>
</div>
<ul className="grid grid-cols-2 gap-x-4 gap-y-2">
<li className="flex items-center gap-2 text-[11px] text-on-surface-variant" id="req-length">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"wght" 600' }}>check_circle</span> 12+ characters
                            </li>
<li className="flex items-center gap-2 text-[11px] text-on-surface-variant" id="req-number">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"wght" 600' }}>check_circle</span> One number
                            </li>
<li className="flex items-center gap-2 text-[11px] text-on-surface-variant" id="req-symbol">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"wght" 600' }}>check_circle</span> One symbol
                            </li>
<li className="flex items-center gap-2 text-[11px] text-on-surface-variant" id="req-case">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"wght" 600' }}>check_circle</span> Mix of case
                            </li>
</ul>
</div>
</div>
{/*  Confirm Password Field  */}
<div className="space-y-2">
<label className="font-label-sm text-label-sm text-on-surface" htmlFor="confirm-password">Confirm New Password</label>
<div className="relative group input-focus-ring border border-outline-variant bg-surface-container-low rounded-lg transition-all">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">verified_user</span>
<input className="w-full bg-transparent border-none py-3 pl-10 pr-10 focus:ring-0 text-on-surface placeholder:text-outline/60 font-body-md" id="confirm-password" placeholder="••••••••••••" required={true} type="password"/>
<button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary" onClick={() => {}} type="button">
<span className="material-symbols-outlined" id="eye-icon-confirm">visibility</span>
</button>
</div>
<p className="text-error font-label-sm text-[11px] hidden" id="match-error">Passwords do not match</p>
</div>
{/*  Submit Button  */}
<button className="w-full bg-secondary text-on-secondary font-headline-md text-headline-md py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4" type="submit">
                    Update Password
                    <span className="material-symbols-outlined">arrow_forward</span>
</button>
</form>
{/*  Secondary Actions  */}
<div className="mt-8 pt-6 border-t border-outline-variant/30 flex flex-col items-center gap-4">
<a className="text-secondary font-label-sm text-label-sm hover:underline" href="#">Back to Login</a>
<p className="text-[11px] text-on-surface-variant text-center max-w-[280px]">
                    Updating your password will log you out of all other active sessions.
                </p>
</div>
</div>
</main>
{/*  Success Modal (Hidden by default)  */}
<div className="fixed inset-0 z-[100] flex items-center justify-center p-gutter bg-primary/20 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300" id="success-modal">
<div className="bg-surface glass-panel rounded-2xl p-10 max-w-[400px] text-center shadow-2xl scale-95 transition-transform duration-300" id="modal-content">
<div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
<span className="material-symbols-outlined" style={{ fontSize: '40px', fontVariationSettings: '"FILL" 1' }}>check_circle</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary mb-3">Password Secure</h2>
<p className="text-on-surface-variant mb-8">Your credentials have been successfully updated. Redirecting you to the dashboard...</p>
<div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
<div className="bg-secondary h-full animate-progress-bar" style={{ width: '100%' }}></div>
</div>
</div>
</div>
<footer className="h-12 flex items-center justify-center px-gutter text-on-surface-variant font-label-sm text-[11px] opacity-60">
        © 2024 FinPilot Pro • Financial Operating System • Version 4.12.0
    </footer>

<style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-shrink {
            from { width: 100%; }
            to { width: 0%; }
        }
        .animate-progress-bar {
            animation: progress-shrink 3s linear forwards;
        }
    ` }} />

        </div>
    );
};

export default ResetPasswordPage;
