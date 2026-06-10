const fs = require('fs');
let html = fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\d421c99e-0adc-4764-a54d-76a74cf3a241\\.system_generated\\steps\\1076\\content.md', 'utf8');

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
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountingService } from '../services/accountingService';

const LedgerDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { activeCompany } = useAuth();
    const [ledger, setLedger] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompany && id) {
            fetchData();
        }
    }, [activeCompany, id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ledgerData, txData] = await Promise.all([
                accountingService.getLedger(activeCompany!.id, parseInt(id!)),
                accountingService.getLedgerStatement(activeCompany!.id, parseInt(id!), '2023-01-01', '2024-12-31')
            ]);
            setLedger(ledgerData);
            setTransactions(txData);
        } catch (error) {
            console.error('Failed to fetch ledger details', error);
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

export default LedgerDetailsPage;
`;

fs.writeFileSync('src/pages/LedgerDetailsPage.tsx', reactCode);
console.log('Conversion complete');
