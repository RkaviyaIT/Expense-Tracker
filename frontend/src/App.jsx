import React, { useEffect, useState } from 'react'

import {BrowserRouter as Router , Routes ,Route ,Navigate, useNavigate} from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import Login from './pages/Auth/login';
import SignUp from './pages/Auth/SignUp';
import Home from './pages/Dashboard/Home';
import Income from './pages/Dashboard/Income';
import Expense from './pages/Dashboard/Expense';
import AuthLayout from './components/layouts/AuthLayout';
import UserProvider from './context/userContext';
import axiosInstance from './utils/axiosInstance';
import { API_PATHS } from './utils/apiPaths';

const App = () => {
  return (
    <UserProvider>
        <div>
          <Router>
            <Routes>
              <Route path="/" element={<Root/>}/>
              <Route path="/login" exact element={
                  <Login/>
                }/>
              <Route path="/signUp" exact element={
                  <SignUp/>
              }/>
              <Route path="/dashboard" exact element={<Home/>}/>
              <Route path="/income" exact element={<Income/>}/>
              <Route path="/expense" exact element={<Expense/>}/>
            </Routes>
            <Toaster />
          </Router>
        </div>
    </UserProvider>
  )
}

export default App

const Root = () => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChecking(false);
      navigate('/login');
      return;
    }

    // Verify token by requesting user info; if invalid, remove token and go to login
    axiosInstance
      .get(API_PATHS.AUTH.GET_USER_INFO)
      .then(() => {
        navigate('/dashboard');
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  if (checking) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return null;
}