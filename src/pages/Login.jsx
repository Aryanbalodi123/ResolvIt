import React, { useState } from "react";
import { loginUser, loginAdmin } from "../../services/AuthServices";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "", show: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword , setShowPassword] = useState(false);

  const showAlert = (message, type = "error") => {
    setAlert({ message, type, show: true });
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const validateForm = () => {
    if (!selectedRole) {
      showAlert("Please select a role (User or Admin)");
      return false;
    }
    if (!rollNumber.trim()) {
      showAlert("Please enter your roll number");
      return false;
    }

    if (!password.trim()) {
      showAlert("Please enter your password");
      return false;
    }

    if (password.length < 6) {
      showAlert("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (selectedRole == "user") {
        const user = await loginUser(rollNumber, password);
        localStorage.setItem("token", JSON.stringify(user));
        showAlert(`Welcome back, ${user.name}!`, "success");
        navigate("/dashboard");
      }
      
      else {
        const admin = await loginAdmin(rollNumber, password);
        localStorage.setItem("token", JSON.stringify(admin));
        showAlert(`Welcome back, ${admin.name}!`, "success");
        navigate("/dashboard");
        console.log("Logged in admin:", admin);
        navigate("/admin");
      }
    } catch (error) {
      setIsLoading(false);
      showAlert(error.message, "error");
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAlert((prev) => ({ ...prev, show: false }));
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    showAlert(
      "Password reset functionality would be implemented here",
      "success"
    );
  };

  const handleSignUpClick = (e) => {
  e.preventDefault();
  navigate("/register"); 
};


  return (
     <div className="flex min-h-screen bg-white font-['Poppins',sans-serif] overflow-x-hidden">
      {/* Left Section */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-br-[60px] rounded-tr-[60px] flex-col justify-center items-center relative overflow-hidden animate-[slideInLeft_1s_ease-out]">
        <div className="absolute w-[150px] h-[150px] bg-white/10 rounded-full top-[10%] -left-[40px] animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute w-[120px] h-[120px] bg-white/5 rounded-full bottom-[20%] -right-[25px] animate-[floatReverse_4s_ease-in-out_infinite]"></div>
     <img
          src="https://niceillustrations.com/wp-content/uploads/2021/12/Call-Center-color-800px.png"
          alt="Call Center Illustration"
          className="max-w-[45%] max-h-[60vh] h-auto animate-[bounce_3s_ease-in-out_infinite] z-10 relative drop-shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
          style={{ animationName: 'none' }} 
        />

  <div className="text-center z-10 mt-6">
    <h1 className="text-3xl font-bold mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      Welcome Back!
    </h1>
    <p className="text-base opacity-90 leading-relaxed">
      Access your support dashboard and
      <br />
      help resolve customer issues efficiently
    </p>
  </div>
</div>


      {/* Right Section */}
       <div className="flex-1 flex justify-center items-center bg-white rounded-tl-[60px] rounded-bl-[60px] md:-ml-16 md:pl-24 px-4 py-8 animate-[slideInRight_1s_ease-out] relative z-10">
        <div className="w-full max-w-xs animate-[fadeInUp_1s_ease-out_0.3s_both] mx-auto">
      {/* Logo */}
          <div className="text-center text-4xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-8 relative">
            ResolvIt
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-sm"></div>
          </div>

          <h2 className="text-2xl mb-6 text-left text-gray-800 font-semibold">
            Sign in
          </h2>

          {/* Alert */}
          {alert.show && (
            <div
              className={`p-2.5 px-3 rounded-lg mb-4 text-sm font-medium ${
                alert.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}
            >
              {alert.message}
            </div>
          )}

          <div>
            {/* Role Selection */}
<div className="mb-3"> 
  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2.5 font-semibold">
    Select Role
  </label>
  <div className="flex flex-col sm:flex-row gap-2"> 
    <button
      type="button"
      onClick={() => handleRoleSelect("user")}
      className={`w-full sm:w-auto px-4 py-2 border-2 rounded-xl font-medium cursor-pointer transition-all duration-300 text-sm ${
        selectedRole === "user"
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-md"
          : "border-gray-200 bg-white text-gray-600 hover:border-emerald-500 hover:text-emerald-500"
      }`}
    >
      <i className="fas fa-user mr-2"></i> User
    </button>

    <button
      type="button"
      onClick={() => handleRoleSelect("admin")}
      className={`w-full sm:w-auto px-4 py-2 border-2 rounded-xl font-medium cursor-pointer transition-all duration-300 text-sm ${
        selectedRole === "admin"
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-md"
          : "border-gray-200 bg-white text-gray-600 hover:border-emerald-500 hover:text-emerald-500"
      }`}
    >
      <i className="fas fa-user-shield mr-2"></i> Admin
    </button>
  </div>
</div>

{/* Roll Number Input */}
<div className="relative mb-4 group"> 
  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
    Roll Number
  </label>
  <input
    type="text"
    value={rollNumber}
    onChange={(e) => setRollNumber(e.target.value)}
    placeholder=""
    required
    className="w-full border-0 border-b-2 border-gray-200 py-3 text-sm bg-transparent text-gray-800 transition-all duration-300 placeholder-gray-400"
  />
</div>


            {/* Password Input */}
            <div className="relative mb-4 group">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                Password
              </label>
              <input
              type={showPassword ? "text" : "password"}  
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full border-0 border-b-2 border-gray-200 py-3 text-sm bg-transparent text-gray-800 transition-all duration-300 placeholder-gray-400 pr-10"
                />
                <button
          type="button"
          onClick={() => setShowPassword(!showPassword)} 
          className="absolute right-2 top-9 text-gray-400 hover:text-emerald-500 transition-colors"
        >
          <i
            className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
          ></i>{" "}
        </button>
        </div>

            {/* Options */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <label className="flex items-center text-gray-500 cursor-pointer transition-colors duration-300 hover:text-emerald-500">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 scale-110 cursor-pointer accent-emerald-500"
                />
                Remember me
              </label>
              <a
                href="#"
                onClick={handleForgotPassword}
                className="text-emerald-500 font-medium transition-all duration-300 hover:text-emerald-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none rounded-xl cursor-pointer font-semibold text-sm mb-5 relative overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(16,185,129,0.4)] active:transform active:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Signing in...
                </>
              ) : (
                <>
                  Sign in <i className="fas fa-arrow-right ml-2"></i>
                </>
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm mb-5 text-gray-500">
            Don't have an account?{" "}
            <a
              href="#"
              onClick={handleSignUpClick}
              className="text-emerald-500 font-semibold transition-colors duration-300 hover:text-emerald-600 hover:underline"
            >
              Create one here
            </a>
          </div>
        </div>
      </div>


     
    </div>
  );
};

export default Login;
