package com.nexushr.core.controller;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String getLandingPage() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NexusHR API Portal</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --bg-color: #0f172a;
                        --primary: #6366f1;
                        --primary-hover: #4f46e5;
                        --accent: #f59e0b;
                        --text-main: #f8fafc;
                        --text-muted: #94a3b8;
                        --glass-bg: rgba(30, 41, 59, 0.45);
                        --glass-border: rgba(255, 255, 255, 0.08);
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: 'Plus Jakarta Sans', sans-serif;
                        background: radial-gradient(circle at top right, #1e1b4b, var(--bg-color) 60%);
                        color: var(--text-main);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                        overflow-x: hidden;
                    }
                    .container {
                        max-width: 750px;
                        width: 100%;
                        background: var(--glass-bg);
                        backdrop-filter: blur(16px);
                        -webkit-backdrop-filter: blur(16px);
                        border: 1px solid var(--glass-border);
                        border-radius: 24px;
                        padding: 3rem;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                        animation: fadeInUp 0.8s ease-out;
                    }
                    h1 {
                        font-family: 'Outfit', sans-serif;
                        font-size: 2.5rem;
                        font-weight: 800;
                        background: linear-gradient(to right, #a5b4fc, #6366f1, #38bdf8);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin-bottom: 0.5rem;
                    }
                    .subtitle {
                        color: var(--text-muted);
                        font-size: 1rem;
                        margin-bottom: 2rem;
                        font-weight: 400;
                        letter-spacing: 0.5px;
                    }
                    .badge {
                        display: inline-block;
                        padding: 0.25rem 0.75rem;
                        background: rgba(99, 102, 241, 0.15);
                        color: #a5b4fc;
                        border: 1px solid rgba(99, 102, 241, 0.3);
                        border-radius: 99px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        margin-bottom: 1.5rem;
                    }
                    .info-card {
                        background: rgba(15, 23, 42, 0.6);
                        border: 1px solid var(--glass-border);
                        border-radius: 16px;
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                    }
                    .info-card p {
                        font-size: 0.95rem;
                        line-height: 1.6;
                        color: #cbd5e1;
                    }
                    .info-card p strong {
                        color: var(--text-main);
                    }
                    .endpoints {
                        margin-bottom: 2.5rem;
                    }
                    .endpoints h3 {
                        font-family: 'Outfit', sans-serif;
                        font-size: 1.1rem;
                        color: var(--text-main);
                        margin-bottom: 1rem;
                        font-weight: 600;
                        letter-spacing: 0.5px;
                    }
                    .endpoint-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0.85rem 1rem;
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.04);
                        border-radius: 12px;
                        margin-bottom: 0.75rem;
                        transition: all 0.3s ease;
                    }
                    .endpoint-item:hover {
                        background: rgba(255, 255, 255, 0.05);
                        border-color: rgba(99, 102, 241, 0.3);
                        transform: translateX(4px);
                    }
                    .endpoint-item code {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 0.9rem;
                        color: #38bdf8;
                        font-weight: 600;
                    }
                    .endpoint-desc {
                        font-size: 0.85rem;
                        color: var(--text-muted);
                    }
                    .btn-group {
                        display: flex;
                        gap: 1rem;
                    }
                    a.btn {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0.85rem 1.75rem;
                        border-radius: 12px;
                        font-size: 0.95rem;
                        font-weight: 600;
                        text-decoration: none;
                        transition: all 0.2s ease;
                        cursor: pointer;
                    }
                    a.btn-primary {
                        background: var(--primary);
                        color: white;
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                    }
                    a.btn-primary:hover {
                        background: var(--primary-hover);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
                    }
                    a.btn-secondary {
                        background: transparent;
                        color: #cbd5e1;
                        border: 1px solid rgba(255, 255, 255, 0.15);
                    }
                    a.btn-secondary:hover {
                        background: rgba(255, 255, 255, 0.05);
                        color: white;
                        border-color: rgba(255, 255, 255, 0.3);
                        transform: translateY(-2px);
                    }
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @media (max-width: 600px) {
                        .container {
                            padding: 2rem 1.5rem;
                        }
                        h1 {
                            font-size: 2rem;
                        }
                        .btn-group {
                            flex-direction: column;
                        }
                        a.btn {
                            width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <span class="badge">Backend Active</span>
                    <h1>NexusHR Platform Engine</h1>
                    <p class="subtitle">API Core Services & Performance Dashboard Integration</p>
                    
                    <div class="info-card">
                        <p>
                            You have successfully accessed the <strong>NexusHR Backend Engine</strong> root server. The system is actively connected to PostgreSQL and running on port <code>8080</code>.
                        </p>
                    </div>

                    <div class="endpoints">
                        <h3>Primary API Endpoints</h3>
                        <div class="endpoint-item">
                            <code>GET /api/employees</code>
                            <span class="endpoint-desc">Workforce Directory (Secured)</span>
                        </div>
                        <div class="endpoint-item">
                            <code>GET /api/leaves</code>
                            <span class="endpoint-desc">Leave Approvals Center (Secured)</span>
                        </div>
                        <div class="endpoint-item">
                            <code>POST /api/auth/login</code>
                            <span class="endpoint-desc">Credential Verification (Public)</span>
                        </div>
                    </div>

                    <div class="btn-group">
                        <a href="http://localhost:5173" class="btn btn-primary">Open Frontend UI Dashboard</a>
                        <a href="/api/employees" class="btn btn-secondary">Test Backend API Connection</a>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}
