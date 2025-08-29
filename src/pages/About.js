
export default function About (){
    return (
        <>
        <h1 style={{textAlign: "center"}}> Home Page</h1>
        <h2 style={{color: "darkgreen"}}> What is the Giving Tree? </h2>
        <ul id = "GivingTreeBulletPoints">
            <li> The Giving Tree is a community-based charitable initiative designed to bring
                 joy and support to children and families. It is a visual representation of 
                 generosity, where a tree holds tags that display the specific wishes of
                 children in India who may not otherwise receive gifts. </li>
        </ul>
        <h2 style={{color: "#651111"}}> How it works</h2>
        <ul id = "HowItWorksBulletPoints">
            <li> Children are asked to submit wish lists—often including things like toys, clothing, school supplies, or sometimes basic necessities. </li>
            <li>A tree is decorated with ornaments.</li>
            <li>Each ornament contains the child's:</li>
            <ul id="ornamentContains">
                <li>First and last name</li>
                <li>Age</li>
                <li>Date</li>
                <li>Wishlist</li>
            </ul>
            <li>Members of the punyam community select an ornament from the tree</li>
            <li>They buy the requested gift(s) listed on the ornament, fulfilling that child’s wish</li>
            <li>Gifts are typically returned unwrapped to the organization for sorting and distribution.</li>
            <li>Punyam then gives the child their gift!</li>
        </ul>
        <h2 style={{color:"rgb(25, 16, 120)"}}>  Purpose and Impact</h2>

        <ul id="PurposeBulletPoints">
            <li> 
                <b>Bringing Joy: </b>Many of these children come from low-income or difficult 
                family situations and may not otherwise receive holiday gifts.
            </li>
            <li> 
                <b>Building community: </b>The Giving Tree fosters a sense of unity and 
                compassion within neighborhoods, schools, and companies.
            </li>
            <li> 
                <b>Teaching generosity: </b>It’s an opportunity for individuals and families
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



        </>

    );

}