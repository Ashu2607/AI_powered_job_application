import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleSelection from "./components/roleSelection";
import LoginPage from "./components/loginPage";
import StudentForm from "./components/studentForm";
import RecruiterForm from "./components/recruiterForm";
import SignupPage from "./components/signUppage";

function App() {
  const [role, setRole] = useState(null);

  const handleLogin = () => {
    window.location.href = role === "recruiter" ? "/recruiter" : "/student";
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RoleSelection
            onSelect={(r) => {
              setRole(r);
              window.location.href = `/login?role=${r}`;
            }}
          />
        }
      />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/student"
        element={
          localStorage.getItem("authToken") && localStorage.getItem("role") === "student"
            ? <StudentForm />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/student-form"
        element={
          localStorage.getItem("authToken") && localStorage.getItem("role") === "student"
            ? <StudentForm />
            : <Navigate to="/login" />
        }
      />
      {/* <Route
        path="/recruiter"
        element={
          localStorage.getItem("authToken") && localStorage.getItem("role") === "recruiter"
            ? <RecruiterForm />
            : <Navigate to="/login" />
        }
      /> */}
      <Route
        path="/recruiter-form"
        element={
          localStorage.getItem("authToken") && localStorage.getItem("role") === "recruiter"
            ? <RecruiterForm />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default App;
