import React, {useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Homepage } from "./pages/Homepage";
import { Chat } from "./pages/Chat";
import { Layout } from "./components/Layout";
import {Admin} from "./pages/Admin";
import {AuthCallback} from "./pages/AuthCallback";
import userStore from "./stores/userStore";

function App() {
   const { initializeAuth } = userStore(); // Access initializeAuth

  // Call initializeAuth once when app loads
  useEffect(() => {
    initializeAuth().then();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
