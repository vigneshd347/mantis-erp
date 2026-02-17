
import { LayoutDashboard, Receipt, LineChart, Zap, Users } from 'lucide-react';

export default function Home() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <header className="glass-panel" style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontWeight: 800, fontSize: '24px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Manti ERP
                    </h1>
                    <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <a href="#" style={{ color: 'var(--text-dim)' }}>Features</a>
                        <a href="#" style={{ color: 'var(--text-dim)' }}>Pricing</a>
                        <button className="btn-primary">Get Started</button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container" style={{ flex: 1, padding: '80px 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px', display: 'inline-block', padding: '6px 12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderRadius: '20px', fontSize: '14px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <Zap size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
                    Enterprise-Grade Accounting
                </div>

                <h2 style={{ fontSize: '60px', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.02em' }}>
                    Manage your business with <br />
                    <span style={{ color: '#818cf8' }}>Precision & Speed</span>
                </h2>

                <p style={{ fontSize: '20px', color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto 40px' }}>
                    The complete financial stack for modern businesses. Invoices, expenses, and automated bookkeeping in one platform.
                </p>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '80px' }}>
                    <button className="btn-primary" style={{ fontSize: '18px', padding: '15px 30px' }}>Start Free Trial</button>
                    <button className="glass-panel" style={{ color: 'white', padding: '15px 30px', fontSize: '18px', cursor: 'pointer' }}>View Demo</button>
                </div>

                {/* Feature Grid */}
                <div className="grid-3">
                    <div className="glass-panel" style={{ padding: '30px', textAlign: 'left' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <Receipt color="#818cf8" />
                        </div>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Smart Invoicing</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Create beautiful invoices, automate reminders, and get paid faster with integrated payments.</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '30px', textAlign: 'left' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.2)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <LineChart color="#34d399" />
                        </div>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Real-time Reporting</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Track P&L, balance sheets, and cash flow in real-time. No more waiting for month-end.</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '30px', textAlign: 'left' }}>
                        <div style={{ background: 'rgba(236, 72, 153, 0.2)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <Users color="#f472b6" />
                        </div>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Multi-Tenant CRM</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Manage customer relationships and vendor contacts directly alongside your financials.</p>
                    </div>
                </div>
            </section>

            <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
                <p>&copy; 2024 Manti ERP. Built for Scale.</p>
            </footer>
        </main>
    );
}
