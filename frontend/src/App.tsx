import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import HomePage from "./pages/homePage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import ChatPage from "./pages/chatPage";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/chat" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/chat" /> : <SignUpPage />}
        />

        {/* Protected routes */}
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

/*
  This routing setup includes:                                                                                                                                                        
  - Public routes: / (home), /login, /signup                                                                                                                                          
  - Protected route: /chat (redirects to login if not authenticated)                                                                                                                  
  - Route guards: Login/signup redirect to chat if already authenticated                                                                                                              
  - Fallback: Any unknown route redirects to home 
  */
