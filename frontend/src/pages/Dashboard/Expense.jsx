import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Input from '../../components/Inputs/Input';
import { LuPlus, LuDownload } from 'react-icons/lu';
import TransactionInfoCard from '../../components/Cards/TransactionInfoCard';
import moment from 'moment';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const Expense = () => {
  useUserAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    icon: '',
    category: '',
    amount: '',
    date: '',
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const categories = [
    'Housing', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Other'
  ];

  const fetchExpenses = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
      if (response.data) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const { icon, category, amount, date } = formData;
    if (!category || !amount || !date) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const response = await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        icon,
        category,
        amount: Number(amount),
        date,
      });
      if (response.data) {
        toast.success('Expense added successfully');
        setFormData({ icon: '', category: '', amount: '', date: '' });
        setShowAddForm(false);
        fetchExpenses();
      }
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Expense_Details.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download Excel');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">Expense</h2>
          <div className="flex gap-3">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <LuPlus /> Add Expense
            </button>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleDownloadExcel}
            >
              <LuDownload /> Download Excel
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-lg mb-4 font-medium text-gray-800">Add New Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Emoji Picker Field */}
                <div className="relative">
                  <label className="text-[13px] text-slate-800 block mb-1">Icon (optional)</label>
                  <div
                    className="input-box flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded p-2"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <span className="text-xl">{formData.icon || '🍔'}</span>
                    <span className="text-sm text-slate-500">Click to choose icon</span>
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute top-16 z-50 shadow-xl">
                      <EmojiPicker
                        onEmojiClick={(emojiObject) => {
                          setFormData({ ...formData, icon: emojiObject.emoji });
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="text-[13px] text-slate-800 block mb-1">Category</label>
                  <select
                    className="w-full bg-transparent outline-none border border-slate-200 rounded p-2.5 text-slate-700 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary"
                    value={formData.category}
                    onChange={({ target }) => setFormData({ ...formData, category: target.value })}
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <Input
                  value={formData.amount}
                  onChange={({ target }) => setFormData({ ...formData, amount: target.value })}
                  label="Amount"
                  placeholder="e.g., 50"
                  type="number"
                />
                <Input
                  value={formData.date}
                  onChange={({ target }) => setFormData({ ...formData, date: target.value })}
                  label="Date"
                  type="date"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary">
                  Add Expense
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h3 className="text-lg mb-4">All Expenses</h3>
          {loading ? (
            <p>Loading...</p>
          ) : expenses.length > 0 ? (
            expenses.map((expense) => (
              <TransactionInfoCard
                key={expense._id}
                title={expense.category}
                icon={expense.icon}
                date={moment(expense.date).format('Do MMM YYYY')}
                amount={expense.amount}
                type="expense"
                onDelete={() => handleDeleteExpense(expense._id)}
              />
            ))
          ) : (
            <p>No expenses found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Expense;