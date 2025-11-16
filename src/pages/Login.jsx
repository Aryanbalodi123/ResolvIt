import React, { useState } from "react";
import { loginUser, loginAdmin } from "../../services/AuthServices";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "", show: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    
    const trimmedRollNumber = rollNumber.trim();
    if (!trimmedRollNumber) {
      showAlert("Please enter your roll number");
      return false;
    }
    
    if (!/^\d+$/.test(trimmedRollNumber)) {
      showAlert("Roll Number must contain only digits");
      return false;
    }

    if (trimmedRollNumber.length !== 10) {
      showAlert("Roll Number must be exactly 10 digits");
      return false;
    }
    
    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      showAlert("Please enter your password");
      return false;
    }

    if (trimmedPassword.length < 6) {
      showAlert("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData =
        selectedRole === "user"
          ? await loginUser(rollNumber.trim(), password.trim())
          : await loginAdmin(rollNumber.trim(), password.trim());

      localStorage.setItem("token", JSON.stringify({
        role: selectedRole,
        rollNumber: userData.rollNumber,
        name: userData.name
      }));
      localStorage.setItem("role", selectedRole);
      localStorage.setItem("rollNumber", userData.rollNumber);
      localStorage.setItem("name", userData.name);

      showAlert(`Welcome back, ${userData.name}!`, "success");

      navigate(selectedRole === "user" ? "/dashboard" : "/admin");
    } catch (error) {
      // --- FIX: More specific error handling ---
      console.error("Login Error:", error); // For developer debugging
      
      const errorMessage = error.message ? error.message.toLowerCase() : "";

      if (errorMessage.includes("not found") || errorMessage.includes("user not exist")) {
        // Case 1: User doesn't exist
        showAlert(`No ${selectedRole} found with this roll number.`, "error");
      } else if (errorMessage.includes("invalid password") || errorMessage.includes("wrong password")) {
        // Case 2: Wrong password
        showAlert("Incorrect password. Please try again.", "error");
      } else if (errorMessage.includes("invalid credentials")) {
        // Fallback for general auth error
         showAlert("Invalid roll number or password.", "error");
      }
      else if (error.name === 'TypeError' || errorMessage.includes('failed to fetch') || errorMessage.includes('network request failed')) {
        // Network or connection error
        showAlert("Network error. Please check your internet connection.", "error");
      } else {
        // All other errors (500s, DB errors, unexpected issues)
        showAlert("An unexpected error occurred. Please try again later.", "error");
      }
      // --- END FIX ---
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    showAlert("Password reset functionality coming soon", "success");
  };

  return (
    <div className="flex min-h-screen bg-white font-['Poppins',sans-serif] overflow-x-hidden">
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-br-[60px] rounded-tr-[60px] flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute w-[150px] h-[150px] bg-white/10 rounded-full top-[10%] -left-[40px]"></div>
        <div className="absolute w-[120px] h-[120px] bg-white/5 rounded-full bottom-[20%] -right-[25px]"></div>
        <img
          src="https://niceillustrations.com/wp-content/uploads/2021/12/Call-Center-color-800px.png"
          alt="Call Center Illustration"
          className="max-w-[45%] max-h-[60vh] h-auto z-10 relative drop-shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
        />
        <div className="text-center z-10 mt-6">
          <h1 className="text-3xl font-bold mb-3">Welcome Back!</h1>
          <p className="text-base opacity-90">
            Access your support dashboard and help resolve issues efficiently
          </p>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center bg-white rounded-tl-[60px] rounded-bl-[60px] md:-ml-16 md:pl-24 px-4 py-8 relative z-10">
        <div className="w-full max-w-xs mx-auto">
          <div className="text-center text-4xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-8 relative">
            ResolvIt
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-sm"></div>
          </div>

          <h2 className="text-2xl mb-6 text-left text-gray-800 font-semibold">
            Sign in
          </h2>

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

          <div className="mb-3">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2.5 font-semibold">
              Select Role
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              {["user", "admin"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`w-full sm:w-auto px-4 py-2 border-2 rounded-xl font-medium cursor-pointer transition-all duration-300 text-sm ${
                    selectedRole === role
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-md"
                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-500 hover:text-emerald-500"
                  }`}
                >
                  <i
                    className={`fas ${
                      role === "user" ? "fa-user" : "fa-user-shield"
                    } mr-2`}
                  ></i>{" "}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-4">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
              Roll Number
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full border-0 border-b-2 border-gray-200 py-3 text-sm bg-transparent text-gray-800 transition-all duration-300"
            />
          </div>

          <div className="relative mb-4">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 border-b-2 border-gray-200 py-3 text-sm bg-transparent text-gray-800 transition-all duration-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9 text-gray-400 hover:text-emerald-500"
            >
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              ></i>
            </button>
          </div>

          <div className="flex justify-between items-center mb-4 text-sm">
            <label className="flex items-center text-gray-500 cursor-pointer hover:text-emerald-500">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 scale-110 cursor-pointer accent-emerald-500"
              />
              Remember me
            </label>
          
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none rounded-xl font-semibold text-sm mb-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(16,185,129,0.4)] active:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
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

          <div className="text-center text-sm mb-5 text-gray-500">
            Don't have an account?{" "}
            <a
              href="#"
              onClick={() => navigate("/register")}
              className="text-emerald-500 font-semibold hover:text-emerald-600 hover:underline"
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