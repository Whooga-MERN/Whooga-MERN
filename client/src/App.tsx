import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./Pages/home";
import awsconfig from './aws-exports';
import { Amplify } from 'aws-amplify';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
Amplify.configure(awsconfig);

function App() {
  return (
    <>
      <Navbar></Navbar>
      <Home></Home>         
      <Footer></Footer>
    </>
  );
}

export default App;
