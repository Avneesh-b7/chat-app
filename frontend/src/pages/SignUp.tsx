import React, { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import ThemeToggle from "../components/ThemeToggle.js";

/**
 * SignUp Page Component - Light & Dark Theme Support
 *
 * Features:
 * - Username, email, and password input fields
 * - Client-side validation with real-time feedback
 * - Password strength indicator
 * - Show/hide password toggle
 * - Loading state during submission
 * - Error handling with clear messages
 * - Link to login page for existing users
 * - Fully accessible with ARIA labels and keyboard navigation
 * - Light/Dark theme toggle with persistent preference
 */

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

type PasswordStrength = "weak" | "medium" | "strong" | null;

const SignUp: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  /**
   * Validate email format using regex
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Calculate password strength based on length and character variety
   */
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) return null;
    if (password.length < 6) return "weak";

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength >= 3) return "strong";
    if (strength >= 2) return "medium";
    return "weak";
  };

  /**
   * Validate a single field
   */
  const validateField = (
    name: keyof FormData,
    value: string
  ): string | undefined => {
    switch (name) {
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (value.length > 20)
          return "Username must be less than 20 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "Username can only contain letters, numbers, and underscores";
        }
        return undefined;

      case "email":
        if (!value.trim()) return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email address";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return undefined;

      default:
        return undefined;
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.username = validateField("username", formData.username);
    newErrors.email = validateField("email", formData.email);
    newErrors.password = validateField("password", formData.password);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  /**
   * Handle input change with real-time validation
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Real-time validation for touched fields
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  };

  /**
   * Mark field as touched on blur (for validation timing)
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof FormData;
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    // Validate on blur
    const error = validateField(fieldName, formData[fieldName]);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Replace with actual API call to backend
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      // Success - redirect to login or home
      console.log("Registration successful!");
      // TODO: Handle successful registration (e.g., redirect to /login or auto-login)
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-md">
        {/* Theme Toggle - Top Right */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create your account on <i>ChatApp</i>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join us and start chatting with your friends
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} noValidate>
            {/* General Error Message */}
            {errors.general && (
              <div
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-lg text-red-700 dark:text-red-400 text-sm"
                role="alert"
                aria-live="polite"
              >
                {errors.general}
              </div>
            )}

            {/* Username Field */}
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 ${
                  errors.username && touched.username
                    ? "border-red-300 dark:border-red-500/50 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                } disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
                placeholder="Choose a username"
                aria-invalid={
                  errors.username && touched.username ? "true" : "false"
                }
                aria-describedby={
                  errors.username && touched.username
                    ? "username-error"
                    : undefined
                }
              />
              {errors.username && touched.username && (
                <p
                  id="username-error"
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 ${
                  errors.email && touched.email
                    ? "border-red-300 dark:border-red-500/50 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                } disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
                placeholder="you@example.com"
                aria-invalid={errors.email && touched.email ? "true" : "false"}
                aria-describedby={
                  errors.email && touched.email ? "email-error" : undefined
                }
              />
              {errors.email && touched.email && (
                <p
                  id="email-error"
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 ${
                    errors.password && touched.password
                      ? "border-red-300 dark:border-red-500/50 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
                  placeholder="Create a strong password"
                  aria-invalid={
                    errors.password && touched.password ? "true" : "false"
                  }
                  aria-describedby={
                    errors.password && touched.password
                      ? "password-error"
                      : undefined
                  }
                />
                {/* Show/Hide Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:text-gray-700 dark:focus:text-gray-200 disabled:cursor-not-allowed transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p
                  id="password-error"
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}

              {/* Password Strength Indicator */}
              {formData.password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === "weak"
                            ? "w-1/3 bg-red-500"
                            : passwordStrength === "medium"
                            ? "w-2/3 bg-yellow-500"
                            : "w-full bg-green-500"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength === "weak"
                          ? "text-red-600 dark:text-red-400"
                          : passwordStrength === "medium"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {passwordStrength.charAt(0).toUpperCase() +
                        passwordStrength.slice(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:bg-blue-400 dark:disabled:bg-blue-500/50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:underline transition-colors"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
