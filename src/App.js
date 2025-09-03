import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './Navbar';
import WishlistTable from './pages/WishlistTable';
import About from './pages/About';
import Home from './pages/Home';
import OnePerson from './pages/OnePerson';
import SponsoredChildren from "./pages/SponsoredChildren";
import { Route, Routes } from 'react-router-dom';

function App() {
  const [sponsoredCount, setSponsoredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // This effect fetches the total sponsored count from your API when the app loads.
  useEffect(() => {
    const fetchSponsoredCount = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL + '/api/all-needs');
        if (!response.ok) {
          throw new Error('Failed to fetch sponsored count');
        }
        const data = await response.json();
        const count = data.data.filter(child => child.sponsored === true || child.sponsored === 1).length;
        setSponsoredCount(count);
      } catch (error) {
        console.error("Error fetching initial sponsored count:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsoredCount();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while fetching the initial count
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/OnePerson" 
            element={<OnePerson sponsoredCount={sponsoredCount} setSponsoredCount={setSponsoredCount} />} 
          />
          <Route path="/About" element={<About />} />
          <Route 
            path="/WishlistTable" 
            element={<WishlistTable sponsoredCount={sponsoredCount} setSponsoredCount={setSponsoredCount} />} 
          />
          <Route path="/SponsoredChildren" element={<SponsoredChildren />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
