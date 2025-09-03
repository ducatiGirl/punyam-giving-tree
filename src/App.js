import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import WishlistTable from './pages/WishlistTable';
import About from './pages/About';
import Home from './pages/Home';
import OnePerson from './pages/OnePerson';
import SponsoredChildren from "./pages/SponsoredChildren";
import './App.css';

function App() {
  const [sponsoredCount, setSponsoredCount] = useState(0);

  useEffect(() => {
    // This effect runs once when the component mounts to get the initial count.
    const fetchSponsoredCount = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL + '/api/all-needs');
        const data = await response.json();
        const count = data.data.filter(child => child.sponsored).length;
        setSponsoredCount(count);
      } catch (error) {
        console.error("Failed to fetch sponsored children count:", error);
      }
    };
    fetchSponsoredCount();
  }, []);

  const updateSponsoredCount = (newCount) => {
    setSponsoredCount(newCount);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home sponsoredCount={sponsoredCount} />} />
          <Route path="/OnePerson" element={<OnePerson sponsoredCount={sponsoredCount} updateSponsoredCount={updateSponsoredCount} />} />
          <Route path="/About" element={<About />} />
          <Route path="/WishlistTable" element={<WishlistTable sponsoredCount={sponsoredCount} updateSponsoredCount={updateSponsoredCount} />} />
          <Route path="/SponsoredChildren" element={<SponsoredChildren sponsoredCount={sponsoredCount} />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
