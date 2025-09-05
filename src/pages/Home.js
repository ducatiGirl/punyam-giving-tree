import { useState, useEffect } from "react";
import img from "../images/mango.jpg";
import MangoIcon from "../components/Mango";
import { Link } from "react-router-dom";

const Home = () => {
  const [childrenWithPositions, setChildrenWithPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChildren = () => {
    fetch(process.env.REACT_APP_API_URL + '/api/needs')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const childrenWithPos = data.data.map(child => {
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
    fetchChildren();
  }, []);

  return (
    <div>
      <h1>Welcome to the Full Story for a Mango Tree!</h1>

      <div className="image-container">
        <img className="mango-tree-img" src={img} alt="Mango Tree" />
        
        {isLoading && <p style={{ textAlign: 'center' }}>Loading the mango tree...</p>}
        
        {!isLoading && childrenWithPositions.length > 0 && childrenWithPositions.map((child) => {
          const isSponsored = child.sponsored === 1;

          return (
            <Link to={`/OnePerson?id=${child.id}`} key={child.id}>
              
              <MangoIcon
                color={isSponsored ? '#d72d2dff' : '#F4B400'}
                size={45}
                className="mango-icon mango-outline"
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
