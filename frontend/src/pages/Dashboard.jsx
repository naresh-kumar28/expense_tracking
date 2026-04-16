import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, IndianRupee, TrendingUp, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { expenseService } from '../services/api';
import { getCategoryColorCode } from '../utils/helpers';

export default function Dashboard() {
  const [data, setData] = useState({
    total_spending: 0,
    current_month_spending: 0,
    top_category: '-',
    category_totals: [],
    recent_expenses: []
  });
  const [loading, setLoading] = useState(true);

  // Backend se dashboard summary fetch karna
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getDashboardSummary();
      setData(res.data);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center p-8 text-neutral-500">Loading dashboard...</div>;
  }

  // Paise format karne ke liye chhota sa helper function (Indian formatting ₹)
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard Overview</h1>
        <button onClick={fetchDashboardData} className="text-primary-600 hover:text-primary-500 font-medium text-sm">
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none shadow-primary-500/20 shadow-xl">
          <div className="flex items-center justify-between opacity-90 mb-4">
            <h3 className="font-medium text-primary-50">Total Spending</h3>
            <IndianRupee className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold">{formatMoney(data.total_spending || 0)}</p>
          <p className="text-sm mt-2 opacity-80 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> All time expense
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-4">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">This Month</h3>
            <ArrowDownRight className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{formatMoney(data.current_month_spending || 0)}</p>
          <p className="text-sm mt-2 text-neutral-500 dark:text-neutral-400">Current month limit</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-4">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Top Category</h3>
            <ArrowUpRight className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white truncate" title={data.top_category || 'N/A'}>
            {data.top_category || 'No Expenses'}
          </p>
          <p className="text-sm mt-2 text-neutral-500 dark:text-neutral-400">Highest spending area</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <div className="card col-span-1 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Spending by Category</h3>
          <div className="flex-1 w-full relative">
            {data.category_totals?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" className={"absolute inset-0"}>
                <PieChart>
                  <Pie
                    data={data.category_totals}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.category_totals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColorCode(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatMoney(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400 italic">No chart data available</div>
            )}
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="card col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold dark:text-white">Recent Transactions</h3>
            <Clock className="h-5 w-5 text-neutral-400" />
          </div>
          
          <div className="space-y-2">
            {data.recent_expenses?.length > 0 ? (
              data.recent_expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group border border-transparent hover:border-neutral-100 dark:hover:border-dark-border">
                  <div className="flex items-center gap-4">
                    {/* Yaha bhi color mapping use kar rahe hai initials badge ke liye */}
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center font-bold shadow-sm"
                      style={{ 
                        backgroundColor: `${getCategoryColorCode(expense.category)}20`,
                        color: getCategoryColorCode(expense.category)
                      }}
                    >
                      {expense.category.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">{expense.category}</h4>
                      {expense.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[150px]">
                          {expense.description} {expense.date}
                        </p>
                      )}
                      
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900 dark:text-white">{formatMoney(expense.amount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-neutral-400 italic">No recent transactions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
