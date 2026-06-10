const fs = require('fs');
let html = fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\d421c99e-0adc-4764-a54d-76a74cf3a241\\.system_generated\\steps\\978\\content.md', 'utf8');

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
    if (styleStr.includes('width: 98.4%')) return 'style={{ width: "98.4%" }}';
    if (styleStr.includes('width: 76%')) return 'style={{ width: "76%" }}';
    return match;
});

// Fix unclosed tags for JSX (img, input)
bodyContent = bodyContent.replace(/<img([^>]*[^\/])>/gi, '<img$1 />');
bodyContent = bodyContent.replace(/<input([^>]*[^\/])>/gi, '<input$1 />');
// Fix <br>
bodyContent = bodyContent.replace(/<br>/gi, '<br />');

const reactCode = `import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountingService, Ledger } from '../services/accountingService';

const LedgersPage: React.FC = () => {
    const { activeCompany } = useAuth();
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompany) {
            fetchLedgers();
        }
    }, [activeCompany]);

    const fetchLedgers = async () => {
        setIsLoading(true);
        try {
            const data = await accountingService.getLedgers(activeCompany!.id);
            setLedgers(data);
        } catch (error) {
            console.error('Failed to fetch ledgers', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="stitch-app overflow-hidden">
            ${bodyContent}
        </div>
    );
};

export default LedgersPage;
`;

fs.writeFileSync('src/pages/LedgersPage.tsx', reactCode);
console.log('Conversion complete');
