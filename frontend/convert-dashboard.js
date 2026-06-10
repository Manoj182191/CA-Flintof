const fs = require('fs');
let html = fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\d421c99e-0adc-4764-a54d-76a74cf3a241\\.system_generated\\steps\\1054\\content.md', 'utf8');

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
    // simple height matches
    const heightMatch = styleStr.match(/height:\s*([^;"]+)/);
    if (heightMatch) {
        return `style={{ height: "${heightMatch[1]}" }}`;
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
import { useAuth } from '../context/AuthContext';
import { accountingService } from '../services/accountingService';

const AccountingDashboardPage: React.FC = () => {
    const { activeCompany } = useAuth();
    const [profitLoss, setProfitLoss] = useState<any>(null);
    const [balanceSheet, setBalanceSheet] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompany) {
            fetchData();
        }
    }, [activeCompany]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Placeholder dates for now. Ideally this comes from a date picker.
            const fromDate = '2023-04-01';
            const toDate = '2024-03-31';
            const [plData, bsData] = await Promise.all([
                accountingService.getProfitLoss(activeCompany!.id, fromDate, toDate),
                accountingService.getBalanceSheet(activeCompany!.id)
            ]);
            setProfitLoss(plData);
            setBalanceSheet(bsData);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
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

export default AccountingDashboardPage;
`;

fs.writeFileSync('src/pages/AccountingDashboardPage.tsx', reactCode);
console.log('Conversion complete');
