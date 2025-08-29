import React, { useState, useEffect } from 'react';
import Popup from '../components/Popup';
import { Link } from 'react-router-dom';

const WishlistTable = () => {
  const [buttonPopup, setButtonPopup] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/api/needs')
      .then(response => response.json())
      .then(data => {
        setChildren(data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      });
  }, []);

  const handleCheckboxChange = async (id) => {
    try {
      // Optimistically update the UI state
      setChildren(prevChildren =>
        prevChildren.map(child =>
          child.id === id ? { ...child, sponsored: true } : child
        )
      );

      // Send the update to the server in the background
      await fetch(`${process.env.REACT_APP_API_URL}/api/needs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sponsored: true })
      });
      console.log(`Updated id: ${id} as sponsored.`);
    } catch (error) {
      console.error("Failed to update sponsorship status:", error);
      // Revert the UI state if the API call fails
      setChildren(prevChildren =>
        prevChildren.map(child =>
          child.id === id ? { ...child, sponsored: false } : child
        )
      );
    }
  };

  const handleSponsorClick = (child) => {
    setSelectedChild(child);
    setButtonPopup(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = children.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(children.length / itemsPerPage);

  const nextPage = () => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  const prevPage = () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1));

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="giving-tree-container">
      {currentItems.map((child, index) => {
        const isSponsored = child.sponsored === true || child.sponsored === 1;
        return (
          <div key={child.id} className="child-card">
            {isSponsored ? (
              <div className="fulfilled-message">
                <h3 className="text-green-600 font-bold">{child.name}'s wish has been happily fulfilled!</h3>
                <p>Thank you for your kindness!</p>
              </div>
            ) : (
              <>
                <div className="child-header">
                  <Link to={`/OnePerson?id=${child.id}`}>
                    <h3>{child.name}</h3>
                  </Link>
                </div>
                <div className="child-details">
                  <p><strong>School: </strong>{child.schoolName}</p>
                  {child.story && child.story !== 'N/A' && (
                    <p><strong>Story: </strong>{child.story}</p>
                  )}
                  <p><strong>Wishlist:</strong> {child.category}</p>
                  <p><strong>Price:</strong> ${child.cost}</p>
                </div>
              </>
            )}

            <div className="button-group">
              {/* Conditionally render the button based on the sponsored status */}
              {!isSponsored && (
                <button
                  className="sponsor-button"
                  onClick={() => handleSponsorClick(child)}
                >
                  Sponsor {child.name}'s Wishlist
                </button>
              )}
              
              <div className="sponsorship-checkbox">
                <input
                  type="checkbox"
                  id={`sponsored-${child.id}`}
                  checked={isSponsored}
                  onChange={() => handleCheckboxChange(child.id)}
                  disabled={isSponsored}
                />
                <label htmlFor={`sponsored-${child.id}`}>
                  I have sponsored this wish.
                </label>
              </div>
            </div>
          </div>
        );
      })}
      <div className="pagination-controls">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
      <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
        {selectedChild && (
          <>
            <h3>My Popup</h3>
            <p>This is the paying link for {selectedChild.name}</p>
          </>
        )}
      </Popup>
    </div>
  );
};

export default WishlistTable;
