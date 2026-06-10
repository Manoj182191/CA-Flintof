import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountingService, Ledger } from '../services/accountingService';

const LedgersPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [ledgerGroups, setLedgerGroups] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newLedger, setNewLedger] = useState({ name: '', group_id: 0, opening_balance: 0 });

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ledgersData, groupsData] = await Promise.all([
                accountingService.getLedgers(parseInt(activeCompanyId!)),
                accountingService.getLedgerGroups(parseInt(activeCompanyId!))
            ]);
            setLedgers(ledgersData);
            setLedgerGroups(groupsData);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLedger = async () => {
        if (!newLedger.name || !newLedger.group_id) return;
        try {
            await accountingService.createLedger({
                company_id: parseInt(activeCompanyId!),
                ...newLedger
            });
            setIsCreateModalOpen(false);
            setNewLedger({ name: '', group_id: 0, opening_balance: 0 });
            fetchData();
        } catch (err) {
            console.error('Failed to create ledger', err);
        }
    };

    const getGroupedLedgers = () => {
        const grouped = ledgerGroups.map(group => ({
            ...group,
            ledgers: ledgers.filter(l => l.group_id === group.id && l.name.toLowerCase().includes(searchQuery.toLowerCase()))
        }));
        return grouped.filter(g => g.ledgers.length > 0 || g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    return (
        <div className="stitch-app overflow-hidden">
            

<aside className="fixed h-full w-[280px] left-0 top-0 border-r border-outline-variant shadow-sm bg-surface flex flex-col h-screen py-md px-sm z-50">
<div className="px-md mb-xl">
<h1 className="font-display-lg text-display-lg text-primary">FinPilot</h1>
<p className="text-on-primary-container font-body-md">Enterprise OS v2.4.0</p>
</div>
<nav className="flex-1 space-y-1">

<a className="flex items-center gap-3 px-md py-sm transition-all duration-200 ease-in-out text-on-surface-variant hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-body-md">Dashboard</span>
</a>

<a className="flex items-center gap-3 px-md py-sm transition-all duration-200 ease-in-out bg-secondary-container text-on-secondary-container rounded-lg font-bold" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-body-md">Ledgers</span>
</a>

<a className="flex items-center gap-3 px-md py-sm transition-all duration-200 ease-in-out text-on-surface-variant hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span className="font-body-md">Vouchers</span>
</a>

<a className="flex items-center gap-3 px-md py-sm transition-all duration-200 ease-in-out text-on-surface-variant hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined">account_balance</span>
<span className="font-body-md">Taxes</span>
</a>

<a className="flex items-center gap-3 px-md py-sm transition-all duration-200 ease-in-out text-on-surface-variant hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-body-md">Settings</span>
</a>
</nav>
<div className="mt-auto p-md bg-surface-container-low rounded-xl flex items-center gap-3">
<img alt="User Profile" className="w-10 h-10 rounded-full object-cover" data-alt="A professional headshot of a corporate executive in a crisp navy blue suit, set against a blurred high-end office background. The lighting is soft and professional, emphasizing a modern business aesthetic. The image uses a clean, bright color palette consistent with a financial services application." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdiHNcouk8I5lfnNqIl6fN4uPxlFgvKnEzo-eic3MJjJkFWgh38F7E0zoeRN5aBzOqHKWNAwetWgYhO4xeZTn_8aPd71G3zsNJZR0jfAIio4Jk9hBlx6JUwjyqVP46HjvmeTArBuzQrOFSkTLUUS2qeimtZXTv0A-ajZSL1KlqogmfUxruufCztTtAGSWQWsmpJLZTRF_8y_LuHjc0PbBa3Ni7i17ke2F-y31cIpUaGCKbB-_QdWUrVYIPJmm18tttDiLPdE-CjN8"/>
<div>
<p className="font-bold text-on-surface">Alex Rivera</p>
<p className="text-xs text-on-surface-variant">Admin access</p>
</div>
</div>
</aside>

<main className="ml-[280px] h-screen flex flex-col bg-background">

<header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-lg py-sm">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-primary">search</span>
<h2 className="font-headline-md text-headline-md text-primary">Global Search</h2>
</div>
<div className="flex items-center gap-4">
<button className="flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full font-bold hover:bg-secondary/20 transition-colors">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
<span className="text-label-sm">AI Copilot</span>
</button>
</div>
</header>

<div className="px-xl py-lg flex items-center justify-between border-b border-outline-variant/20">
<div>
<h3 className="font-headline-lg text-headline-lg text-primary">Chart of Accounts</h3>
<p className="text-on-surface-variant">Hierarchical view of 42 active ledgers</p>
</div>
<div className="flex items-center gap-3">
<div className="relative">
<input 
    className="bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-secondary text-body-md" 
    placeholder="Filter accounts..." 
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
/>
<span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant">filter_list</span>
</div>
<button className="bg-primary text-on-primary px-lg py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all">
<span className="material-symbols-outlined">download</span>
                    Export
                </button>
</div>
</div>

<div className="flex-1 overflow-y-auto px-xl py-md">
<div className="max-w-container-max">

<div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-container-high rounded-t-xl text-on-surface-variant font-bold text-label-sm uppercase tracking-wider">
<div className="col-span-5">Account Name &amp; Code</div>
<div className="col-span-2 text-center">Type</div>
<div className="col-span-2 text-right">Balance</div>
<div className="col-span-2 text-center">AI Mapping</div>
<div className="col-span-1 text-right">Health</div>
</div>

<div className="divide-y divide-outline-variant/10 border-x border-b border-outline-variant/10 rounded-b-xl overflow-hidden bg-surface-container-lowest">
{isLoading ? (
    <div className="p-8 text-center text-on-surface-variant">Loading ledgers...</div>
) : getGroupedLedgers().length === 0 ? (
    <div className="p-8 text-center text-on-surface-variant">No ledgers found.</div>
) : (
    getGroupedLedgers().map(group => (
        <div key={group.id} className="group border-b border-outline-variant/30">
            <div className="grid grid-cols-12 gap-4 items-center px-4 py-4 hover:bg-surface-container-low cursor-pointer transition-colors">
                <div className="col-span-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">keyboard_arrow_down</span>
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
                    <span className="font-bold text-primary">{group.id}00 - {group.name}</span>
                </div>
                <div className="col-span-2 text-center text-label-sm text-on-surface-variant">{group.group_type}</div>
                <div className="col-span-2 text-right font-data-mono font-bold">
                    ${group.ledgers.reduce((sum: number, l: any) => sum + (l.current_balance || 0), 0).toFixed(2)}
                </div>
                <div className="col-span-2 flex justify-center"></div>
                <div className="col-span-1 flex justify-end"></div>
            </div>

            <div className="pl-12 bg-surface/30">
                {group.ledgers.map((ledger: any) => (
                    <div 
                        key={ledger.id} 
                        onClick={() => navigate(`/ledgers/${ledger.id}`)}
                        className="tree-item relative grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                        <div className="col-span-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-outline">account_balance</span>
                            <span className="font-medium">{group.id}0{ledger.id} - {ledger.name}</span>
                        </div>
                        <div className="col-span-2 text-center text-label-sm text-on-surface-variant">Ledger</div>
                        <div className="col-span-2 text-right font-data-mono">${(ledger.current_balance || 0).toFixed(2)}</div>
                        <div className="col-span-2 flex justify-center">
                            {ledger.is_system && (
                                <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-[10px] font-bold uppercase">System</span>
                            )}
                        </div>
                        <div className="col-span-1 flex justify-end">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ))
)}
</div>
</div>
</div>
</main>

<aside className="fixed right-0 top-0 bottom-0 w-[320px] glass-panel border-l z-40 hidden xl:flex flex-col p-lg">
<div className="mb-lg">
<h4 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">analytics</span>
                Ledger Health
            </h4>
<p className="text-on-surface-variant text-body-md mt-1">Real-time mapping audit</p>
</div>

<div className="space-y-4">
<div className="p-md rounded-xl bg-surface-container-high/50 border border-outline-variant/30">
<div className="flex justify-between items-end mb-2">
<span className="text-label-sm font-bold text-on-surface-variant uppercase">Accuracy</span>
<span className="text-headline-md font-bold text-primary">98.4%</span>
</div>
<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 rounded-full" style={{ width: "98.4%" }}></div>
</div>
</div>
<div className="p-md rounded-xl bg-surface-container-high/50 border border-outline-variant/30">
<div className="flex justify-between items-end mb-2">
<span className="text-label-sm font-bold text-on-surface-variant uppercase">AI Coverage</span>
<span className="text-headline-md font-bold text-primary">76%</span>
</div>
<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{ width: "76%" }}></div>
</div>
</div>
</div>

<div className="mt-lg flex-1">
<h5 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-4">Critical Alerts</h5>
<div className="space-y-3">
<div className="p-sm rounded-lg bg-error-container/20 border border-error/10 flex gap-3 items-start">
<span className="material-symbols-outlined text-error mt-0.5">warning</span>
<div>
<p className="font-bold text-xs text-on-error-container">Mismatch in 3010 - Capital</p>
<p className="text-[11px] text-on-error-container/70">Historical mapping conflicts with recent equity injections.</p>
<button className="mt-2 text-[11px] font-bold text-error underline">Resolve Now</button>
</div>
</div>
<div className="p-sm rounded-lg bg-secondary-container/10 border border-secondary/10 flex gap-3 items-start">
<span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
<div>
<p className="font-bold text-xs text-on-surface">Optimize 1020 - AR</p>
<p className="text-[11px] text-on-surface-variant">AI suggests creating 3 sub-accounts for aging categories.</p>
<button className="mt-2 text-[11px] font-bold text-secondary underline">View Suggestion</button>
</div>
</div>
</div>
</div>
<button className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-secondary/20 transition-all">
<span className="material-symbols-outlined">psychology</span>
            Run Full Audit
        </button>
</aside>

<button 
    onClick={() => setIsCreateModalOpen(true)}
    className="fixed bottom-lg right-lg xl:right-[340px] w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center group hover:w-48 transition-all duration-300 overflow-hidden z-50">
<span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform duration-300">add</span>
<span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold ml-2">Add New Ledger</span>
</button>

{isCreateModalOpen && (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-headline-lg text-primary mb-4">Create Ledger</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant mb-1">Ledger Name</label>
                    <input 
                        type="text" 
                        value={newLedger.name}
                        onChange={e => setNewLedger({...newLedger, name: e.target.value})}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2"
                        placeholder="e.g. Bank of America"
                    />
                </div>
                <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant mb-1">Account Group</label>
                    <select 
                        value={newLedger.group_id}
                        onChange={e => setNewLedger({...newLedger, group_id: parseInt(e.target.value)})}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2"
                    >
                        <option value={0}>Select Group...</option>
                        {ledgerGroups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant mb-1">Opening Balance</label>
                    <input 
                        type="number" 
                        value={newLedger.opening_balance}
                        onChange={e => setNewLedger({...newLedger, opening_balance: parseFloat(e.target.value)})}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2"
                        placeholder="0.00"
                    />
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-lg transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={handleCreateLedger}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold shadow-sm active:scale-95 transition-all">
                    Create Ledger
                </button>
            </div>
        </div>
    </div>
)}

<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pb-safe pt-2 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 shadow-lg z-50">
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1">
<span className="material-symbols-outlined">list_alt</span>
<span className="font-label-sm text-label-sm">Ledger</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">add_box</span>
<span className="font-label-sm text-label-sm">Entry</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">insights</span>
<span className="font-label-sm text-label-sm">AI</span>
</div>
</nav>


        </div>
    );
};

export default LedgersPage;
