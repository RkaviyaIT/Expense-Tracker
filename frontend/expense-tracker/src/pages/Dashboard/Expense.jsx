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
            <h3 className="text-lg mb-4">Add New Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={formData.icon}
                  onChange={({ target }) => setFormData({ ...formData, icon: target.value })}
                  label="Icon (optional)"
                  placeholder="e.g., 🍔"
                  type="text"
                />
                <Input
                  value={formData.category}
                  onChange={({ target }) => setFormData({ ...formData, category: target.value })}
                  label="Category"
                  placeholder="e.g., Food"
                  type="text"
                />
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