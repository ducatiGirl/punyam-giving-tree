import { useState, useEffect } from "react";
import img from "../images/mango.jpg";
import MangoIcon from "../components/Mango";
import { Link } from "react-router-dom";

const Home = () => {
  const [childrenWithPositions, setChildrenWithPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // This function fetches the data and adds random positions to each child
  const fetchChildren = () => {
    fetch(process.env.REACT_APP_API_URL + '/api/all-needs')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Map over the data and generate a random position for each child
        const childrenWithPos = data.data.map(child => {
          // These adjusted ranges are a bit more confined
          const randomTop = `${Math.random() * 50 + 17}%`; 
          const randomLeft = `${Math.random() * 55 + 20}%`; 
          return {
            ...child,
            position: { top: randomTop, left: randomLeft }
          };
        });
        setChildrenWithPositions(childrenWithPos);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch children data:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // This hook runs only once when the component first loads
    fetchChildren();
  }, []);

  return (
    <div>
      <h1>Welcome to the Giving Tree!</h1>

      <div className="image-container">
        <img className="mango-tree-img" src={img} alt="Mango Tree" />
        
        {/* Render a loading message while waiting for the data */}
        {isLoading && <p style={{ textAlign: 'center' }}>Loading the giving tree...</p>}
        
        {/* Only render mangoes once the data has been successfully fetched */}
        {!isLoading && childrenWithPositions.length > 0 && childrenWithPositions.map((child) => {
          const isSponsored = child.sponsored === 1;

          return (
            <Link to={`/OnePerson?id=${child.id}`} key={child.id}>
            
              <MangoIcon
                color={isSponsored ? '#d72d2dff' : '#F4B400'}
                size={30}
                className="mango-icon"
                style={child.position}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
