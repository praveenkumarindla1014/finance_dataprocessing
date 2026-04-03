import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import {
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineUserPlus,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      // Auto-login after registration
      const { token, user } = res.data.data;
      localStorage.setItem('finance_token', token);
      localStorage.setItem('finance_user', JSON.stringify(user));

      toast.success(`Account created as ${form.role}! Redirecting...`);

      // Small delay so user sees the toast
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setForm({ name: '', email: '', password: '', role: 'viewer' });
  };

  return (
    <div className="login-page">
      {/* Theme toggle */}
      <button className="login-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
      </button>

      {/* Left decorative panel */}
      <div className="login-hero">
        <div className="login-hero-content">
          <div className="login-hero-logo">
            <HiOutlineShieldCheck size={48} />
          </div>
          <h1>FinDash</h1>
          <p>Finance Data Processing & Access Control Dashboard</p>
          <div className="login-hero-features">
            <div className="login-hero-feature">
              <span className="login-feature-dot"></span>
              Real-time analytics
            </div>
            <div className="login-hero-feature">
              <span className="login-feature-dot"></span>
              Role-based access control
            </div>
            <div className="login-hero-feature">
              <span className="login-feature-dot"></span>
              Secure financial records
            </div>
          </div>
        </div>
        <div className="login-hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
      </div>

      {/* Form section */}
      <div className="login-form-section">
        <div className="login-form-container animate-fade-in-up" key={isSignUp ? 'signup' : 'login'}>
          <div className="login-form-header">
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Sign up to get started with FinDash' : 'Sign in to your account to continue'}</p>
          </div>

          <form
            onSubmit={isSignUp ? handleSignUp : handleLogin}
            className="login-form"
            id={isSignUp ? 'signup-form' : 'login-form'}
          >
            {/* Name — Sign Up only */}
            {isSignUp && (
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder={isSignUp ? 'Min 6 characters' : 'Enter your password'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  minLength={isSignUp ? 6 : undefined}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            {/* Role — Sign Up only */}
            {isSignUp && (
              <div className="form-group">
                <label className="form-label" htmlFor="signup-role">Account Role</label>
                <div className="role-selector">
                  {[
                    { value: 'viewer', label: 'Viewer', desc: 'View records only' },
                    { value: 'analyst', label: 'Analyst', desc: 'View + create + analytics' },
                    { value: 'admin', label: 'Admin', desc: 'Full access + user management' },
                  ].map((role) => (
                    <label
                      key={role.value}
                      className={`role-option ${form.role === role.value ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={form.role === role.value}
                        onChange={handleChange}
                        className="role-radio"
                      />
                      <span className={`role-badge badge badge-${role.value}`}>{role.label}</span>
                      <span className="role-desc">{role.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={loading}
              id={isSignUp ? 'signup-submit' : 'login-submit'}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {isSignUp ? <HiOutlineUserPlus size={18} /> : <HiOutlineArrowRightOnRectangle size={18} />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Switch between Login / Sign Up */}
          <div className="login-switch">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button type="button" className="login-switch-btn" onClick={switchMode}>
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>

          {/* Demo Credentials — Login only */}
          {!isSignUp && (
            <div className="login-demo-info">
              <p className="login-demo-title">Quick Demo Access</p>
              <div className="login-demo-cards">
                <button
                  type="button"
                  className="login-demo-card"
                  onClick={() => setForm({ ...form, email: 'admin@findash.com', password: 'admin123' })}
                >
                  <span className="badge badge-admin">Admin</span>
                  <span className="login-demo-email">admin@findash.com</span>
                </button>
                <button
                  type="button"
                  className="login-demo-card"
                  onClick={() => setForm({ ...form, email: 'analyst@findash.com', password: 'analyst123' })}
                >
                  <span className="badge badge-analyst">Analyst</span>
                  <span className="login-demo-email">analyst@findash.com</span>
                </button>
                <button
                  type="button"
                  className="login-demo-card"
                  onClick={() => setForm({ ...form, email: 'viewer@findash.com', password: 'viewer123' })}
                >
                  <span className="badge badge-viewer">Viewer</span>
                  <span className="login-demo-email">viewer@findash.com</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
