const fs = require('fs');
let html = fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\d421c99e-0adc-4764-a54d-76a74cf3a241\\.system_generated\\steps\\1106\\content.md', 'utf8');

// extract the body content
let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// remove script tags
bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
// remove comment tags
bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');

// Convert class to className
bodyContent = bodyContent.replace(/class=/g, 'className=');

// Fix style attributes
bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, styleStr) => {
    if (styleStr.includes('font-variation-settings')) {
        return "style={{ fontVariationSettings: \"'FILL' 1\" }}";
    }
    // simple width matches
    const widthMatch = styleStr.match(/width:\s*([^;"]+)/);
    if (widthMatch) {
        return `style={{ width: "${widthMatch[1]}" }}`;
    }
    return match;
});

// Fix unclosed tags for JSX (img, input, hr)
bodyContent = bodyContent.replace(/<img([^>]*[^\/])>/gi, '<img$1 />');
bodyContent = bodyContent.replace(/<input([^>]*[^\/])>/gi, '<input$1 />');
bodyContent = bodyContent.replace(/<hr([^>]*[^\/])>/gi, '<hr$1 />');
// Fix <br>
bodyContent = bodyContent.replace(/<br>/gi, '<br />');

const reactCode = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountingService, Ledger, VoucherCreate, VoucherTransaction } from '../services/accountingService';

const SmartVoucherPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompany } = useAuth();
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
        if (activeCompany) {
            fetchLedgers();
        }
    }, [activeCompany]);

    const fetchLedgers = async () => {
        try {
            const data = await accountingService.getLedgers(activeCompany!.id);
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
        if (!activeCompany) return;
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
                company_id: activeCompany.id,
                voucher_type: voucherType,
                voucher_date: voucherDate,
                description,
                narration,
                transactions: submitTransactions
            };
            
            await accountingService.createVoucher(voucher);
            alert(\`\${voucherType} voucher posted successfully\`);
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
            ${bodyContent}
        </div>
    );
};

export default SmartVoucherPage;
`;

fs.writeFileSync('src/pages/SmartVoucherPage.tsx', reactCode);
console.log('Conversion complete');
