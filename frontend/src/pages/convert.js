const fs = require('fs');

function htmlToJsx(htmlContent, componentName) {
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (!bodyMatch) {
        console.log("No body found in " + componentName);
        return "";
    }
    
    let body = bodyMatch[1];
    
    // Remove script tags
    body = body.replace(/<script[\s\S]*?<\/script>/g, '');
    
    // Replace class= with className=
    body = body.replace(/\bclass=/g, 'className=');
    
    // Replace for= with htmlFor=
    body = body.replace(/\bfor=/g, 'htmlFor=');
    
    // Replace onclick= with onClick=
    body = body.replace(/\bonclick=/g, 'onClick=');
    
    // Self close tags: img, input, br, hr
    body = body.replace(/(<(img|input|br|hr)[^>]*?)(?<!\/)>/g, '$1 />');
    
    // Style attribute conversion: style="width: 85%" to style={{ width: '85%' }}
    body = body.replace(/style="([^"]*)"/g, (match, styleStr) => {
        const props = [];
        const parts = styleStr.split(';');
        for (let prop of parts) {
            prop = prop.trim();
            if (!prop || !prop.includes(':')) continue;
            
            let [key, val] = prop.split(/:(.+)/);
            key = key.trim();
            val = val.trim();
            
            // Convert kebab-case to camelCase
            key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            
            // Escape quotes
            val = val.replace(/'/g, '"');
            props.push(`${key}: '${val}'`);
        }
        return `style={{ ${props.join(', ')} }}`;
    });
    
    // Fix inline comments <!-- --> to {/* */}
    body = body.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
    
    const tsx = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import inventoryService, { InventorySummary } from '../services/inventoryService';

const ${componentName}: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [summary, setSummary] = useState<InventorySummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await inventoryService.getSummary();
            setSummary(data);
        } catch (error) {
            console.error('Failed to fetch inventory dashboard data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            ${body}
        </div>
    );
};

export default ${componentName};
`;
    return tsx;
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("Usage: node convert.js <inputFile> <componentName>");
    process.exit(1);
}

const file = args[0];
const comp = args[1];

try {
    const html = fs.readFileSync(file, 'utf8');
    const tsx = htmlToJsx(html, comp);
    fs.writeFileSync(comp + ".tsx", tsx, 'utf8');
    console.log("Successfully converted " + comp);
} catch (e) {
    console.error("Error converting " + comp + ":", e);
}
