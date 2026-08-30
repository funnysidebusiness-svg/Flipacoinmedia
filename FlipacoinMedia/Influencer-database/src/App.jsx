
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Casestudies from './pages/Casestudies.jsx'
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Creators from "./pages/Creators.jsx";
import Frenziedbook from "./pages/Frenziedbook.jsx";
import CreatorLogin from "./pages/CreatorLogin.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
       <Route path="/case-studies" element={<Casestudies />} />
        <Route path="/creators" element={<Creators />} />
        <Route path="/frenziedbook" element={<Frenziedbook />} />
        <Route path="/creator-login" element={<CreatorLogin />} />
      </Routes>
    </>
  );
}

export default App;
