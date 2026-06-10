const fs = require('fs');
const https = require('https');
const path = require('path');

const screens = [
    { name: "CAPracticeManagementPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2JjODcwMjM2OGI5OTRlOGRiYTBkZWY5OGE1Y2ZjOWY5EgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/admin/practice" },
    { name: "RoleBasedAccessControlPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzhjM2ZlYTJiYjQ2YTQ3MzA4NThhYjA4MTUwYWU2ZWY5EgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/admin/rbac" },
    { name: "ROCAndMCACenterPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQxZTE2OWQ4MWI1YTRlMWZiNWZlNDE3OGUwMmJmODZjEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/compliance/roc-mca" },
    { name: "AuditAndCompliancePage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzY1NjQ2Mjc3ODVkNzRlMDRhMjZjMDk0NGM4MGI5ZGVkEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/compliance/audit" },
    { name: "GSTComplianceCenterPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ExNGQ4N2I0NjdjYjRiMDU4ZGFmZDIxOTBlMDBiNzU3EgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/compliance/gst" },
    { name: "TDSComplianceCenterPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzdhOWQ3NTVjOGJhMDQxY2ZiYzMwMjZmMWNhODg4NGM2EgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/compliance/tds" },
    { name: "AIAssistantCenterPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2FmYmI1MDgyNjRjNTQ3Nzk5MGIwNjZmZWEyZjEzN2ExEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/ai/assistant" },
    { name: "CFODashboardPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzMxMjc4MjFiYjc5MTRmM2RhMWQ3NjhkZjFjMmY2ODUxEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/dashboard/cfo" },
    { name: "ReportsIntelligencePage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2M4MjM0MmM1MGE0ZTQ2MzNiMmEzZDBlMzcyMzEyNTc2EgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/reports/intelligence" },
    { name: "CompanyIntelligenceDashboardPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzM5YjIyNWJiZWI4ODRmZDdiYzRlMDBjNDZjMDcxMzU3EgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/company/intelligence" },
    { name: "IntegrationCenterPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE0MmNlZTU1OGY3OTQyNzE5N2YxNDdjZmEzZDExZmRkEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/admin/integrations" },
    { name: "TaskManagementHubPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzU1NDRkNTBmMGZmMjQwZDBhZWIxODBjOTllN2M4MWVkEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/tasks" },
    { name: "ForgotPasswordPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZjMTYxN2FjOGNmMTQ1ZjQ5OWFlZDZhYzZhZDk4OTg0EgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/forgot-password" },
    { name: "ResetPasswordPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzJkODVhODEwYmNiOTRkODFhYmFkZmJlZGQzZWZiZjNhEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/reset-password" },
    { name: "ChartOfAccountsPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzcwM2E5NDliZWFkMDRkOGY5YWEwYWE2OWM3N2E3MzA1EgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/accounting/coa" },
    { name: "FinancialStatementsHubPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E2ZTMxZTViNTIzNzRiMDM4MDVkODNkN2VlOTI1MWIxEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/accounting/statements" },
    { name: "BankReconciliationCenterPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzU4Mjk0ZTk5ZDFlNzRlZThhMDZiYWJkYjM3NTg4N2RjEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/accounting/reconciliation" },
    { name: "SalesInvoiceCenterPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2M4M2Y1ZWUxODFiYzRiZDNiYmY5MzYxNWZmNmFiNTNjEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/invoicing" },
    { name: "PortalIntegrationHubPage", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzVjNGJjNjRkZWY1MzQ4ODE4YjY4NWEyOWMyZjFkZjkxEgsSBxDgiM-u-RAYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTE5NTk5MTc3NTAyMzM5MTM0&filename=&opi=89354086", route: "/client-portal/integrations" },
];

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

function htmlToJsx(htmlContent, componentName) {
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (!bodyMatch) return "";
    let body = bodyMatch[1];
    
    body = body.replace(/<script[\s\S]*?<\/script>/g, '');
    body = body.replace(/\bclass=/g, 'className=');
    body = body.replace(/\bfor=/g, 'htmlFor=');
    body = body.replace(/\bonclick=/g, 'onClick=');
    
    // Fix onClick string functions
    body = body.replace(/onClick="[^"]*"/g, 'onClick={() => {}}');
    
    body = body.replace(/(<(img|input|br|hr)[^>]*?)(?<!\/)>/g, '$1 />');
    
    body = body.replace(/style="([^"]*)"/g, (match, styleStr) => {
        const props = [];
        const parts = styleStr.split(';');
        for (let prop of parts) {
            prop = prop.trim();
            if (!prop || !prop.includes(':')) continue;
            let [key, val] = prop.split(/:(.+)/);
            key = key.trim();
            val = val.trim();
            key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            val = val.replace(/'/g, '"');
            props.push(`${key}: '${val}'`);
        }
        return `style={{ ${props.join(', ')} }}`;
    });
    
    body = body.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
    
    const tsx = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const ${componentName}: React.FC = () => {
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
            // const response = await apiClient.get(\`/api-endpoint/\${activeCompanyId}\`);
            // setData(response.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
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

async function processAll() {
    let importStatements = [];
    let routeStatements = [];
    
    for (const screen of screens) {
        console.log(`Processing ${screen.name}...`);
        const htmlFile = path.join(__dirname, 'frontend/src/pages', `${screen.name}.html`);
        const tsxFile = path.join(__dirname, 'frontend/src/pages', `${screen.name}.tsx`);
        
        await downloadFile(screen.url, htmlFile);
        
        const html = fs.readFileSync(htmlFile, 'utf8');
        const tsx = htmlToJsx(html, screen.name);
        
        fs.writeFileSync(tsxFile, tsx, 'utf8');
        fs.unlinkSync(htmlFile);
        
        importStatements.push(`import ${screen.name} from './pages/${screen.name}';`);
        
        if (screen.route.includes('password')) {
             routeStatements.push(`          <Route path="${screen.route}" element={<${screen.name} />} />`);
        } else {
             routeStatements.push(`          <Route
            path="${screen.route}"
            element={
              <ProtectedRoute>
                <${screen.name} />
              </ProtectedRoute>
            }
          />`);
        }
    }
    
    console.log("=== IMPORTS ===");
    console.log(importStatements.join('\n'));
    console.log("=== ROUTES ===");
    console.log(routeStatements.join('\n'));
}

processAll().catch(console.error);
