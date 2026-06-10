import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import documentService, { Document, DocumentFolder } from '../services/documentService';

const DocumentVaultPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [folders, setFolders] = useState<DocumentFolder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const companyIdNum = parseInt(activeCompanyId!) || 0;
            const docs = await documentService.getDocuments(companyIdNum);
            const flds = await documentService.getFolders(companyIdNum);
            setDocuments(docs);
            setFolders(flds);
        } catch (error) {
            console.error('Failed to fetch documents data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            
{/*  TopAppBar  */}
<header className="sticky top-0 z-50 flex justify-between items-center px-md w-full h-16 bg-surface-bright dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
<div className="flex items-center gap-md">
<button className="material-symbols-outlined text-primary hover:bg-surface-container-high p-xs rounded-lg transition-colors">menu</button>
<h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">FinPilot AI</h1>
</div>
<div className="flex items-center gap-md">
<div className="hidden md:flex items-center gap-sm bg-surface-container-low px-md py-xs rounded-full border border-outline-variant">
<span className="material-symbols-outlined text-on-surface-variant">search</span>
<input className="bg-transparent border-none focus:ring-0 text-body-md w-64 placeholder:text-on-surface-variant" placeholder="Search documents..." type="text"/>
<span className="text-on-surface-variant font-data-mono text-xs">⌘K</span>
</div>
<div className="flex items-center gap-xs">
<button className="material-symbols-outlined text-on-surface-variant p-xs rounded-lg hover:bg-surface-container-high transition-colors">notifications</button>
<button className="material-symbols-outlined text-on-surface-variant p-xs rounded-lg hover:bg-surface-container-high transition-colors">help_outline</button>
</div>
<div className="h-8 w-8 rounded-full bg-primary-container overflow-hidden border border-outline-variant">
<img className="w-full h-full object-cover" data-alt="Professional executive headshot of a financial officer in a modern high-key setting with soft daylight illumination. The person has a confident and welcoming expression, representing the FinPilot AI user profile. The style is sharp, corporate, and high-fidelity with a minimalist background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmN-xl3tIpS3L1ADjy3ToT_s2sVgbX1kQRI1RG5jxmX7AseNPdB6gNN3Dppg1GSjn83iv0__2E_mpCM_GFe9zi7-tsxoSvDkGqNmfuuGR0W7YziimB7GZle11ZVaBnmXogbb-zz9X-OBsAZ1nxKf2ccmCRHrNsa9LpRn9N-u8u3rSI9ZBpNG31A36dSyDeEJKbvObxz5YIhJsNcFyIuHbunBj0CZEFp88ZfYtjakXrQqCcCkbH2VfCNvaQzmK3exSKfOtq7Or-MFE"/>
</div>
</div>
</header>
<div className="flex min-h-screen">
{/*  NavigationDrawer (Sidebar)  */}
<aside className="hidden lg:flex flex-col gap-base p-md fixed left-0 top-16 h-[calc(100vh-64px)] w-[280px] bg-surface-container dark:bg-surface-dim border-r border-outline-variant">
<nav className="flex flex-col gap-xs">
<div className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-transform duration-200 hover:translate-x-1">
<span className="material-symbols-outlined">analytics</span>
<span className="font-body-md text-body-md">Dashboard</span>
</div>
<div className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-transform duration-200 hover:translate-x-1">
<span className="material-symbols-outlined">business</span>
<span className="font-body-md text-body-md">Companies</span>
</div>
<div className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container font-semibold rounded-lg cursor-pointer transition-transform duration-200 hover:translate-x-1">
<span className="material-symbols-outlined">folder_open</span>
<span className="font-body-md text-body-md">Documents</span>
</div>
<div className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-transform duration-200 hover:translate-x-1">
<span className="material-symbols-outlined">payments</span>
<span className="font-body-md text-body-md">Payroll</span>
</div>
<div className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-transform duration-200 hover:translate-x-1">
<span className="material-symbols-outlined">gavel</span>
<span className="font-body-md text-body-md">Compliance</span>
</div>
<div className="mt-lg border-t border-outline-variant pt-lg">
<span className="px-md text-label-sm font-label-sm text-on-surface-variant opacity-60 uppercase">Systems</span>
<div className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg mt-xs cursor-pointer">
<span className="material-symbols-outlined">account_balance</span>
<span className="font-body-md text-body-md">Gov Connect</span>
</div>
<div className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer">
<span className="material-symbols-outlined">settings_applications</span>
<span className="font-body-md text-body-md">Admin</span>
</div>
</div>
</nav>
<div className="mt-auto p-md glass-effect rounded-xl border border-outline-variant ai-glow">
<div className="flex items-center gap-sm mb-xs">
<span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
<span className="font-label-sm text-label-sm text-secondary">AI STORAGE ANALYZER</span>
</div>
<div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-secondary w-3/4"></div>
</div>
<p className="mt-xs font-label-sm text-label-sm text-on-surface-variant">75% capacity optimized by FinPilot</p>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="flex-1 lg:ml-[280px] p-md lg:p-lg bg-surface-bright min-h-screen pb-24 lg:pb-8">
{/*  Page Header  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
<div>
<div className="flex items-center gap-xs text-on-surface-variant mb-xs">
<span className="font-label-sm text-label-sm">Explorer</span>
<span className="material-symbols-outlined text-sm">chevron_right</span>
<span className="font-label-sm text-label-sm">All Files</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary">Document Explorer</h2>
</div>
<div className="flex items-center gap-md">
<button className="flex items-center gap-sm px-md py-sm bg-surface-container-high text-on-surface font-semibold rounded-lg hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined">filter_list</span>
<span>Filter</span>
</button>
<button className="flex items-center gap-sm px-lg py-sm bg-secondary text-on-secondary font-semibold rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all">
<span className="material-symbols-outlined">upload</span>
<span>Upload</span>
</button>
</div>
</div>
{/*  Folder Bento Grid  */}
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md mb-xl">
{/*  Folder Card: Tax  */}
<div className="group bg-surface-container-lowest p-md rounded-xl border border-outline-variant hover:border-secondary transition-all cursor-pointer">
<div className="flex justify-between items-start mb-md">
<div className="p-sm bg-surface-container-high rounded-lg text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
<span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>folder</span>
</div>
<button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">more_vert</button>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-xs">Tax</h3>
<div className="flex items-center justify-between">
<span className="text-on-surface-variant font-label-sm text-label-sm">124 Items</span>
<span className="text-on-surface-variant font-data-mono text-xs">2.4 GB</span>
</div>
</div>
{/*  Folder Card: Audit  */}
<div className="group bg-surface-container-lowest p-md rounded-xl border border-outline-variant hover:border-secondary transition-all cursor-pointer">
<div className="flex justify-between items-start mb-md">
<div className="p-sm bg-surface-container-high rounded-lg text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
<span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>folder</span>
</div>
<button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">more_vert</button>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-xs">Audit</h3>
<div className="flex items-center justify-between">
<span className="text-on-surface-variant font-label-sm text-label-sm">48 Items</span>
<span className="text-on-surface-variant font-data-mono text-xs">850 MB</span>
</div>
</div>
{/*  Folder Card: Payroll  */}
<div className="group bg-surface-container-lowest p-md rounded-xl border border-outline-variant hover:border-secondary transition-all cursor-pointer">
<div className="flex justify-between items-start mb-md">
<div className="p-sm bg-surface-container-high rounded-lg text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
<span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>folder</span>
</div>
<button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">more_vert</button>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-xs">Payroll</h3>
<div className="flex items-center justify-between">
<span className="text-on-surface-variant font-label-sm text-label-sm">312 Items</span>
<span className="text-on-surface-variant font-data-mono text-xs">1.2 GB</span>
</div>
</div>
{/*  Folder Card: Legal  */}
<div className="group bg-surface-container-lowest p-md rounded-xl border border-outline-variant hover:border-secondary transition-all cursor-pointer">
<div className="flex justify-between items-start mb-md">
<div className="p-sm bg-surface-container-high rounded-lg text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
<span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>folder</span>
</div>
<button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">more_vert</button>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-xs">Legal</h3>
<div className="flex items-center justify-between">
<span className="text-on-surface-variant font-label-sm text-label-sm">92 Items</span>
<span className="text-on-surface-variant font-data-mono text-xs">4.8 GB</span>
</div>
</div>
</section>
{/*  Recent Files Section  */}
<section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
<div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
<h3 className="font-headline-md text-headline-md text-primary">Recent Documents</h3>
<div className="flex items-center gap-sm">
<button className="p-xs hover:bg-surface-container-high rounded transition-colors"><span className="material-symbols-outlined text-on-surface-variant">grid_view</span></button>
<button className="p-xs bg-surface-container-high rounded transition-colors"><span className="material-symbols-outlined text-secondary">list</span></button>
</div>
</div>
{/*  Financial Data Grid  */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant">
<th className="px-lg py-sm font-label-sm text-label-sm">NAME</th>
<th className="px-lg py-sm font-label-sm text-label-sm">STATUS</th>
<th className="px-lg py-sm font-label-sm text-label-sm">LAST MODIFIED</th>
<th className="px-lg py-sm font-label-sm text-label-sm">OWNER</th>
<th className="px-lg py-sm font-label-sm text-label-sm text-right">ACTIONS</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
{/*  Row 1  */}
<tr className="hover:bg-surface-container-high transition-colors group">
<td className="px-lg py-sm">
<div className="flex items-center gap-md">
<div className="w-10 h-10 bg-error-container text-error flex items-center justify-center rounded">
<span className="material-symbols-outlined">picture_as_pdf</span>
</div>
<div>
<p className="font-semibold text-primary">Q3_Tax_Audit_Report.pdf</p>
<p className="text-xs text-on-surface-variant font-data-mono">1.4 MB</p>
</div>
</div>
</td>
<td className="px-lg py-sm">
<span className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider ai-glow">
<span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                                        OCR COMPLETE
                                    </span>
</td>
<td className="px-lg py-sm text-on-surface-variant">Oct 12, 2023 · 02:45 PM</td>
<td className="px-lg py-sm">
<div className="flex items-center gap-xs">
<div className="w-6 h-6 rounded-full bg-surface-dim overflow-hidden border border-outline-variant">
<img className="w-full h-full object-cover" data-alt="Headshot portrait of a senior audit manager, high-key lighting, focused on precision and professional reliability, modern financial office aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlTZu4h08zzw1ZaEV8Tfun5SU1isHF1e7ap2BLJsG0ozCcD-aA2JIs29SUiyVeRYJj7PO0IdGza4HjuobT59VmLypEOtl4Nu0bTINmu5E8P5vO4K79Fkr9tEoofqe40a0j-_XFmSygLdFw56RPs6ctL2c_s-MpRmSHXRzAe6yiJTu2JCxCssW-NohjO8CfuFlQhuxe3NEchIcX027IRNAGWAPptKyGuhaKRNu9ZbzFs9vPF1PM362v9_ZI57r9l-HbNZ30mNIKykI"/>
</div>
<span className="text-sm">Alex Chen</span>
</div>
</td>
<td className="px-lg py-sm text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-secondary p-xs">visibility</button>
<button className="material-symbols-outlined text-on-surface-variant hover:text-secondary p-xs">download</button>
</td>
</tr>
{/*  Row 2  */}
<tr className="hover:bg-surface-container-high transition-colors group">
<td className="px-lg py-sm">
<div className="flex items-center gap-md">
<div className="w-10 h-10 bg-secondary-container text-on-secondary-container flex items-center justify-center rounded">
<span className="material-symbols-outlined">description</span>
</div>
<div>
<p className="font-semibold text-primary">Payroll_Summary_Internal.docx</p>
<p className="text-xs text-on-surface-variant font-data-mono">420 KB</p>
</div>
</div>
</td>
<td className="px-lg py-sm">
<span className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider animate-pulse">
<span className="material-symbols-outlined text-xs">sync</span>
                                        PROCESSING OCR
                                    </span>
</td>
<td className="px-lg py-sm text-on-surface-variant">Oct 12, 2023 · 01:12 PM</td>
<td className="px-lg py-sm">
<div className="flex items-center gap-xs">
<div className="w-6 h-6 rounded-full bg-surface-dim overflow-hidden border border-outline-variant">
<img className="w-full h-full object-cover" data-alt="Close-up headshot of a female HR specialist, bright daylight studio setting, professional yet accessible appearance, soft blurred corporate background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbdXhm0KL_DLj7S2CvHMNmMwucT3GB99HIe4bJxdqDT7r0-r30uasnXn5PxTMdGxehVjfZZWGjDk12ZE_IKsEkMywW-2IKfsbTdNg_nQUR_qfsJdrW9MgBzScp97-UzBPSDhj7hspCX_WqvZrp1PaLhm1olQy6PIUXRmrJsaibPFTikwqKCavx_jdxPWgVVrokCTvxHKIh33Wy4Eh3A4_N2VWyT5ZhnMW_HtiPjH-EuodkU9Iqcfd5KXyTPjg1qHEo0roLqTiRszc"/>
</div>
<span className="text-sm">Sarah Miller</span>
</div>
</td>
<td className="px-lg py-sm text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-secondary p-xs">visibility</button>
<button className="material-symbols-outlined text-on-surface-variant hover:text-secondary p-xs">download</button>
</td>
</tr>
{/*  Row 3  */}
<tr className="hover:bg-surface-container-high transition-colors group">
<td className="px-lg py-sm">
<div className="flex items-center gap-md">
<div className="w-10 h-10 bg-surface-container-high text-on-surface-variant flex items-center justify-center rounded">
<span className="material-symbols-outlined">table_view</span>
</div>
<div>
<p className="font-semibold text-primary">Compliance_Log_2023.xlsx</p>
<p className="text-xs text-on-surface-variant font-data-mono">8.2 MB</p>
</div>
</div>
</td>
<td className="px-lg py-sm">
<span className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wider">
<span className="material-symbols-outlined text-xs">block</span>
                                        NOT APPLICABLE
                                    </span>
</td>
<td className="px-lg py-sm text-on-surface-variant">Oct 11, 2023 · 09:00 AM</td>
<td className="px-lg py-sm">
<div className="flex items-center gap-xs">
<div className="w-6 h-6 rounded-full bg-surface-dim overflow-hidden border border-outline-variant">
<img className="w-full h-full object-cover" data-alt="Portrait of an enterprise administrator in a sleek modern office, daylight, professional and high-performance visual style, cool color tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMw310YldpiFS6NkbRP4U5JN0i5OB17FzFiqpVoXNYS5RtbVjr5IIzaQVjptg93lJm4KyLxYs2WKvsztBCDkHkX5hzSuDJLJj3zxSBtgG3SMsLm1FSUAdgTqDIcQoYl546w92tPqN-iaov_3YQ20T5pXttmLo5J8BIgewLvdOCuJAlNzezKEAMK9v-OB1G_beDeqK1kAWAYIidQeJjtP1G7e8mte7lUHwtN2JbkJLFy2w2eVNKy-cgpW030Z2d6Y8pnFomKrPu2hY"/>
</div>
<span className="text-sm">John Wick</span>
</div>
</td>
<td className="px-lg py-sm text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-secondary p-xs">visibility</button>
<button className="material-symbols-outlined text-on-surface-variant hover:text-secondary p-xs">download</button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="px-lg py-md bg-surface-container-low flex justify-between items-center">
<span className="text-on-surface-variant font-label-sm text-label-sm">Showing 1-10 of 484 documents</span>
<div className="flex gap-xs">
<button className="p-xs border border-outline-variant rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
<button className="px-sm py-xs border border-outline-variant rounded bg-secondary text-on-secondary font-bold">1</button>
<button className="px-sm py-xs border border-outline-variant rounded hover:bg-surface-container-high transition-colors">2</button>
<button className="px-sm py-xs border border-outline-variant rounded hover:bg-surface-container-high transition-colors">3</button>
<button className="p-xs border border-outline-variant rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
</div>
</div>
</section>
</main>
</div>
{/*  AI Chat Dock (Floating)  */}
<div className="fixed bottom-lg right-lg z-50 group">
<div className="hidden absolute bottom-20 right-0 w-80 lg:w-96 glass-effect rounded-2xl border border-outline-variant shadow-2xl overflow-hidden ai-glow flex flex-col max-h-[500px]" id="ai-panel">
<div className="p-md bg-secondary text-on-secondary flex justify-between items-center">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
<span className="font-headline-md text-headline-md">FinPilot Assistant</span>
</div>
<button className="material-symbols-outlined" onClick={() => {}}>close</button>
</div>
<div className="p-md flex-1 overflow-y-auto space-y-md scrollbar-hide">
<div className="flex gap-sm">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-sm text-on-secondary-container">smart_toy</span>
</div>
<div className="bg-surface-container-high p-sm rounded-tr-xl rounded-b-xl text-body-md">
                        How can I help you find a document today? You can ask things like "Find the latest tax return" or "When was the payroll audit last updated?"
                    </div>
</div>
</div>
<div className="p-md border-t border-outline-variant bg-surface-container-lowest">
<div className="relative">
<input className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-secondary rounded-lg pr-12 text-sm py-md" placeholder="Ask FinPilot AI..." type="text"/>
<button className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary material-symbols-outlined">send</button>
</div>
</div>
</div>
<button className="w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200" onClick={() => {}}>
<span className="material-symbols-outlined text-3xl">auto_awesome</span>
</button>
</div>
{/*  BottomNavBar (Mobile Only)  */}
<nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-sm pb-2 pt-2 bg-surface-container-lowest dark:bg-primary-container shadow-[0_-2px_10px_rgba(0,0,0,0.05)] rounded-t-xl">
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-all">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-label-sm text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-all">
<span className="material-symbols-outlined">group</span>
<span className="font-label-sm text-label-sm">Clients</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1">
<span className="material-symbols-outlined">folder_open</span>
<span className="font-label-sm text-label-sm">Docs</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-all">
<span className="material-symbols-outlined">verified</span>
<span className="font-label-sm text-label-sm">TDS</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-all">
<span className="material-symbols-outlined">grid_view</span>
<span className="font-label-sm text-label-sm">More</span>
</div>
</nav>


        </div>
    );
};

export default DocumentVaultPage;
