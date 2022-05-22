import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Create";
import MyAccount from "./components/MyAccount";
import Navbar from "./components/Navbar";
import Services from "./components/Services";
import Subscribe from "./components/Subscribe";
import Subscriptions from "./components/Subscriptions";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Home />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/subscriptions/:id" element={<Subscriptions />} />
        <Route path="/service" element={<Services />} />
        <Route path="/services/:id" element={<Services />} />
        <Route path="/subscribe/:id" element={<Subscribe />} />
        <Route path="/my-account" element={<MyAccount />} />
      </Routes>
    </Router>
  );
}
