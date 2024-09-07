import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Home from "./Pages/landing.tsx";
import Profile from "./Pages/profile.tsx";
import Signup from "./Pages/signup.tsx";
import Login from "./Pages/login.tsx";
import Collections from "./Pages/collections.tsx";
import NewCollectionForm from "./Pages/new_collection_form.tsx";
import NewCollectionStart from "./Pages/new_collection_start.tsx";
import NewCollectionSearchMatches from "./Pages/new_collection_search_matches.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/new_collection_form" element={<NewCollectionForm />} />
      <Route path="/new_collection_start" element={<NewCollectionStart />} />
      <Route path="/new_collection_search_matches" element={<NewCollectionSearchMatches />} />
    </Routes>
  </BrowserRouter>
);
