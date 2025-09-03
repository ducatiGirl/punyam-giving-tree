import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Popup from '../components/Popup';

const OnePerson = () => {
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
            const currentCount = parseInt(localStorage.getItem('sponsoredCount') || '0', 10);
            localStorage.setItem('sponsoredCount', currentCount + 1);
        } catch (error) {
            console.error("Failed to update sponsorship status:", error);
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
            if (currentIndex
