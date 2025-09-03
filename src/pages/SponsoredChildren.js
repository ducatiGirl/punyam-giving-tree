import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SponsoredChildren = () => {
    const [allSponsored, setAllSponsored] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchSponsored = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_API_URL + '/api/all-needs');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const sponsored = data.data.filter(child => child.sponsored === true || child.sponsored === 1);
                setAllSponsored(sponsored);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch sponsored children data:", error);
                setLoading(false);
            }
        };
        fetchSponsored();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allSponsored.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allSponsored.length / itemsPerPage);

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
        return <div className="loading-state">Loading sponsored children...</div>;
    }

    if (allSponsored.length === 0) {
        return <div className="no-sponsorships-message">No children have been sponsored yet. Be the first to help!</div>;
    }

    return (
        <>
            <div className="sponsored-count-display">
                <h2>A huge thank you to our community!</h2>
                <p>We've already sponsored {allSponsored.length} children!</p>
            </div>
            <div className="giving-tree-container">
                {currentItems.map((child) => (
                    <div key={child.id} className="child-card fulfilled-card">
                        <div className="fulfilled-message">
                            <h3 className="text-green-600 font-bold">{child.name}'s wish has been fulfilled!</h3>
                            <p>Sponsored by a member of the Punyam community.</p>
                            {child.story && child.story !== 'N/A' && (
                                <p className="story-text">**My Story:** {child.story}</p>
                            )}
                        </div>
                    </div>
                ))}
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
        </>
    );
};

export default SponsoredChildren;
