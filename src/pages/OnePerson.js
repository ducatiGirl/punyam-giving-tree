const handleCheckboxChange = async (personId) => {
        if (selectedChild.sponsored === 1) {
            return;
        }
        try {
            const newSponsoredStatus = 1;
            await fetch(`${process.env.REACT_APP_API_URL}/api/needs/${personId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sponsored: newSponsoredStatus })
            });
            console.log(`Updated personId: ${personId} as sponsored status: ${newSponsoredStatus}.`);
            setSelectedChild({ ...selectedChild, sponsored: newSponsoredStatus });
        } catch (error) {
            console.error("Failed to update sponsorship status:", error);
        }
    };
