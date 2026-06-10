import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const IntegrationCenterPage: React.FC = () => {
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
            
{/*  TopAppBar  */}
<header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm docked full-width top-0 sticky flex justify-between items-center w-full px-gutter h-16 z-50">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-200">menu</span>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
</div>
<div className="flex items-center gap-lg">
<nav className="hidden md:flex gap-md items-center">
<span className="text-primary font-bold text-body-md cursor-pointer hover:bg-surface-container-high/50 transition-colors px-3 py-1 rounded-lg">Integrations</span>
<span className="text-on-surface-variant text-body-md cursor-pointer hover:bg-surface-container-high/50 transition-colors px-3 py-1 rounded-lg">Monitoring</span>
<span className="text-on-surface-variant text-body-md cursor-pointer hover:bg-surface-container-high/50 transition-colors px-3 py-1 rounded-lg">Logs</span>
</nav>
<div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/50 cursor-pointer active:scale-95 duration-200">
<img alt="User Avatar" className="w-full h-full object-cover" data-alt="A professional 3D avatar of a South Asian male in a business suit, appearing friendly and authoritative. The style is modern minimalist with soft studio lighting and a clean, high-contrast background that matches a premium financial dashboard aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzvcBMhsMtOzKW5QOj8vGvo-tJ5-2r7OfnaE8yFa_C2kL3Ou669QHSaraJ7wVB6FXF4H2UR9QIlB55onsLLoMso5IYSyid-QdtWpMgGuR_qNNrL52GnzynGXoAFN174E-MgWP8CViC30-lSn3L3K3oXswCadjxS-fiS-MMANIiSODjkCoHboN4Vmd3I1YEEx0fV3FjP6RYQOWJvV_dk7bN1P5hdWU2hnpgNpOJzvgQBNLYdvFl4DYFwbjzlONIBQ37rXuyg6JCZe0"/>
</div>
</div>
</header>
<main className="flex-1 flex max-w-container-max mx-auto w-full">
{/*  NavigationDrawer  */}
<aside className="hidden lg:flex flex-col h-full w-[280px] p-md bg-surface-container-lowest border-r border-outline-variant/20 sticky top-16 h-[calc(100vh-64px)]">
<div className="mb-lg p-md">
<div className="flex items-center gap-md mb-base">
<img alt="Organization Logo" className="w-10 h-10 rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYbblL8O8M5xyBaZXVDgxo_7HvPJALhAME2YYSlaRfJ91fquHSk_-f6vZm982tE2C7B-_TywBeutJyFVx22xlTbsjb0YP443rFfihsUkkeWClrX2s0pL39qIXTiVvYkpNemXE7V_5Lvrv3c0peurAVxhLUxt33bcC5P41yHtsQG9vU7YGoGJwBExWUAPOtrKzUxVPMWOT_NuqVAk4ClS5Xd158D_Qf8bLswW5l6J8C1phYJiKDWKZsxZQCYn9Tz-3VLZxUyLU_vTU"/>
<div>
<p className="font-headline-md text-body-md font-bold text-primary">CA Vikram Mehta</p>
<p className="text-label-sm text-on-surface-variant">Senior Partner</p>
</div>
</div>
</div>
<nav className="space-y-1">
<div className="flex items-center gap-md px-md py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all">
<span className="material-symbols-outlined">fact_check</span>
<span className="font-body-md">Audit</span>
</div>
<div className="flex items-center gap-md px-md py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all">
<span className="material-symbols-outlined">payments</span>
<span className="font-body-md">TDS</span>
</div>
<div className="flex items-center gap-md px-md py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all">
<span className="material-symbols-outlined">receipt_long</span>
<span className="font-body-md">GST</span>
</div>
<div className="flex items-center gap-md px-md py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all">
<span className="material-symbols-outlined">business</span>
<span className="font-body-md">ROC</span>
</div>
<div className="h-px bg-outline-variant/20 my-md"></div>
<div className="flex items-center gap-md px-md py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold cursor-pointer transition-all">
<span className="material-symbols-outlined">settings_input_component</span>
<span className="font-body-md">Integrations</span>
</div>
</nav>
<div className="mt-auto p-md bg-surface-container-low rounded-xl border border-outline-variant/10">
<p className="text-label-sm text-on-surface-variant font-bold mb-xs">SYSTEM STATUS</p>
<div className="flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
<p className="text-label-sm text-on-surface">All Systems Operational</p>
</div>
</div>
</aside>
{/*  Main Content Area  */}
<section className="flex-1 p-lg overflow-y-auto">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary">Integration Center</h2>
<p className="text-body-lg text-on-surface-variant mt-xs">Manage and monitor core backend service connections.</p>
</div>
<button className="ai-insight-button px-6 py-2.5 rounded-full font-bold text-primary text-body-md flex items-center gap-2 transition-transform active:scale-95 shadow-sm">
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>bolt</span>
                    AI Connectivity Audit
                </button>
</div>
{/*  Dashboard Stats  */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
<div className="glass-card p-lg rounded-xl">
<p className="text-label-sm text-on-surface-variant mb-xs">Active Integrations</p>
<p className="font-headline-md text-headline-md text-primary font-data-mono">6 / 8</p>
</div>
<div className="glass-card p-lg rounded-xl border-l-4 border-l-emerald-500">
<p className="text-label-sm text-on-surface-variant mb-xs">Healthy Nodes</p>
<p className="font-headline-md text-headline-md text-emerald-600 font-data-mono">100%</p>
</div>
<div className="glass-card p-lg rounded-xl">
<p className="text-label-sm text-on-surface-variant mb-xs">Avg. Latency</p>
<p className="font-headline-md text-headline-md text-primary font-data-mono">142ms</p>
</div>
<div className="glass-card p-lg rounded-xl">
<p className="text-label-sm text-on-surface-variant mb-xs">Daily Requests</p>
<p className="font-headline-md text-headline-md text-primary font-data-mono">24.8k</p>
</div>
</div>
{/*  Integration Grid (Bento Style)  */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
{/*  OpenAI Card  */}
<div className="glass-card p-lg rounded-xl ai-glow group hover:-translate-y-1 transition-all duration-300">
<div className="flex justify-between items-start mb-lg">
<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>neurology</span>
</div>
<span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-label-sm font-bold">Connected</span>
</div>
<h3 className="font-headline-md text-body-lg text-primary mb-xs">OpenAI</h3>
<p className="text-body-md text-on-surface-variant mb-lg">LLM processing for tax advisory and document summarization.</p>
<div className="space-y-3 pt-md border-t border-outline-variant/20">
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Last Sync</span>
<span className="text-label-sm font-data-mono text-on-surface">2 mins ago</span>
</div>
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Health Status</span>
<span className="text-label-sm font-bold text-emerald-600">Stable</span>
</div>
</div>
<button className="w-full mt-lg py-2 rounded-lg border border-outline-variant/50 text-label-sm font-bold text-on-surface group-hover:bg-primary group-hover:text-white transition-colors">Configure API</button>
</div>
{/*  AWS Textract Card  */}
<div className="glass-card p-lg rounded-xl group hover:-translate-y-1 transition-all duration-300">
<div className="flex justify-between items-start mb-lg">
<div className="w-12 h-12 bg-[#FF9900] rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>scan</span>
</div>
<span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-label-sm font-bold">Connected</span>
</div>
<h3 className="font-headline-md text-body-lg text-primary mb-xs">AWS Textract</h3>
<p className="text-body-md text-on-surface-variant mb-lg">Optical Character Recognition for financial balance sheets.</p>
<div className="space-y-3 pt-md border-t border-outline-variant/20">
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Last Sync</span>
<span className="text-label-sm font-data-mono text-on-surface">15 mins ago</span>
</div>
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Health Status</span>
<span className="text-label-sm font-bold text-amber-500">Degraded</span>
</div>
</div>
<button className="w-full mt-lg py-2 rounded-lg border border-outline-variant/50 text-label-sm font-bold text-on-surface group-hover:bg-primary group-hover:text-white transition-colors">View Errors</button>
</div>
{/*  GST API Card  */}
<div className="glass-card p-lg rounded-xl group hover:-translate-y-1 transition-all duration-300">
<div className="flex justify-between items-start mb-lg">
<div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>receipt</span>
</div>
<span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-label-sm font-bold">Connected</span>
</div>
<h3 className="font-headline-md text-body-lg text-primary mb-xs">GST API</h3>
<p className="text-body-md text-on-surface-variant mb-lg">Real-time GSTIN verification and GSTR filing gateway.</p>
<div className="space-y-3 pt-md border-t border-outline-variant/20">
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Last Sync</span>
<span className="text-label-sm font-data-mono text-on-surface">Just Now</span>
</div>
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Health Status</span>
<span className="text-label-sm font-bold text-emerald-600">Stable</span>
</div>
</div>
<button className="w-full mt-lg py-2 rounded-lg border border-outline-variant/50 text-label-sm font-bold text-on-surface group-hover:bg-primary group-hover:text-white transition-colors">Endpoint Map</button>
</div>
{/*  Income Tax API Card  */}
<div className="glass-card p-lg rounded-xl group hover:-translate-y-1 transition-all duration-300">
<div className="flex justify-between items-start mb-lg">
<div className="w-12 h-12 bg-on-tertiary-fixed-variant rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>account_balance</span>
</div>
<span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-label-sm font-bold">Not Connected</span>
</div>
<h3 className="font-headline-md text-body-lg text-primary mb-xs">Income Tax API</h3>
<p className="text-body-md text-on-surface-variant mb-lg">ITR filing synchronization and PAN validation services.</p>
<div className="space-y-3 pt-md border-t border-outline-variant/20">
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Last Sync</span>
<span className="text-label-sm font-data-mono text-on-surface">--</span>
</div>
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Health Status</span>
<span className="text-label-sm font-bold text-on-surface-variant">Offline</span>
</div>
</div>
<button className="w-full mt-lg py-2 rounded-lg bg-primary text-white text-label-sm font-bold shadow-sm active:scale-95 transition-all">Setup Connection</button>
</div>
{/*  MCA API Card  */}
<div className="glass-card p-lg rounded-xl group hover:-translate-y-1 transition-all duration-300">
<div className="flex justify-between items-start mb-lg">
<div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>corporate_fare</span>
</div>
<span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-label-sm font-bold">Connected</span>
</div>
<h3 className="font-headline-md text-body-lg text-primary mb-xs">MCA API</h3>
<p className="text-body-md text-on-surface-variant mb-lg">V3 Portal integration for company data and compliance checks.</p>
<div className="space-y-3 pt-md border-t border-outline-variant/20">
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Last Sync</span>
<span className="text-label-sm font-data-mono text-on-surface">45 mins ago</span>
</div>
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Health Status</span>
<span className="text-label-sm font-bold text-emerald-600">Stable</span>
</div>
</div>
<button className="w-full mt-lg py-2 rounded-lg border border-outline-variant/50 text-label-sm font-bold text-on-surface group-hover:bg-primary group-hover:text-white transition-colors">Auth Settings</button>
</div>
{/*  WhatsApp API Card  */}
<div className="glass-card p-lg rounded-xl group hover:-translate-y-1 transition-all duration-300">
<div className="flex justify-between items-start mb-lg">
<div className="w-12 h-12 bg-[#25D366] rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>chat</span>
</div>
<span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-label-sm font-bold">Connected</span>
</div>
<h3 className="font-headline-md text-body-lg text-primary mb-xs">WhatsApp API</h3>
<p className="text-body-md text-on-surface-variant mb-lg">Automated client notifications and document collection bots.</p>
<div className="space-y-3 pt-md border-t border-outline-variant/20">
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Last Sync</span>
<span className="text-label-sm font-data-mono text-on-surface">5 mins ago</span>
</div>
<div className="flex justify-between">
<span className="text-label-sm text-on-surface-variant">Health Status</span>
<span className="text-label-sm font-bold text-emerald-600">Stable</span>
</div>
</div>
<button className="w-full mt-lg py-2 rounded-lg border border-outline-variant/50 text-label-sm font-bold text-on-surface group-hover:bg-primary group-hover:text-white transition-colors">Webhooks</button>
</div>
</div>
{/*  High-end Data Grid Section  */}
<div className="mt-xl">
<div className="flex items-center justify-between mb-lg">
<h3 className="font-headline-md text-body-lg font-bold text-primary">Global Error Logs</h3>
<div className="flex gap-sm">
<button className="px-4 py-2 bg-surface-container rounded-lg text-label-sm font-bold text-primary">Export CSV</button>
<button className="px-4 py-2 bg-primary text-white rounded-lg text-label-sm font-bold">Filter Critical</button>
</div>
</div>
<div className="glass-card rounded-xl overflow-hidden">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-high/50 sticky top-0">
<tr>
<th className="px-lg py-md text-label-sm font-bold text-on-surface-variant">SERVICE</th>
<th className="px-lg py-md text-label-sm font-bold text-on-surface-variant">EVENT</th>
<th className="px-lg py-md text-label-sm font-bold text-on-surface-variant">STATUS CODE</th>
<th className="px-lg py-md text-label-sm font-bold text-on-surface-variant">TIMESTAMP</th>
<th className="px-lg py-md text-label-sm font-bold text-on-surface-variant text-right">ACTION</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-lg py-md">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-amber-500"></div>
<span className="font-body-md font-medium text-primary">AWS Textract</span>
</div>
</td>
<td className="px-lg py-md text-body-md text-on-surface-variant">Rate limit exceeded (Quota)</td>
<td className="px-lg py-md font-data-mono text-body-md">429</td>
<td className="px-lg py-md font-data-mono text-label-sm text-on-surface-variant">2023-10-27 14:22:15</td>
<td className="px-lg py-md text-right">
<button className="text-secondary text-label-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Retry</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-lg py-md">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-emerald-500"></div>
<span className="font-body-md font-medium text-primary">GST API</span>
</div>
</td>
<td className="px-lg py-md text-body-md text-on-surface-variant">Successful Data Sync</td>
<td className="px-lg py-md font-data-mono text-body-md">200</td>
<td className="px-lg py-md font-data-mono text-label-sm text-on-surface-variant">2023-10-27 14:18:02</td>
<td className="px-lg py-md text-right">
<button className="text-secondary text-label-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Inspect</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-lg py-md">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-emerald-500"></div>
<span className="font-body-md font-medium text-primary">OpenAI</span>
</div>
</td>
<td className="px-lg py-md text-body-md text-on-surface-variant">Context tokens optimized</td>
<td className="px-lg py-md font-data-mono text-body-md">200</td>
<td className="px-lg py-md font-data-mono text-label-sm text-on-surface-variant">2023-10-27 14:15:59</td>
<td className="px-lg py-md text-right">
<button className="text-secondary text-label-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Inspect</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>
{/*  Contextual AI Panel  */}
<aside className="hidden xl:flex flex-col w-[320px] border-l border-outline-variant/20 p-lg bg-surface/50 backdrop-blur-md sticky top-16 h-[calc(100vh-64px)]">
<div className="flex items-center gap-sm mb-lg">
<span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
<h4 className="font-headline-md text-body-lg font-bold text-primary">AI Insights</h4>
</div>
<div className="space-y-lg">
<div className="p-md bg-secondary-container/10 rounded-xl border border-secondary-container/20">
<p className="text-body-md text-primary font-medium mb-xs">Optimization Tip</p>
<p className="text-body-md text-on-surface-variant leading-relaxed">AWS Textract usage is peaking between 10 AM and 2 PM. Consider implementing request queuing to avoid Tier 1 rate limits.</p>
</div>
<div className="p-md bg-surface-container-high rounded-xl border border-outline-variant/10">
<p className="text-body-md text-primary font-medium mb-xs">Security Alert</p>
<p className="text-body-md text-on-surface-variant leading-relaxed">GST API key is set to expire in 4 days. Please rotate credentials in the secrets manager.</p>
<button className="mt-md text-secondary text-label-sm font-bold underline">Go to Secrets</button>
</div>
<div className="mt-auto">
<div className="h-48 relative rounded-xl overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A high-tech digital control room background with glowing blue data lines and futuristic interface elements, reflecting a sense of precision, performance monitoring, and advanced security in a financial environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7Dqvdqee2H7t8EymqJT7ekZ2Jwh_Z2Ahak_YJJCUuDUiteRN7kSDomoYAIfNzZFfysTpnz6Aa67g9bvLKKjS7iJZReHqgSAWDF1j2SjmD0gGN-B76mGedecwFJNKb6GhIhL5k_vc9tim4pl6wyBpXYolqfyTYhjeTuen7EVLykTdJIB2oJImoMfnzH-_4v_LtlZGnULY4KSSAzjwu54J1y5_AjZvbMVjey57ujobVopN-VGydJUS80mv4xXDpY0u6whQEbcatLQ8"/>
<div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-md">
<p className="text-white text-label-sm font-medium">Network performance is 12% higher than last week's average.</p>
</div>
</div>
</div>
</div>
</aside>
</main>
{/*  BottomNavBar (Mobile only)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface shadow-lg border-t border-outline-variant/20 z-50">
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">home</span>
<span className="text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1">
<span className="material-symbols-outlined">settings_input_component</span>
<span className="text-label-sm">Integrations</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">verified_user</span>
<span className="text-label-sm">Compliance</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">more_horiz</span>
<span className="text-label-sm">More</span>
</div>
</nav>


        </div>
    );
};

export default IntegrationCenterPage;
