import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import MyAccount from "./components/MyAccount";
import Subscribe from "./components/Subscribe";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subscribe/:id" element={<Subscribe />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/about"></Route>
      </Routes>
    </Router>
  );
}
