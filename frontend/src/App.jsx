// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./redux/authSlice";

import { Toaster } from "sonner";

import Navbar from "./components/shared/Navbar";
import SignIn from "./components/pages/Authentication/SignIn";
import SignUp from "./components/pages/Authentication/Signup";
import Home from "./components/pages/General/Home";
import About from "./components/pages/General/About";
import Profile from "./components/pages/General/Profile";
import Footer from "./components/shared/Footer";
import SkillsDiscovery from "./components/pages/Skills/page";
import SkillsDetails from "./components/pages/Skills/[id]/page";
import AddListing from "./components/pages/Skills/AddListings";
import AddSkills from "./components/pages/Skills/AddSkills";
import BookSessionForm from "./components/components/SessionBookingForm";
import LearnerSessions from "./components/pages/Sessions/LearnerSessions";
import TeacherSessions from "./components/pages/Sessions/TeacherSessions";
import UserProfile from "./components/pages/General/UserProfile";
import EditListings from "./components/pages/Skills/edit/page";

const Skills = () => (
  <div className="p-6 text-center">
    <h2 className="text-3xl font-semibold">Skills</h2>
    <SkillsDiscovery />
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
  }, [dispatch]);

  return (
    <Router>
      <Toaster position="top-center" richColors />

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/skills/:id" element={<SkillsDetails />} />
        <Route path="/skills/add" element={<AddSkills />} />
        <Route path="/listings/add" element={<AddListing />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        {/* Authentication Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/book-session/:skillId" element={<BookSessionForm />} />
        <Route path="/sessions/learner" element={<LearnerSessions />} />
        <Route path="/sessions/teacher" element={<TeacherSessions />} />
        <Route path="/edit-listing/:id" element={<EditListings />} />

        <Route
          path="*"
          element={<div className="text-center p-6">404 - Page Not Found</div>}
        />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
