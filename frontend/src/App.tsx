import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp.js";
import Login from "./pages/Login.js";
import NavBar from "./components/NavBar.js";

function App() {
  return (
    <>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
