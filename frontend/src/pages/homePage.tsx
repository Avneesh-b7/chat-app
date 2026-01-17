import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    // Landing page for non-authenticated users
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to ChatApp
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with friends and family instantly
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Messaging
              </h3>
              <p className="text-gray-600 text-sm">
                Send and receive messages instantly
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600 text-sm">
                Your conversations are protected
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Always Connected
              </h3>
              <p className="text-gray-600 text-sm">
                Stay in touch from anywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user home page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ChatApp</h1>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-600 mb-6">
            Select a conversation or start a new chat
          </p>

          <Link
            to="/chat"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Chat
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
