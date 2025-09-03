import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Popup from '../components/Popup';

const OnePerson = ({ setSponsoredCount }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [buttonPopup, setButtonPopup] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const compellingStatements = [
        "Please consider helping to make this wish come true!",
        "By sponsoring this gift, you can help fulfill a simple wish and bring joy to a child's life.",
        "Every gift, no matter the size, helps us build a brighter future for these children. Please consider sponsoring this wish today."
    ];
    
    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSebsT2-5oo1xJ0Ew4at-m9GfIran5wO76jUljI-3qH9xmCS5A/viewform";
    const CHILD_NAME_ENTRY_ID = "1246970301";

    useEffect(() => {
        const fetchDataAndSetChild = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_API_URL + '/api/all-needs');
                const data = await response.json();
                const childrenList = data.data;
                setChildren(childrenList);
                setLoading(false);

                const personId = searchParams.get('id');
                const foundChild = childrenList.find(child => child.id === personId);

                if (foundChild) {
                    setSelectedChild(foundChild);
                } else if (childrenList.length > 0) {
                    const firstChild = childrenList[0];
                    setSearchParams({ id: firstChild.id });
                    setSelectedChild(firstChild);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setLoading(false);
            }
        };
        fetchDataAndSetChild();
    }, [searchParams, setSearchParams]);

    const handleSponsorClick = (child) => {
        const prefilledUrl = `${GOOGLE_FORM_URL}?usp=pp_url&entry.${CHILD_NAME_ENTRY_ID}=${encodeURIComponent(child.name)}`;
        window.open(prefilledUrl, '_blank');
    };

    const handleCheckboxChange = async (personId) => {
        if (!selectedChild || selectedChild.sponsored === 1) {
            return;
        }

        try {
            const newSponsoredStatus = 1;

            // Optimistic UI update.
            setSelectedChild({ ...selectedChild, sponsored: newSponsoredStatus });
            setSponsoredCount(prevCount => prevCount + 1);

            // API call to update the backend.
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/needs/${personId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sponsored: newSponsoredStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update sponsorship status on the server.');
            }

            console.log(`Updated personId: ${personId} as sponsored status: ${newSponsoredStatus}.`);
        } catch (error) {
            console.error("Failed to update sponsorship status:", error);
            // Rollback the local and global state if the API call fails.
            setSelectedChild({ ...selectedChild, sponsored: 0 });
            setSponsoredCount(prevCount => prevCount - 1);
        }
    };

    const goToNextPage = () => {
        if (selectedChild) {
            const currentIndex = children.findIndex(child => child.id === selectedChild.id);
            if (currentIndex < children.length - 1) {
                const nextChild = children[currentIndex + 1];
                setSearchParams({ id: nextChild.id });
            }
        }
    };

    const goToPrevPage = () => {
        if (selectedChild) {
            const currentIndex = children.findIndex(child => child.id === selectedChild.id);
            if (currentIndex > 0) {
                const prevChild = children[currentIndex - 1];
                setSearchParams({ id: prevChild.id });
            }
        }
    };

    const generatePageNumbers = (currentIndex, totalItems) => {
        const pageNumbers = [];
        const totalPages = totalItems;
        const currentPage = currentIndex + 1;

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

    const getRandomStatement = () => {
        const randomIndex = Math.floor(Math.random() * compellingStatements.length);
        return compellingStatements[randomIndex];
    };

    if (loading || !selectedChild) {
        return <div className="loading-state">Loading...</div>;
    }

    const currentIndex = children.findIndex(child => child.id === selectedChild.id);
    const isSponsored = selectedChild.sponsored === 1;

    return (
        <div className="giving-tree-no-container">
            <div className="child-no-card">
                <div className="one-child-details">
                    <p className="intro-text">Hi, my name is {selectedChild.name}. I am a student at {selectedChild.schoolName}.</p>
                    {selectedChild.story && selectedChild.story !== 'N/A' && (
                        <p className="story-text">My story: {selectedChild.story}</p>
                    )}
                    <div className="wishlist-info">
                        <p>This season, my wish is for {selectedChild.category}.</p>
                        <p>The price is ${selectedChild.cost}.</p>
                    </div>
                    <p className="compelling-statement">
                        {!isSponsored ? getRandomStatement() : "Thank you for your kindness!"}
                    </p>
                </div>
                {isSponsored ? (
                    <div className="text-center mt-8 text-green-600 font-bold text-lg">
                        This child's wishlist has been happily fulfilled!
                    </div>
                ) : (
                    <div className="button-group">
                        <button
                            className="sponsor-button"
                            onClick={() => handleSponsorClick(selectedChild)}
                            disabled={isSponsored}
                        >
                            Sponsor {selectedChild.name}'s Wishlist
                        </button>
                        <div className="sponsorship-checkbox">
                            <input
                                type="checkbox"
                                id={`sponsored-${selectedChild.id}`}
                                checked={isSponsored}
                                onChange={() => handleCheckboxChange(selectedChild.id)}
                                disabled={isSponsored}
                            />
                            <label htmlFor={`sponsored-${selectedChild.id}`}>I have sponsored this wish.</label>
                        </div>
                    </div>
                )}
            </div>
            <div className="pagination-controls">
                <button onClick={goToPrevPage} disabled={currentIndex === 0}>
                    &lt;
                </button>
                {generatePageNumbers(currentIndex, children.length).map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span>...</span>
                        ) : (
                            <button
                                className={(currentIndex + 1) === page ? 'active' : ''}
                                onClick={() => setSearchParams({ id: children[page - 1].id })}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
                <button onClick={goToNextPage} disabled={currentIndex === children.length - 1}>
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
        </div>
    );
};

export default OnePerson;
