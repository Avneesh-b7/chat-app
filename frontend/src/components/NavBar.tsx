import React from "react";

/*
Navbar Requirements
1. Branding
   - Display application name "Chat-App" on the left side.
   - Clicking the brand navigates to the home page.
2. Navigation Links
   - "Home" button → navigates to home page.
   - "Chats" button → navigates to chat page.
   - Active route should be visually highlighted.
3. Authentication State Handling
   - If user is NOT logged in:
     - Show "Login" and "Sign Up" buttons.
   - If user IS logged in:
     - Hide "Login" and "Sign Up".
     - Show user section with:
       - User avatar / icon.
       - User name (displayed below or beside icon).
       - "Logout" button.
4. User Interaction & UX
   - Buttons should have hover and active states.
   - Click interactions should be visually responsive.
*/

const NavBar = () => {
  // TODO: Get auth state from context/store to determine if user is logged in
  // TODO: Get current user data (username, avatar) from context/store
  // TODO: Get current route/path to highlight active navigation link
  const isLoggedIn = false; // Placeholder for demo - replace with actual auth state
  const currentUser = { username: "JohnDoe", avatar: "" }; // Placeholder

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Branding */}
          <div className="flex items-center">
            <button
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              // TODO: Add onClick handler to navigate to home page
            >
              Chat-App
            </button>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              // TODO: Add onClick handler to navigate to home page
              // TODO: Add active state styling (e.g., bg-blue-100 text-blue-700) when on home route
            >
              Home
            </button>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              // TODO: Add onClick handler to navigate to chats page
              // TODO: Add active state styling (e.g., bg-blue-100 text-blue-700) when on chats route
            >
              Chats
            </button>
          </div>

          {/* Right: Auth Section */}
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              // Not logged in: Show Login and Sign Up buttons
              <>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  // TODO: Add onClick handler to navigate to login page
                >
                  Login
                </button>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                  // TODO: Add onClick handler to navigate to sign up page
                >
                  Sign Up
                </button>
              </>
            ) : (
              // Logged in: Show user info and logout button
              <div className="flex items-center space-x-4">
                {/* User Avatar and Name */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {/* TODO: Replace with actual user avatar image if available */}
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.username}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-red-300"
                  // TODO: Add onClick handler to logout user (call logout API, clear auth state)
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
