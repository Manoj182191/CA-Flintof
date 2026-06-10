import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountingService, Ledger, VoucherCreate, VoucherTransaction } from '../services/accountingService';

const SmartVoucherPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Voucher Type State
    const [voucherType, setVoucherType] = useState<'PAYMENT' | 'RECEIPT' | 'CONTRA'>('PAYMENT');
    
    const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [narration, setNarration] = useState('');
    
    const [accountLedgerId, setAccountLedgerId] = useState<number>(0);
    const [transactions, setTransactions] = useState<VoucherTransaction[]>([
        { ledger_id: 0, debit: 0, credit: 0 }
    ]);

    useEffect(() => {
        if (activeCompanyId) {
            fetchLedgers();
        }
    }, [activeCompanyId]);

    const fetchLedgers = async () => {
        try {
            const data = await accountingService.getLedgers(parseInt(activeCompanyId!));
            setLedgers(data);
        } catch (error) {
            console.error('Failed to fetch ledgers', error);
        }
    };

    const handleAddRow = () => {
        setTransactions([...transactions, { ledger_id: 0, debit: 0, credit: 0 }]);
    };

    const handleTransactionChange = (index: number, field: keyof VoucherTransaction, value: number) => {
        const updated = [...transactions];
        updated[index] = { ...updated[index], [field]: value };
        setTransactions(updated);
    };

    const handleRemoveRow = (index: number) => {
        const updated = transactions.filter((_, i) => i !== index);
        setTransactions(updated);
    };

    const totalAmount = transactions.reduce((sum, t) => sum + (t.debit || t.credit || 0), 0);

    const handleSubmit = async () => {
        if (!activeCompanyId) return;
        if (accountLedgerId === 0) {
            alert('Please select an Account/Bank ledger.');
            return;
        }
        if (transactions.some(t => t.ledger_id === 0)) {
            alert('Please select a ledger for all rows.');
            return;
        }

        setIsLoading(true);
        try {
            // Reconstruct transactions for double-entry
            // E.g., for PAYMENT: Account is Credited, Items are Debited
            const submitTransactions: VoucherTransaction[] = [];
            
            submitTransactions.push({
                ledger_id: accountLedgerId,
                debit: voucherType === 'RECEIPT' ? totalAmount : 0,
                credit: voucherType === 'RECEIPT' ? 0 : totalAmount
            });
            
            transactions.forEach(t => {
                submitTransactions.push({
                    ledger_id: t.ledger_id,
                    debit: voucherType === 'RECEIPT' ? 0 : (t.debit || t.credit || 0),
                    credit: voucherType === 'RECEIPT' ? (t.debit || t.credit || 0) : 0
                });
            });

            const voucher: VoucherCreate = {
                company_id: parseInt(activeCompanyId!),
                voucher_type: voucherType,
                voucher_date: voucherDate,
                description,
                narration,
                transactions: submitTransactions
            };
            
            await accountingService.createVoucher(voucher);
            alert(`${voucherType} voucher posted successfully`);
            setTransactions([
                { ledger_id: 0, debit: 0, credit: 0 }
            ]);
            setDescription('');
            setNarration('');
        } catch (error) {
            console.error('Failed to create voucher', error);
            alert('Failed to post voucher');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            

<aside className="hidden md:flex fixed h-full w-[280px] left-0 top-0 border-r border-outline-variant bg-surface flex-col py-md px-sm z-50">
<div className="mb-xl px-md">
<h1 className="font-display-lg text-display-lg text-primary tracking-tight">FinPilot Pro</h1>
<p className="text-on-surface-variant font-label-sm opacity-70">Enterprise OS v2.4.0</p>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                Dashboard
            </a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
                Ledgers
            </a>
<a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
                Vouchers
            </a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="account_balance">account_balance</span>
                Taxes
            </a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
                Settings
            </a>
</nav>
<div className="mt-auto p-md border-t border-outline-variant">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
                    JD
                </div>
<div>
<p className="font-bold text-on-surface">John Doe</p>
<p className="text-xs text-on-surface-variant">Admin Access</p>
</div>
</div>
</div>
</aside>

<header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-lg py-sm md:pl-[300px]">
<div className="flex items-center gap-md">
<button className="md:hidden material-symbols-outlined text-primary">menu</button>
<h2 className="font-headline-md text-headline-md text-primary">Smart Entry</h2>
</div>
<div className="flex items-center gap-md">
<button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-secondary" data-icon="search">search</button>
<button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-secondary" data-icon="smart_toy">smart_toy</button>
</div>
</header>

<main className="flex-1 w-full max-w-container-max mx-auto px-md py-md md:pl-[300px] mb-20 md:mb-0">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

<div className="lg:col-span-8 space-y-lg">

<section className="glass rounded-xl p-lg ai-glow overflow-hidden relative">
<div className="flex items-center justify-between mb-md">
<div className="flex items-center gap-sm">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<span className="font-label-sm uppercase tracking-wider text-secondary">Voice Accounting Active</span>
</div>
<button className="text-primary hover:opacity-70 transition-opacity">
<span className="material-symbols-outlined">close</span>
</button>
</div>
<div className="flex items-end justify-center gap-1 h-12 mb-md" id="waveform">

</div>
<div className="text-center">
<p className="text-on-surface italic opacity-80">"Purchased 50 laptops from Dell for $25,000 including 18% GST..."</p>
<div className="mt-sm flex justify-center gap-xs">
<span className="px-xs py-0.5 bg-surface-container-high text-[10px] rounded border border-outline-variant">Purchased (Detected)</span>
<span className="px-xs py-0.5 bg-surface-container-high text-[10px] rounded border border-outline-variant">Dell (Vendor)</span>
<span className="px-xs py-0.5 bg-surface-container-high text-[10px] rounded border border-outline-variant">$25,000 (Amount)</span>
</div>
</div>
</section>

<section className="glass rounded-xl p-lg space-y-md">
<div className="flex items-center justify-between">
<h3 className="font-headline-md text-headline-md text-primary">Transaction Details</h3>
<div className="flex p-0.5 bg-surface-container-low rounded-lg">
<button 
    onClick={() => setVoucherType('PAYMENT')} 
    className={`px-md py-1 text-xs ${voucherType === 'PAYMENT' ? 'font-bold bg-white shadow-sm rounded-md' : 'text-on-surface-variant'}`}>Payment</button>
<button 
    onClick={() => setVoucherType('RECEIPT')} 
    className={`px-md py-1 text-xs ${voucherType === 'RECEIPT' ? 'font-bold bg-white shadow-sm rounded-md' : 'text-on-surface-variant'}`}>Receipt</button>
<button 
    onClick={() => setVoucherType('CONTRA')} 
    className={`px-md py-1 text-xs ${voucherType === 'CONTRA' ? 'font-bold bg-white shadow-sm rounded-md' : 'text-on-surface-variant'}`}>Contra</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-md">
<div className="space-y-xs">
<label className="font-label-sm text-on-surface-variant ml-1">Account (Bank/Cash)</label>
<div className="relative group">
<select 
    value={accountLedgerId}
    onChange={e => setAccountLedgerId(parseInt(e.target.value))}
    className="w-full bg-surface-container-low border-none rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary transition-all outline-none"
>
    <option value={0}>Select Account...</option>
    {ledgers.map(l => (
        <option key={l.id} value={l.id}>{l.name}</option>
    ))}
</select>
<span className="absolute right-3 top-2.5 material-symbols-outlined text-secondary text-sm">verified</span>
<div className="mt-xs flex gap-xs">
<span className="text-[10px] text-secondary bg-secondary-container/10 px-1.5 rounded cursor-pointer">AI Suggest: HP Tech</span>
<span className="text-[10px] text-secondary bg-secondary-container/10 px-1.5 rounded cursor-pointer">Last: Microsoft</span>
</div>
</div>
</div>
<div className="space-y-xs">
<label className="font-label-sm text-on-surface-variant ml-1">Voucher Date</label>
<input 
    type="date" 
    value={voucherDate}
    onChange={e => setVoucherDate(e.target.value)}
    className="w-full bg-surface-container-low border-none rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none" 
/>
</div>
<div className="space-y-xs md:col-span-2">
<label className="font-label-sm text-on-surface-variant ml-1">Description</label>
<input 
    type="text" 
    placeholder="Transaction Description"
    value={description}
    onChange={e => setDescription(e.target.value)}
    className="w-full bg-surface-container-low border-none rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none" 
/>
</div>
</div>
<div className="overflow-x-auto hide-scrollbar -mx-lg px-lg">
<table className="w-full min-w-[600px]">
<thead>
<tr className="text-left border-b border-outline-variant/30 text-on-surface-variant font-label-sm">
<th className="py-sm px-2">Item Description</th>
<th className="py-sm px-2">Qty</th>
<th className="py-sm px-2">Rate</th>
<th className="py-sm px-2">GST%</th>
<th className="py-sm px-2 text-right">Amount</th>
<th className="py-sm px-2"></th>
</tr>
</thead>
<tbody>
{transactions.map((t, index) => (
<tr key={index} className="group border-b border-outline-variant/10 hover:bg-surface-container-low/50">
<td className="py-md px-2">
    <select 
        value={t.ledger_id}
        onChange={e => handleTransactionChange(index, 'ledger_id', parseInt(e.target.value))}
        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium"
    >
        <option value={0}>Select Ledger...</option>
        {ledgers.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
        ))}
    </select>
</td>
<td className="py-md px-2">
    <input disabled className="w-16 bg-transparent border-none p-0 focus:ring-0 text-sm opacity-50" type="number" placeholder="1"/>
</td>
<td className="py-md px-2">
    <input disabled className="w-24 bg-transparent border-none p-0 focus:ring-0 text-sm font-data-mono opacity-50" type="number" placeholder="0"/>
</td>
<td className="py-md px-2">
    <select disabled className="bg-transparent border-none p-0 focus:ring-0 text-sm opacity-50">
        <option>0%</option>
    </select>
</td>
<td className="py-md px-2">
    <input 
        type="number" 
        value={t.debit || t.credit || ''}
        onChange={e => {
            const val = parseFloat(e.target.value) || 0;
            // Since it's smart entry, we just capture the amount. 
            // The mapping (debit/credit) is handled in handleSubmit based on VoucherType
            handleTransactionChange(index, 'debit', val);
        }}
        className="w-full text-right bg-transparent border-none p-0 focus:ring-0 text-sm font-data-mono" 
        placeholder="0.00"
    />
</td>
<td className="py-md px-2 text-right">
    <span onClick={() => handleRemoveRow(index)} className="material-symbols-outlined text-error opacity-0 group-hover:opacity-100 cursor-pointer">delete</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
<button onClick={handleAddRow} className="w-full py-sm border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center justify-center gap-sm">
<span className="material-symbols-outlined">add</span> Add New Row
                    </button>
</section>
</div>

<div className="lg:col-span-4 space-y-lg">

<section className="glass rounded-xl p-lg space-y-md">
<h4 className="font-headline-md text-[18px] text-primary flex items-center gap-sm">
<span className="material-symbols-outlined text-secondary">account_balance</span>
                        GST Impact
                    </h4>
<div className="space-y-sm">
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">Taxable Value</span>
<span className="font-data-mono">$ 22,500.00</span>
</div>
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">CGST (9%)</span>
<span className="font-data-mono">$ 2,025.00</span>
</div>
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">SGST (9%)</span>
<span className="font-data-mono">$ 2,025.00</span>
</div>
<div className="pt-sm border-t border-outline-variant flex justify-between items-center">
<span className="font-bold">Grand Total</span>
<span className="font-data-mono font-bold text-lg text-secondary">₹ {totalAmount.toFixed(2)}</span>
</div>
</div>

<div className="p-sm bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-sm">
<span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
<div>
<p className="text-[12px] font-bold text-emerald-800">ITC Eligible</p>
<p className="text-[10px] text-emerald-700 leading-tight">This purchase increases your Input Tax Credit by $4,050. GSTR-2B reconciled.</p>
</div>
</div>
</section>

<section className="glass rounded-xl p-lg space-y-md overflow-hidden relative">
<div className="absolute -right-4 -top-4 opacity-10">
<span className="material-symbols-outlined text-[100px] text-secondary">smart_toy</span>
</div>
<h4 className="font-headline-md text-[18px] text-primary">AI Insight</h4>
<p className="text-sm text-on-surface-variant leading-relaxed">This vendor is usually paid within 15 days. Auto-set payment reminder for <strong>Dec 09, 2023</strong>?</p>
<div className="flex gap-sm">
<button className="flex-1 py-1.5 bg-secondary text-white rounded-lg font-bold text-xs">Confirm</button>
<button className="flex-1 py-1.5 border border-outline-variant text-on-surface-variant rounded-lg text-xs">Dismiss</button>
</div>
<div className="pt-md border-t border-outline-variant">
<div className="flex items-center justify-between mb-sm">
<span className="font-label-sm text-on-surface-variant">Scan Attachment</span>
<span className="material-symbols-outlined text-secondary cursor-pointer">upload_file</span>
</div>
<div className="aspect-video bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant group cursor-pointer overflow-hidden">
<img alt="Invoice Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="A professional high-resolution close-up of a business invoice document resting on a clean minimalist workstation. The lighting is bright and modern, emphasizing the paper texture and printed financial figures. The overall aesthetic is clean, corporate, and precise, utilizing soft shadows and a neutral color palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcMMyg0mOfrZrB2tqF74WY10qmr-Bpt4bnl0SP9TWGdc_sbzQHn_AR2Naa3P80uZOu-zWlD26v1ej62_Ts4XZYl2bBn5H0vsqqC12AH0FfxZ0YW2_A05qaZ9VMhdYa6T5XyTjBAsjnWVsCAE7l_PM3YEUSuixZ82dLe8VzKd7IFvuNYsSe95S6A-WZc9iG--hacTjCJpdjE1aPfeIZQG-irFnU0RN5EL_K5UGu0JJ49yT9tr9DfxedUTYW5U8aOSrDIs9wEak4XfQ"/>
<div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
<span className="material-symbols-outlined text-white">zoom_in</span>
</div>
</div>
</div>
</section>

<div className="fixed bottom-0 left-0 w-full md:relative bg-surface md:bg-transparent p-md md:p-0 border-t md:border-none flex gap-md z-50">
<button 
    onClick={handleSubmit}
    disabled={isLoading}
    className="flex-1 py-md bg-secondary text-white rounded-xl font-bold flex items-center justify-center gap-sm active:scale-95 transition-transform disabled:opacity-50">
<span className="material-symbols-outlined">save</span> {isLoading ? 'Posting...' : 'Post Voucher'}
</button>
<button className="w-16 py-md bg-surface-container-highest text-primary rounded-xl flex items-center justify-center active:scale-95 transition-transform">
<span className="material-symbols-outlined" data-icon="insights">insights</span>
</button>
</div>
</div>
</div>
</main>

<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pb-safe pt-2 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 z-50">
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="home">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="list_alt">list_alt</span>
<span className="font-label-sm text-label-sm">Ledger</span>
</a>
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1 animate-pulse-subtle" href="#">
<span className="material-symbols-outlined" data-icon="add_box">add_box</span>
<span className="font-label-sm text-label-sm">Entry</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="insights">insights</span>
<span className="font-label-sm text-label-sm">AI</span>
</a>
</nav>


        </div>
    );
};

export default SmartVoucherPage;
