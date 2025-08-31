import React, { useState, useEffect } from 'react';
import { registerUser,registerAdmin } from '../../services/AuthServices';
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom"; 

const Register = () => {
    const navigate = useNavigate(); 
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '', 
    email: '',
    rollNumber: '',
    password: '',
  });
  
  // Separate state for confirmPassword - not included in formData
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: 'Password strength' });
  const [passwordMatch, setPasswordMatch] = useState({ matches: null, text: '' });
  const [alert, setAlert] = useState({ message: '', type: '', show: false });
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (message, type = 'error') => {
    setAlert({ message, type, show: true });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleInputChange = (field, value) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setPasswordVisible(!passwordVisible);
    } else {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ level: 0, text: 'Password strength' });
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    let text, className;
    if (strength <= 2) {
      text = 'Weak';
      className = 'strength-weak';
    } else if (strength <= 4) {
      text = 'Medium';
      className = 'strength-medium';
    } else {
      text = 'Strong';
      className = 'strength-strong';
    }

    setPasswordStrength({ level: strength, text, className });
  };

  const checkPasswordMatch = () => {
    if (!confirmPassword) {
      setPasswordMatch({ matches: null, text: '' });
      return;
    }

    if (formData.password === confirmPassword) {
      setPasswordMatch({ matches: true, text: 'Passwords match ✓' });
    } else {
      setPasswordMatch({ matches: false, text: 'Passwords do not match ✗' });
    }
  };

  useEffect(() => {
    checkPasswordStrength(formData.password);
  }, [formData.password]);

  useEffect(() => {
    checkPasswordMatch();
  }, [formData.password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      showAlert('Please select a role');
      return;
    }

    if (formData.password !== confirmPassword) {
      showAlert('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      showAlert('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        rollNumber: formData.rollNumber,
        password: await bcrypt.hash(formData.password,10),
      };
      if(selectedRole=='user'){
      await registerUser(payload);}
      else{
        await registerAdmin(payload)
      }
      showAlert('User registered successfully!', 'success');
    } catch (err) {
      showAlert(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthBarWidth = () => {
    return `${(passwordStrength.level / 5) * 100}%`;
  };

  const getStrengthBarColor = () => {
    if (passwordStrength.className === 'strength-weak') return 'bg-red-500';
    if (passwordStrength.className === 'strength-medium') return 'bg-amber-500';
    if (passwordStrength.className === 'strength-strong') return 'bg-emerald-500';
    return 'bg-gray-300';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white font-['Poppins',sans-serif]">
      {/* Left Section */}
      <div className="flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-br-[50px] rounded-tr-[50px] flex flex-col justify-center items-center relative overflow-hidden animate-[slideInLeft_1s_ease-out]">
        <img 
          src="https://niceillustrations.com/wp-content/uploads/2021/12/Call-Center-color-800px.png" 
          alt="Illustration" 
          className="max-w-[45%] h-auto animate-[bounce_3s_ease-in-out_infinite] drop-shadow-[0_6px_15px_rgba(0,0,0,0.2)]"
        />
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold mb-2">Join ResolvIt!</h1>
          <p className="text-sm opacity-90">Create your account to manage and resolve complaints efficiently</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex justify-center items-center bg-white rounded-tl-[50px] rounded-bl-[50px] -ml-12 px-3 py-3 pl-20 animate-[slideInRight_1s_ease-out] overflow-y-auto">
        <div className="w-full max-w-[300px] animate-[fadeInUp_1s_ease-out_0.3s_both]">
          {/* Logo */}
          <div className="text-center text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-3 relative">
            ResolvIt
          </div>
          
          <h2 className="text-base mb-2 font-semibold">Create Account</h2>

          {/* Role Selection */}
          <div className="mb-2">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleRoleSelect('user')}
                className={`border-none rounded-md py-2 px-2.5 text-xs font-semibold cursor-pointer transition-all duration-300 text-center ${
                  selectedRole === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 transform -translate-y-1 shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                    : 'bg-gray-50 text-gray-500 border-2 border-gray-200 hover:bg-green-50 hover:text-emerald-600 hover:border-emerald-500'
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`border-none rounded-md py-2 px-2.5 text-xs font-semibold cursor-pointer transition-all duration-300 text-center ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 transform -translate-y-1 shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                    : 'bg-gray-50 text-gray-500 border-2 border-gray-200 hover:bg-green-50 hover:text-emerald-600 hover:border-emerald-500'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Alert */}
          {alert.show && (
            <div className={`p-2 rounded-md mb-2 text-xs ${
              alert.type === 'error' 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-green-50 text-green-600 border border-green-200'
            }`}>
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-2">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="text-black w-full border-0 border-b-2 border-gray-200 py-2 pr-6 text-xs bg-transparent transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:transform focus:-translate-y-1"
              />
            </div>

            {/* Email */}
            <div className="mb-2">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                required
                className="text-black w-full border-0 border-b-2 border-gray-200 py-2 pr-6 text-xs bg-transparent transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:transform focus:-translate-y-1"
              />
            </div>

            {/* Roll Number */}
            <div className="mb-2">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                Roll Number
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                required
                className="text-black w-full border-0 border-b-2 border-gray-200 py-2 pr-6 text-xs bg-transparent transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:transform focus:-translate-y-1"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="text-black w-full border-0 border-b-2 border-gray-200 py-2 pr-6 text-xs bg-transparent transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:transform focus:-translate-y-1"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-0 top-2 bg-none border-none cursor-pointer text-gray-500 p-0 w-5 h-3 flex items-center justify-center text-xs hover:text-emerald-500"
                >
                  <i className={`fas ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {/* Password Strength */}
              <div className="mt-0.5 text-xs">
                <div className="w-full h-0.5 bg-gray-200 rounded-sm my-0.5 overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-400 rounded-sm ${getStrengthBarColor()}`}
                    style={{ width: getStrengthBarWidth() }}
                  ></div>
                </div>
                <span className="text-gray-500 text-xs">{passwordStrength.text}</span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-2">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="text-black w-full border-0 border-b-2 border-gray-200 py-2 pr-6 text-xs bg-transparent transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:transform focus:-translate-y-1"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-0 top-2 bg-none border-none cursor-pointer text-gray-500 p-0 w-5 h-3 flex items-center justify-center text-xs hover:text-emerald-500"
                >
                  <i className={`fas ${confirmPasswordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {/* Password Match Indicator */}
              {passwordMatch.text && (
                <span className={`text-xs mt-0.5 ${passwordMatch.matches ? 'text-emerald-500' : 'text-red-500'}`}>
                  {passwordMatch.text}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 border-none rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold cursor-pointer mt-2 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_6px_15px_rgba(16,185,129,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i> Creating Account...
                </>
              ) : (
                <>
                  Create Account <i className="fas fa-arrow-right ml-1"></i>
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center text-xs mt-3">
            Already have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="text-emerald-500 font-semibold hover:underline"
            >
              Sign in here
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @media (max-width: 768px) {
          .flex {
            flex-direction: column;
          }
          
          .flex-1:first-child {
            border-radius: 0 0 40px 40px;
            padding: 40px 20px;
          }
          
          .flex-1:last-child {
            border-radius: 40px 40px 0 0;
            margin-left: 0;
            margin-top: -40px;
            padding: 60px 20px 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;