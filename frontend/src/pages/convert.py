import re
import os

def html_to_jsx(html_content, component_name):
    # Extract everything inside <body> except <script> tags
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL)
    if not body_match:
        print("No body found")
        return ""
    
    body = body_match.group(1)
    
    # Remove script tags
    body = re.sub(r'<script.*?>.*?</script>', '', body, flags=re.DOTALL)
    
    # Convert class to className
    body = re.sub(r'\bclass=', 'className=', body)
    
    # Convert for to htmlFor
    body = re.sub(r'\bfor=', 'htmlFor=', body)
    
    # Convert onclick to onClick
    body = re.sub(r'\bonclick=', 'onClick=', body)
    
    # Self close tags: img, input, br, hr
    body = re.sub(r'(<(img|input|br|hr)[^>]*?)(?<!/)>', r'\1 />', body)
    
    # Style attribute conversion: style="width: 85%" to style={{ width: '85%' }}
    def style_replacer(match):
        style_str = match.group(1)
        # Parse CSS properties
        props = []
        for prop in style_str.split(';'):
            prop = prop.strip()
            if not prop:
                continue
            if ':' not in prop:
                continue
            key, val = prop.split(':', 1)
            key = key.strip()
            val = val.strip()
            
            # Convert kebab-case to camelCase
            key = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), key)
            
            # Quote the value
            val = val.replace("'", '"')
            props.append(f"{key}: '{val}'")
            
        style_obj = "{" + ", ".join(props) + "}"
        return f'style={{{style_obj}}}'

    body = re.sub(r'style="([^"]*)"', style_replacer, body)
    
    # Fix inline comments <!-- --> to {/* */}
    body = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body, flags=re.DOTALL)
    
    # Replace background image URLs if any
    # e.g. style={{ backgroundImage: 'url('https...')' }}
    
    # Create the TSX wrapper
    tsx = f"""import React, {{ useState, useEffect }} from 'react';
import {{ useNavigate }} from 'react-router-dom';
import {{ useAuth }} from '../context/AuthContext';
import inventoryService, {{ InventorySummary }} from '../services/inventoryService';

const {component_name}: React.FC = () => {{
    const navigate = useNavigate();
    const {{ activeCompanyId }} = useAuth();
    const [summary, setSummary] = useState<InventorySummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {{
        if (activeCompanyId) {{
            fetchData();
        }}
    }}, [activeCompanyId]);

    const fetchData = async () => {{
        setIsLoading(true);
        try {{
            const data = await inventoryService.getSummary();
            setSummary(data);
        }} catch (error) {{
            console.error('Failed to fetch inventory dashboard data', error);
        }} finally {{
            setIsLoading(false);
        }}
    }};

    return (
        <div className="stitch-app">
            {body}
        </div>
    );
}};

export default {component_name};
"""
    return tsx

for file, comp in [("InventoryIntelligencePage.html", "InventoryIntelligencePage"), ("StockAdjustmentCenterPage.html", "StockAdjustmentCenterPage")]:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            html = f.read()
            
        tsx = html_to_jsx(html, comp)
        
        with open(comp + ".tsx", 'w', encoding='utf-8') as f:
            f.write(tsx)
            
        print(f"Successfully converted {comp}")
    except Exception as e:
        print(f"Error converting {comp}: {e}")
