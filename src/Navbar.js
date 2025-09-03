import { Link, useMatch, useResolvedPath } from "react-router-dom"
export default function Navbar(){
    
    return <nav className="nav">
        <Link to="/" className="site-title">Punyam Giving Tree</Link>
        <ul>
            <CustomLink to="/About">About</CustomLink>
            <CustomLink to="/WishlistTable">Wishlist Table</CustomLink> 
            <CustomLink to="/OnePerson">One person</CustomLink>
            <CustomLink to="/SponsoredChildren">Sponsored Children</CustomLink>
        </ul>
    </nav>
}
function CustomLink({to, children, ...props}){
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({path:resolvedPath.pathname, end: true })
    return (
        <li className={isActive ? "active": ""}>
            <Link to={to}{...props}>
                {children}
            </Link>
        </li>
    )
}
