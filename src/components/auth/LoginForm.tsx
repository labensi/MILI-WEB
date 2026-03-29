import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { loginUser } from '../../firebase/auth';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back! 🌸');
      onSuccess();
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card p-8 w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🌸</div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
        <p className="text-white/70">Sign in to continue to MILI CHAT</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full pl-10 pr-12 py-3 text-white placeholder-white/50 focus:outline-none"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={<LogIn size={20} />}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-white/70">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-[var(--accent)] hover:text-white transition-colors font-semibold"
          >
            Sign Up
          </button>
        </p>
      </div>
    </motion.div>
  );
};
