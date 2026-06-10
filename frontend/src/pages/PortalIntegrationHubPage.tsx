import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const PortalIntegrationHubPage: React.FC = () => {
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
            
{/*  Navigation Shell  */}
<nav className="sticky top-0 z-50 flex justify-between items-center px-md w-full h-16 bg-surface-bright border-b border-outline-variant font-headline-md text-headline-md font-bold text-primary">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary">menu</span>
<span className="font-headline-md text-headline-md font-bold text-primary">FinPilot AI</span>
</div>
<div className="hidden md:flex items-center gap-lg">
<a className="text-on-surface-variant hover:bg-surface-container-high px-md py-xs rounded transition-colors font-body-md text-body-md" href="#">Dashboard</a>
<a className="text-secondary font-bold font-body-md text-body-md" href="#">Gov Connect</a>
<a className="text-on-surface-variant hover:bg-surface-container-high px-md py-xs rounded transition-colors font-body-md text-body-md" href="#">Reports</a>
</div>
<div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
<img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJYm92T7C_gI-U4f6qNTb_A5h9eJwQdlgCRbeUSo3IUr8R9Q1_VK5cBL_VY3jG-_JPe7va77_FGIpYxi41UUFK7L2p2dm3yQllpYFLD0iFodown_rzvssfMrRlArPtARSfM3iXWt1u_yW1v72ofx4V8ukj1AmpsZqLHjULC9lzl4laAYpGUGnRu7qfGUJM_MsZ8W3-gfOzXUYOoZ0ZtNepU1-lbnXv57RbK6wO7tTYnRt7R8L7JNBa5Oxdlp1L-F2C1W2XGHoZzm8"/>
</div>
</nav>
<main className="max-w-[1440px] mx-auto p-md md:p-lg lg:p-xl pb-24">
{/*  Header Section  */}
<header className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
<div className="space-y-xs">
<h1 className="font-headline-lg text-headline-lg text-primary">Government Integration</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Real-time gateway connectivity for statutory compliance and data retrieval.</p>
</div>
<div className="flex items-center gap-sm px-md py-sm bg-surface-container-low border border-outline-variant rounded-xl ai-glow">
<span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse"></span>
<span className="font-label-sm text-label-sm text-on-surface">Global Connectivity: Stable</span>
</div>
</header>
{/*  Connectivity Grid (Bento Style)  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md md:gap-lg">
{/*  GST Portal Card  */}
<div className="glass-panel p-md rounded-xl flex flex-col justify-between hover:shadow-lg transition-all group">
<div className="space-y-md">
<div className="flex justify-between items-start">
<div className="p-base bg-surface-container-highest rounded-lg text-secondary">
<span className="material-symbols-outlined text-[32px]">payments</span>
</div>
<div className="px-sm py-xs bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">Active</div>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">GST Portal</h3>
<p className="font-label-sm text-label-sm text-on-surface-variant">Goods &amp; Services Tax Network</p>
</div>
</div>
<div className="mt-xl pt-md border-t border-outline-variant space-y-md">
<div className="flex justify-between items-center">
<span className="font-label-sm text-label-sm text-on-surface-variant">Last Synced</span>
<span className="font-data-mono text-data-mono text-primary">14 Min ago</span>
</div>
<button className="w-full py-md bg-secondary text-on-secondary rounded-lg font-label-sm text-label-sm active:scale-95 transition-transform flex items-center justify-center gap-xs">
<span className="material-symbols-outlined text-[18px]">sync</span>
                        Sync Now
                    </button>
</div>
</div>
{/*  MCA Card  */}
<div className="glass-panel p-md rounded-xl flex flex-col justify-between hover:shadow-lg transition-all group">
<div className="space-y-md">
<div className="flex justify-between items-start">
<div className="p-base bg-surface-container-highest rounded-lg text-secondary">
<span className="material-symbols-outlined text-[32px]">business</span>
</div>
<div className="px-sm py-xs bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">Active</div>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">MCA (V3)</h3>
<p className="font-label-sm text-label-sm text-on-surface-variant">Ministry of Corporate Affairs</p>
</div>
</div>
<div className="mt-xl pt-md border-t border-outline-variant space-y-md">
<div className="flex justify-between items-center">
<span className="font-label-sm text-label-sm text-on-surface-variant">Last Synced</span>
<span className="font-data-mono text-data-mono text-primary">2 Hours ago</span>
</div>
<button className="w-full py-md bg-secondary text-on-secondary rounded-lg font-label-sm text-label-sm active:scale-95 transition-transform flex items-center justify-center gap-xs">
<span className="material-symbols-outlined text-[18px]">sync</span>
                        Sync Now
                    </button>
</div>
</div>
{/*  Income Tax Card  */}
<div className="glass-panel p-md rounded-xl flex flex-col justify-between hover:shadow-lg transition-all group border-l-4 border-l-amber-400">
<div className="space-y-md">
<div className="flex justify-between items-start">
<div className="p-base bg-surface-container-highest rounded-lg text-secondary">
<span className="material-symbols-outlined text-[32px]">gavel</span>
</div>
<div className="px-sm py-xs bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">Maintenance</div>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">Income Tax</h3>
<p className="font-label-sm text-label-sm text-on-surface-variant">TRACES &amp; E-Filing Portal</p>
</div>
</div>
<div className="mt-xl pt-md border-t border-outline-variant space-y-md">
<div className="flex justify-between items-center">
<span className="font-label-sm text-label-sm text-on-surface-variant">Last Synced</span>
<span className="font-data-mono text-data-mono text-error">Sync Failed</span>
</div>
<button className="w-full py-md bg-outline text-on-primary rounded-lg font-label-sm text-label-sm cursor-not-allowed opacity-70 flex items-center justify-center gap-xs">
<span className="material-symbols-outlined text-[18px]">cloud_off</span>
                        Portal Down
                    </button>
</div>
</div>
{/*  EPFO/ESIC Card  */}
<div className="glass-panel p-md rounded-xl flex flex-col justify-between hover:shadow-lg transition-all group">
<div className="space-y-md">
<div className="flex justify-between items-start">
<div className="p-base bg-surface-container-highest rounded-lg text-secondary">
<span className="material-symbols-outlined text-[32px]">groups</span>
</div>
<div className="px-sm py-xs bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">Active</div>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">EPFO/ESIC</h3>
<p className="font-label-sm text-label-sm text-on-surface-variant">Payroll &amp; Social Security</p>
</div>
</div>
<div className="mt-xl pt-md border-t border-outline-variant space-y-md">
<div className="flex justify-between items-center">
<span className="font-label-sm text-label-sm text-on-surface-variant">Last Synced</span>
<span className="font-data-mono text-data-mono text-primary">45 Min ago</span>
</div>
<button className="w-full py-md bg-secondary text-on-secondary rounded-lg font-label-sm text-label-sm active:scale-95 transition-transform flex items-center justify-center gap-xs">
<span className="material-symbols-outlined text-[18px]">sync</span>
                        Sync Now
                    </button>
</div>
</div>
</div>
{/*  System Insights Section  */}
<section className="mt-lg grid grid-cols-1 lg:grid-cols-3 gap-lg">
{/*  Health Monitoring (Visualization)  */}
<div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col h-[400px]">
<div className="p-md border-b border-outline-variant flex justify-between items-center bg-white">
<h3 className="font-headline-md text-headline-md text-primary">Connection Health</h3>
<div className="flex gap-sm">
<button className="px-sm py-xs text-xs font-semibold bg-surface-container-high rounded text-primary">24H</button>
<button className="px-sm py-xs text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded">7D</button>
</div>
</div>
<div className="flex-1 relative flex items-center justify-center bg-slate-50 overflow-hidden">
{/*  Subtle pattern background  */}
<div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#031635 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
<div className="relative z-10 w-full px-lg">
{/*  Simulated Chart  */}
<div className="flex items-end justify-between h-48 gap-xs">
<div className="flex-1 bg-secondary opacity-20 rounded-t-sm h-[70%]" style={{ transition: 'height 1s ease-in-out' }}></div>
<div className="flex-1 bg-secondary opacity-30 rounded-t-sm h-[85%]"></div>
<div className="flex-1 bg-secondary opacity-40 rounded-t-sm h-[60%]"></div>
<div className="flex-1 bg-secondary opacity-50 rounded-t-sm h-[90%]"></div>
<div className="flex-1 bg-secondary opacity-60 rounded-t-sm h-[95%]"></div>
<div className="flex-1 bg-secondary opacity-70 rounded-t-sm h-[40%]"></div>
<div className="flex-1 bg-secondary opacity-80 rounded-t-sm h-[75%]"></div>
<div className="flex-1 bg-secondary opacity-90 rounded-t-sm h-[92%]"></div>
<div className="flex-1 bg-secondary rounded-t-sm h-[100%]"></div>
</div>
<div className="flex justify-between mt-sm font-label-sm text-label-sm text-on-surface-variant">
<span>08:00</span>
<span>12:00</span>
<span>16:00</span>
<span>20:00</span>
<span>00:00</span>
</div>
</div>
</div>
</div>
{/*  Recent Log Feed  */}
<div className="glass-panel rounded-2xl p-md flex flex-col h-[400px]">
<h3 className="font-headline-md text-headline-md text-primary mb-md">System Logs</h3>
<div className="flex-1 overflow-y-auto space-y-md pr-xs custom-scrollbar">
<div className="flex gap-md">
<div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
<div className="space-y-xs">
<p className="font-body-md text-body-md text-primary">GST Data Pull Successful</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">2,450 records processed for March '24</p>
<span className="font-data-mono text-[10px] text-outline">10:45:22 AM</span>
</div>
</div>
<div className="flex gap-md">
<div className="mt-1 w-2 h-2 rounded-full bg-error flex-shrink-0"></div>
<div className="space-y-xs">
<p className="font-body-md text-body-md text-primary">ITR Gateway Timeout</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Connection refused by remote host</p>
<span className="font-data-mono text-[10px] text-outline">09:32:01 AM</span>
</div>
</div>
<div className="flex gap-md">
<div className="mt-1 w-2 h-2 rounded-full bg-secondary flex-shrink-0"></div>
<div className="space-y-xs">
<p className="font-body-md text-body-md text-primary">MCA Auto-sync Triggered</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Scheduled task #7782 active</p>
<span className="font-data-mono text-[10px] text-outline">08:00:00 AM</span>
</div>
</div>
<div className="flex gap-md">
<div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
<div className="space-y-xs">
<p className="font-body-md text-body-md text-primary">ESIC Token Renewed</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">OAuth handshake completed successfully</p>
<span className="font-data-mono text-[10px] text-outline">Yesterday</span>
</div>
</div>
</div>
<button className="mt-md w-full py-sm border border-outline-variant text-on-surface-variant font-label-sm text-label-sm rounded-lg hover:bg-surface-container-high transition-colors">
                    View Full Audit Trail
                </button>
</div>
</section>
{/*  AI Assistant Docked Mini  */}
<div className="fixed bottom-lg right-lg z-50">
<div className="group relative">
<div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
<button className="relative flex items-center gap-md px-md py-sm bg-primary text-on-primary rounded-full shadow-xl" id="ai-trigger">
<span className="material-symbols-outlined">smart_toy</span>
<span className="font-label-sm text-label-sm pr-xs">Ask FinPilot</span>
</button>
{/*  Micro AI Panel (Hidden by default)  */}
<div className="hidden absolute bottom-16 right-0 w-[320px] glass-panel rounded-2xl shadow-2xl p-md ai-glow" id="ai-panel">
<div className="flex justify-between items-center mb-md">
<div className="flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
<h4 className="font-headline-md text-[16px] text-primary">FinPilot Insight</h4>
</div>
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary" onClick={() => {}}>close</button>
</div>
<div className="bg-surface-container p-sm rounded-lg mb-md">
<p className="font-body-md text-body-md text-on-surface">Income Tax portal is currently unstable. I recommend delaying GSTR-2A reconciliation until the gateway ping drops below 200ms.</p>
</div>
<div className="relative">
<input className="w-full bg-surface-container-highest border-none rounded-xl font-body-md text-body-md focus:ring-2 focus:ring-secondary pr-10" placeholder="Ask about sync errors..." type="text"/>
<span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant">send</span>
</div>
</div>
</div>
</div>
</main>
{/*  Bottom Nav Bar (Mobile Only)  */}
<footer className="fixed bottom-0 w-full z-50 flex justify-around items-center px-sm pb-2 pt-2 bg-surface-container-lowest shadow-lg md:hidden rounded-t-xl">
<div className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined">dashboard</span>
            Home
        </div>
<div className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined">group</span>
            Clients
        </div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 font-label-sm text-label-sm">
<span className="material-symbols-outlined">account_balance</span>
            Gov
        </div>
<div className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined">verified</span>
            TDS
        </div>
<div className="flex flex-col items-center justify-center text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined">grid_view</span>
            More
        </div>
</footer>


        </div>
    );
};

export default PortalIntegrationHubPage;
