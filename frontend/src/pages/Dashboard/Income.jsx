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

const Income = () => {
  useUserAuth();

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    icon: '',
    category: '',
    amount: '',
    date: '',
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const categories = ['Salary', 'Freelance', 'Investments', 'Bonus', 'Rental', 'Other'];

  const fetchIncomes = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
      if (response.data) {
        setIncomes(response.data);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    const { icon, category, amount, date } = formData;
    if (!category || !amount || !date) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const response = await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        icon,
        category,
        amount: Number(amount),
        date,
      });
      if (response.data) {
        toast.success('Income added successfully');
        setFormData({ icon: '', category: '', amount: '', date: '' });
        setShowAddForm(false);
        fetchIncomes();
      }
    } catch (error) {
      toast.error('Failed to add income');
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      toast.success('Income deleted successfully');
      fetchIncomes();
    } catch (error) {
      toast.error('Failed to delete income');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Income_Details.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download Excel');
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">Income</h2>
          <div className="flex gap-3">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <LuPlus /> Add Income
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
            <h3 className="text-lg mb-4 font-medium text-gray-800">Add New Income</h3>
            <form onSubmit={handleAddIncome}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Emoji Picker Field */}
                <div className="relative">
                  <label className="text-[13px] text-slate-800 block mb-1">Icon (optional)</label>
                  <div
                    className="input-box flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded p-2"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <span className="text-xl">{formData.icon || '💼'}</span>
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
                  placeholder="e.g., 5000"
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
                  Add Income
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
          <h3 className="text-lg mb-4">All Incomes</h3>
          {loading ? (
            <p>Loading...</p>
          ) : incomes.length > 0 ? (
            incomes.map((income) => (
              <TransactionInfoCard
                key={income._id}
                title={income.category}
                icon={income.icon}
                date={moment(income.date).format('Do MMM YYYY')}
                amount={income.amount}
                type="income"
                onDelete={() => handleDeleteIncome(income._id)}
              />
            ))
          ) : (
            <p>No incomes found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Income;