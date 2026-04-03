import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { formatCurrency, formatDate, MONTH_NAMES, CHART_COLORS, truncate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineScale,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, isAnalyst } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recent, setRecent] = useState([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Viewers only get recent transactions
      if (!isAnalyst()) {
        const recentRes = await dashboardAPI.getRecent({ limit: 10 });
        setRecent(recentRes.data.data.transactions || []);
        setLoading(false);
        return;
      }

      const [summaryRes, catRes, trendsRes, recentRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getCategories(),
        dashboardAPI.getTrends(),
        dashboardAPI.getRecent({ limit: 10 }),
      ]);

      setSummary(summaryRes.data.data);
      setCategories(catRes.data.data.categoryTotals || []);
      setRecent(recentRes.data.data.transactions || []);

      // Process monthly trends for chart
      const rawTrends = trendsRes.data.data.monthlyTrends || [];
      const processedTrends = rawTrends.map((item) => {
        const income = item.breakdown.find((b) => b.type === 'income')?.total || 0;
        const expense = item.breakdown.find((b) => b.type === 'expense')?.total || 0;
        return {
          month: MONTH_NAMES[item.month - 1],
          income,
          expense,
          net: income - expense,
        };
      });
      setTrends(processedTrends);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isAnalyst]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const summaryCards = summary
    ? [
        {
          label: 'Total Income',
          value: formatCurrency(summary.totalIncome),
          icon: <HiOutlineArrowTrendingUp size={24} />,
          color: 'success',
          gradient: 'var(--gradient-success)',
        },
        {
          label: 'Total Expenses',
          value: formatCurrency(summary.totalExpenses),
          icon: <HiOutlineArrowTrendingDown size={24} />,
          color: 'danger',
          gradient: 'var(--gradient-danger)',
        },
        {
          label: 'Net Balance',
          value: formatCurrency(summary.netBalance),
          icon: <HiOutlineScale size={24} />,
          color: summary.netBalance >= 0 ? 'success' : 'danger',
          gradient: summary.netBalance >= 0 ? 'var(--gradient-primary)' : 'var(--gradient-danger)',
        },
        {
          label: 'Total Records',
          value: summary.totalRecords.toLocaleString(),
          icon: <HiOutlineDocumentText size={24} />,
          color: 'info',
          gradient: 'var(--gradient-info)',
        },
      ]
    : [];

  // Prepare pie data
  const pieData = categories.map((cat, i) => ({
    name: cat.category,
    value: cat.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{payload[0].name || payload[0].payload?.name}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color || entry.fill }}>
              {entry.dataKey || 'Value'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">
            Here's what's happening with your finances
          </p>
        </div>
      </div>

      {/* Summary Cards (Analyst/Admin only) */}
      {isAnalyst() && summary && (
        <div className="summary-cards">
          {summaryCards.map((card, index) => (
            <div
              key={card.label}
              className="summary-card card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="summary-card-icon" style={{ background: card.gradient }}>
                {card.icon}
              </div>
              <div className="summary-card-info">
                <span className="summary-card-label">{card.label}</span>
                <span className="summary-card-value">{card.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts (Analyst/Admin only) */}
      {isAnalyst() && (
        <div className="charts-grid">
          {/* Monthly Trends */}
          <div className="card chart-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="chart-card-header">
              <h3>Monthly Trends</h3>
            </div>
            <div className="chart-card-body">
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state"><p>No trend data available</p></div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card chart-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="chart-card-header">
              <h3>Category Breakdown</h3>
            </div>
            <div className="chart-card-body">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state"><p>No category data available</p></div>
              )}
            </div>
          </div>

          {/* Income vs Expense Bar */}
          <div className="card chart-card chart-card-full animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="chart-card-header">
              <h3>Income vs Expense by Month</h3>
            </div>
            <div className="chart-card-body">
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state"><p>No data available</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card recent-card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="chart-card-header">
          <h3>
            <HiOutlineBanknotes size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Recent Transactions
          </h3>
        </div>
        <div className="table-responsive">
          {recent.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((txn) => (
                  <tr key={txn._id}>
                    <td>{formatDate(txn.date)}</td>
                    <td style={{ fontWeight: 500 }}>{txn.category}</td>
                    <td>
                      <span className={`badge badge-${txn.type}`}>{txn.type}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: txn.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{truncate(txn.description, 50) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <HiOutlineBanknotes size={40} />
              <p>No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
