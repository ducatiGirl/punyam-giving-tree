import React, { useState, useEffect } from 'react';
import Popup from '../components/Popup';
import { Link } from 'react-router-dom';

const WishlistTable = () => {
    const [buttonPopup, setButtonPopup] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [children, setChildren] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sponsoredCount, setSponsoredCount] = useState(0);
    const itemsPerPage = 9;
    const [loading, setLoading] = useState(true);

    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSebsT2-5oo1xJ0Ew4at-m9GfIran5wO76jUljI-3qH9xmCS5A/viewform";
    const CHILD_NAME_ENTRY_ID = "1246970301";

    const animateCount = (initialCount) => {
        const duration = 2000;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = initialCount / totalSteps;

        let currentCount = 0;
        const timer = setInterval(() => {
            currentCount += increment;
            if (currentCount >= initialCount) {
                clearInterval(timer);
                setSponsoredCount(initialCount);
            } else {
                setSponsoredCount(Math.ceil(currentCount));
            }
        }, stepTime);
        return () => clearInterval(timer);
    };

    useEffect(() => {
        const storedCount = localStorage.getItem('sponsoredCount');
        if (storedCount) {
            const initialCount = parseInt(storedCount, 10);
            animateCount(initialCount);
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
        } else {
            fetch(process.env.REACT_APP_API_URL + '/api/needs')
                .then(response => response.json())
                .then(data => {
                    setChildren(data.data);
                    setLoading(false);
                    const initialSponsored = data.data.filter(child => child.sponsored).length;
                    localStorage.setItem('sponsoredCount', initialSponsored);
                    animateCount(initialSponsored);
                })
                .catch(error => {
                    console.error("Failed to fetch data:", error);
                    setLoading(false);
                });
        }
    }, []);

    const handleCheckboxChange = async (id) => {
        try {
            setChildren(prevChildren =>
                prevChildren.map(child =>
                    child.id === id ? { ...child, sponsored: true } : child
                )
            );
            setSponsoredCount(prevCount => {
                const newCount = prevCount + 1;
                localStorage.setItem('sponsoredCount', newCount);
                return newCount;
            });
            await fetch(`${process.env.REACT_APP_API_URL}/api/needs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sponsored: true })
            });
            console.log(`Updated id: ${id} as sponsored.`);
        } catch (error) {
            console.error("Failed to update sponsorship status:", error);
            setChildren(prevChildren =>
                prevChildren.map(child =>
                    child.id === id ? { ...child, sponsored: false } : child
                )
            );
            setSponsoredCount(prevCount => {
                const newCount = prevCount - 1;
                localStorage.setItem('sponsoredCount', newCount);
                return newCount;
            });
        }
    };

    const handleSponsorClick = (child) => {
        const prefilledUrl = `${GOOGLE_FORM_URL}?usp=pp_url&entry.${CHILD_NAME_ENTRY_ID}=${encodeURIComponent(child.name)}`;
        window.open(prefilledUrl, '_blank');
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = children.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(children.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    const prevPage = () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    
    // New function for mobile-friendly pagination
    const getMobilePageNumbers = () => {
        const pageNumbers = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > 3) {
                pageNumbers.push('...');
            }
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }
            if (!pageNumbers.includes(totalPages)) {
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    if (loading) {
        return <div className="loading-state">Loading...</div>;
    }

    return (
        <>
            <div className="sponsored-count-display">
                <h2>We have already sponsored {sponsoredCount} children!</h2>
            </div>
            <div className="giving-tree-container">
                {currentItems.map((child) => {
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
            </div>
            <div className="pagination-controls">
                <button onClick={prevPage} disabled={currentPage === 1}>
                    &lt;
                </button>
                {getMobilePageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span>...</span>
                        ) : (
                            <button
                                className={currentPage === page ? 'active' : ''}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
                <button onClick={nextPage} disabled={currentPage === totalPages}>
                    &gt;
                </button>
            </div>
            <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                {selectedChild && (
                    <>
                        <h3>My Popup</h3>
                        <p>This is the paying link for {selectedChild.name}</p>
                    </>
                )}
            </Popup>
        </>
    );
};

export default WishlistTable;
