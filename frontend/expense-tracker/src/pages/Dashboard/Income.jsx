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
            <h3 className="text-lg mb-4">Add New Income</h3>
            <form onSubmit={handleAddIncome}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={formData.icon}
                  onChange={({ target }) => setFormData({ ...formData, icon: target.value })}
                  label="Icon (optional)"
                  placeholder="e.g., 💼"
                  type="text"
                />
                <Input
                  value={formData.category}
                  onChange={({ target }) => setFormData({ ...formData, category: target.value })}
                  label="Category"
                  placeholder="e.g., Salary"
                  type="text"
                />
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