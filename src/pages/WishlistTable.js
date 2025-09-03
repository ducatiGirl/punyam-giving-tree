import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WishlistTable = ({ sponsoredCount, updateSponsoredCount }) => {
    const [children, setChildren] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [displayedCount, setDisplayedCount] = useState(0); // This state is for the animation

    const itemsPerPage = 10;
    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSebsT2-5oo1xJ0Ew4at-m9GfIran5wO76jUljI-3qH9xmCS5A/viewform";
    const CHILD_NAME_ENTRY_ID = "1246970301";

    // This useEffect will run the animation whenever the sponsoredCount prop changes
    useEffect(() => {
        const duration = 2000;
        const start = displayedCount;
        const end = sponsoredCount;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const animatedValue = Math.floor(start + progress * (end - start));
            setDisplayedCount(animatedValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [sponsoredCount]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_API_URL + '/api/needs');
                const data = await response.json();
                setChildren(data.data);
                const sponsoredChildrenCount = data.data.filter(child => child.sponsored).length;
                updateSponsoredCount(sponsoredChildrenCount);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [updateSponsoredCount]);

    const handleCheckboxChange = async (id) => {
        try {
            setChildren(prevChildren =>
                prevChildren.map(child =>
                    child.id === id ? { ...child, sponsored: true } : child
                )
            );
            updateSponsoredCount(sponsoredCount + 1);

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
            updateSponsoredCount(sponsoredCount - 1);
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
    
    const generatePageNumbers = (currentPage, totalPages) => {
        const pageNumbers = [];
        pageNumbers.push(1);
        if (currentPage > 3) {
            pageNumbers.push('...');
        }
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        if (currentPage < totalPages - 2) {
            pageNumbers.push('...');
        }
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }
        return [...new Set(pageNumbers)];
    };

    if (loading) {
        return <div className="loading-state">Loading...</div>;
    }

    return (
        <>
            <div className="sponsored-count-display">
                <h2>We have already sponsored {displayedCount} children!</h2>
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
                {generatePageNumbers(currentPage, totalPages).map((page, index) => (
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
        </>
    );
};

export default WishlistTable;
