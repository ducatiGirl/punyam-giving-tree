import React from 'react';

export default function About() {
    return (
        <div className="about-content">
            <h2 className="about-heading">What is the Punyam Giving Tree?</h2>
            <ul>
                <li>
                    The Punyam Giving Tree is a community-based charitable initiative designed to bring
                    joy and support to children and families specifically in India. It is a visual representation of
                    generosity, where a tree holds mangos that display the specific wishes of
                    children in India who may not otherwise receive gifts.
                </li>
            </ul>

            <h2 className="how-it-works-heading">How it works</h2>
            <ul>
                <li>Children are asked to submit wish lists—often including things like toys, clothing, school supplies, or sometimes basic necessities.</li>
                <li>A tree is decorated with mangos.</li>
                <li>Each mango represents a child's:</li>
                <ul>
                    <li>Name</li>
                    <li>School</li>
                    <li>Needs</li>
                    <li>Wishlist</li>
                </ul>
                <li>Members of the punyam community select a mango from the tree.</li>
                <li>They buy the requested gift(s) listed on the mango, fulfilling that child’s wish.</li>
                <li>Gifts are typically returned unwrapped to the organization for sorting and distribution.</li>
                <li>Punyam then gives the child their gift!</li>
            </ul>

            <h2 className="purpose-heading">Purpose and Impact</h2>
            <ul>
                <li>
                    <b>Bringing Joy:</b> Many of these children come from low-income or difficult
                    family situations and may not otherwise receive holiday gifts.
                </li>
                <li>
                    <b>Building community:</b> The Giving Tree fosters a sense of unity and
                    compassion within neighborhoods, schools, and companies.
                </li>
                <li>
                    <b>Teaching generosity:</b> It’s an opportunity for individuals and families
                    to practice selflessness and gratitude by helping others.
                </li>
                <li>
                    It’s often anonymous but deeply impactful. The recipient feels seen,
                    valued, and remembered.
                </li>
                <li>
                    It transforms the simple act of giving into a meaningful connection between strangers.
                </li>
            </ul>
        </div>
    );
}
