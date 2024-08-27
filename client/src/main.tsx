import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Home from "./Landing/landing";
import Profile from "./Profile/profile.tsx";
// import Signup from "./Signup/signup.tsx";
// import Login from "./Login/login.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/home" element={<Home />} />
      {/* <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> */}
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </BrowserRouter>
);
