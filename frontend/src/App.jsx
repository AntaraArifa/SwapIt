import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import SignIn from './components/pages/Authentication/SignIn';
import SignUp from './components/pages/Authentication/Signup';

// Dummy pages for now
const Home = () => <div className="p-6 text-center"><h2 className="text-3xl font-semibold">Home</h2></div>;
const Skills = () => <div className="p-6 text-center"><h2 className="text-3xl font-semibold">Skills</h2></div>;
const About = () => <div className="p-6 text-center"><h2 className="text-3xl font-semibold">About</h2></div>;

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
};

export default App;
