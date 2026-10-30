"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Key,
  Copy,
  Check,
  Terminal,
  Layers,
  Zap,
  Globe,
  RefreshCw,
  FileCode,
  LogIn
} from "lucide-react";

interface ApiDocsClientProps {
  apiKey: string;
  isLoggedIn?: boolean;
}

export default function ApiDocsClient({ apiKey, isLoggedIn = true }: ApiDocsClientProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"curl" | "node" | "python" | "php">("curl");

  const effectiveKey = apiKey || "YOUR_API_KEY_HERE";

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const codeSnippets = {
    curl: `# 1. Place a New Order
curl -X POST "https://mediareachdigital.com/api/v2" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "key=${effectiveKey}" \\
  -d "action=add" \\
  -d "service=SERVICE_ID" \\
  -d "link=https://instagram.com/p/yourlink" \\
  -d "quantity=1000"

# 2. Check Order Status
curl -X POST "https://mediareachdigital.com/api/v2" \\
  -d "key=${effectiveKey}&action=status&order=ORDER_ID"

# 3. Check Account Balance
curl -X POST "https://mediareachdigital.com/api/v2" \\
  -d "key=${effectiveKey}&action=balance"`,

    node: `const axios = require('axios');
const qs = require('qs');

const API_URL = 'https://mediareachdigital.com/api/v2';
const API_KEY = '${effectiveKey}';

// Place Order
async function createOrder() {
  const response = await axios.post(API_URL, qs.stringify({
    key: API_KEY,
    action: 'add',
    service: 'SERVICE_ID',
    link: 'https://instagram.com/p/yourlink',
    quantity: 1000
  }));
  console.log('Order Result:', response.data);
}

createOrder();`,

    python: `import requests

API_URL = "https://mediareachdigital.com/api/v2"
API_KEY = "${effectiveKey}"

payload = {
    "key": API_KEY,
    "action": "add",
    "service": "SERVICE_ID",
    "link": "https://instagram.com/p/yourlink",
    "quantity": 1000
}

response = requests.post(API_URL, data=payload)
print("Order Response:", response.json())`,

    php: `<?php
$apiUrl = 'https://mediareachdigital.com/api/v2';
$data = [
    'key'      => '${effectiveKey}',
    'action'   => 'add',
    'service'  => 'SERVICE_ID',
    'link'     => 'https://instagram.com/p/yourlink',
    'quantity' => 1000
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = json_decode(curl_exec($ch), true);
curl_close($ch);

print_r($response);
?>`
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">
            Reseller API v2 Documentation
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Connect your custom panel or automated bot directly using industry standard SMM API v2 protocol
        </p>
      </div>

      {/* API Key Box */}
      <div className="glass-panel p-6 rounded-3xl border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Your Personal Reseller API Key</span>
          </div>
          {isLoggedIn ? (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active & Verified
            </span>
          ) : (
            <Link
              href="/login"
              className="text-[10px] text-indigo-300 hover:text-white font-bold bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1 transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span>Log in to reveal key</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={apiKey || "Please sign in to view your unique API key"}
            className="w-full glass-input px-4 py-2.5 rounded-xl font-mono text-sm text-indigo-200 select-all"
          />
          {isLoggedIn && apiKey && (
            <button
              onClick={handleCopyKey}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              {copiedKey ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? "Copied!" : "Copy Key"}</span>
            </button>
          )}
        </div>
      </div>

      {/* API Endpoint & Protocol Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">HTTP Method</span>
          <p className="text-sm font-bold text-emerald-400 font-mono">POST</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Endpoint URL</span>
          <p className="text-sm font-bold text-white font-mono truncate">https://mediareachdigital.com/api/v2</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Response Format</span>
          <p className="text-sm font-bold text-cyan-400 font-mono">JSON</p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Code Integration Examples</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/5">
            {(["curl", "node", "python", "php"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedLang === lang
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 bg-[#080c18] overflow-x-auto">
          <pre className="font-mono text-xs text-indigo-200 leading-relaxed">
            {codeSnippets[selectedLang]}
          </pre>
        </div>
      </div>

      {/* Action Reference Table */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border-white/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Standard v2 Actions Reference
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5">Action</th>
                <th className="py-2.5">Required Parameters</th>
                <th className="py-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="py-2.5 font-mono text-indigo-400 font-bold">services</td>
                <td className="py-2.5 font-mono text-slate-400">key, action</td>
                <td className="py-2.5">Returns list of all active services, rates, and min/max.</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-indigo-400 font-bold">add</td>
                <td className="py-2.5 font-mono text-slate-400">key, action, service, link, quantity</td>
                <td className="py-2.5">Places an order and deducts balance atomically.</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-indigo-400 font-bold">status</td>
                <td className="py-2.5 font-mono text-slate-400">key, action, order (or orders)</td>
                <td className="py-2.5">Checks status, start count, and remains for 1 or up to 100 orders.</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-indigo-400 font-bold">balance</td>
                <td className="py-2.5 font-mono text-slate-400">key, action</td>
                <td className="py-2.5">Returns current live account balance in INR.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
