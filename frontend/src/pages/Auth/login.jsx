import React, { useState, useContext } from 'react' // Added useContext
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../components/layouts/AuthLayout'
import Input from '../../components/Inputs/Input'
import { validateEmail } from '../../utils/helper'
import { API_PATHS } from '../../utils/apiPaths'
import axiosInstance from '../../utils/axiosInstance'
import { UserContext } from '../../context/userContext' // Added Import

const Login = () => { // Renamed to PascalCase
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state

  const { updateUser } = useContext(UserContext); // Simplified usage
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }  
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      });
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
        setLoading(false); // Ensure loading stops even on error
    }
  }

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Welcome Back!</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Please enter your login details.
        </p>
        <form onSubmit={handleLogin}>
          <Input
           value={email} 
           onChange={({target})=> setEmail(target.value)}
           label="Email Address"
           placeHolder="kaviya@example.com"
           type="text"
          />
          <Input
           value={password} 
           onChange ={({target})=> setPassword (target.value)}
           label="Password"
           placeHolder="Min 8 characters"
           type="password"
          />
          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className='text-[13px] text-slate-800 mt-3'>Don't have an account?{" "}
            <Link className="font-medium text-primary underline" to="/signUp">Sign Up</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Login // Updated export