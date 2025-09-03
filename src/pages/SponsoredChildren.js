import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SponsoredChildren = () => {
    const [sponsoredChildren, setSponsoredChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSponsored = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_API_URL + '/api/all-needs');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                
                // Filter the list to get only the sponsored children
                const sponsored = data.data.filter(child => child.sponsored === true || child.sponsored === 1);
                
                setSponsoredChildren(sponsored);
                setLoading(false);

            } catch (error) {
                console.error("Failed to fetch sponsored children data:", error);
                setLoading(false);
            }
        };

        fetchSponsored();
    }, []);

    if (loading) {
        return <div className="loading-state">Loading sponsored children...</div>;
    }

    if (sponsoredChildren.length === 0) {
        return <div className="no-sponsorships-message">No children have been sponsored yet. Be the first to help!</div>;
    }

    return (
        <>
            <div className="sponsored-count-display">
                <h2>A huge thank you to our community!</h2>
                <p>We've already sponsored {sponsoredChildren.length} children!</p>
            </div>
            <div className="giving-tree-container">
                {sponsoredChildren.map((child) => (
                    <div key={child.id} className="child-card fulfilled-card">
                        <div className="fulfilled-message">
                            <h3 className="text-green-600 font-bold">{child.name}'s wish has been fulfilled!</h3>
                            <p>Sponsored by a member of the Punyam community.</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default SponsoredChildren;
