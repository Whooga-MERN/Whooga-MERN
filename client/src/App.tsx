import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./Pages/home";
import SignInPage from "./Pages/login"; // Importing your SignIn page
import SignupPage from "./Pages/signup"; // Importing the Signup page
import awsconfig from './aws-exports';
import { Amplify } from 'aws-amplify';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

Amplify.configure(awsconfig);

function App() {
  return (
    <Router>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} /> {/* Sign In Page */}
        <Route path="/signup" element={<SignupPage />} /> {/* Sign Up Page */}
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
