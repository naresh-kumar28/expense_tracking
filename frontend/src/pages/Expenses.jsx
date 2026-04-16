import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Edit, Trash2, IndianRupee, AlertCircle, Receipt } from 'lucide-react';
import { expenseService } from '../services/api';
import { getCategoryColorCode } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function Expenses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ amount: '', category: '', date: '', description: '' });

  // Initial Data Fetch
  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getExpenses();
      setExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await expenseService.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // Form Handlers
  const handleOpenModal = (expense = null) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/expenses' } } });
      return;
    }

    if (expense) {
      setEditingExpense(expense);
      setFormData({
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({ amount: '', category: '', date: new Date().toISOString().split('T')[0], description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, formData);
      } else {
        await expenseService.createExpense(formData);
      }
      closeModal();
      fetchExpenses(); // Refresh table
      fetchCategories(); // Refresh dynamic categories incase a new one was added
    } catch (error) {
      alert("Error saving expense. Please check your data.");
      console.error(error);
    }
  };

  // Delete Handlers
  const confirmDelete = (id) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      await expenseService.deleteExpense(deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
      fetchExpenses();
      fetchCategories();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // Safe formatting for Rupee
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // Filter Logic
  const filteredExpenses = expenses.filter(exp => {
    const matchSearch = exp.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = categoryFilter ? exp.category === categoryFilter : true;
    const matchStart = startDate ? new Date(exp.date) >= new Date(startDate) : true;
    const matchEnd = endDate ? new Date(exp.date) <= new Date(endDate) : true;
    
    return matchSearch && matchCategory && matchStart && matchEnd;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Expenses List</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" /> Add Expense
        </button>
      </div>

      {/* Filters Section (Mobile Responsive) */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-neutral-500 mb-2">
          <Filter className="h-4 w-4" /> <h3 className="font-medium text-sm">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field" 
            title="Start Date"
          />
          
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field" 
            title="End Date"
          />
        </div>
      </div>

      {/* Expenses Table/List (Table on Desktop, Cards on Mobile) */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-neutral-500">Loading expenses...</div>
          ) : filteredExpenses.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-dark-border text-neutral-500 dark:text-neutral-400 text-sm">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Category / Description</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-border">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{exp.date}</td>
                    <td className="p-4">
                      {/* Badge ki style inline set ho rahi hai dynamically generate hue color code se */}
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border border-transparent dark:opacity-90 mb-1"
                        style={{ 
                          backgroundColor: `${getCategoryColorCode(exp.category)}1A`, // 1A is 10% opacity in hex
                          color: getCategoryColorCode(exp.category),
                          borderColor: `${getCategoryColorCode(exp.category)}33` // 33 is 20% opacity border
                        }}
                      >
                        {exp.category}
                      </span>
                      {exp.description && <p className="text-xs text-neutral-500 truncate max-w-xs">{exp.description}</p>}
                    </td>
                    <td className="p-4 font-bold text-neutral-900 dark:text-white">{formatMoney(exp.amount)}</td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => handleOpenModal(exp)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors inline-block dark:hover:bg-blue-500/10">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => confirmDelete(exp.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block dark:hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4 text-neutral-500">
                <Receipt className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">No expenses found</h3>
              <p className="text-neutral-500 dark:text-neutral-400">Try adjusting your filters or add a new expense.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-6 dark:text-white">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                {/* Dynamically entered user category */}
                <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Category <span className="text-red-500">*</span></label>
                <input required type="text" list="category-list" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field" placeholder="Type or select category (Food, Cloth etc.)" />
                <datalist id="category-list">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Amount (₹) <span className="text-red-500">*</span></label>
                  <input required type="number" min="1" step="any" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Date <span className="text-red-500">*</span></label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Description (Optional)</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field resize-none" placeholder="Paneer, Samosa, T-shirt, Jeans etc." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-dark-border">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary flex-1 sm:flex-none">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Delete Expense</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteOpen(false)} className="btn-outline">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
