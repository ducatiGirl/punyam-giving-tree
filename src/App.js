import './App.css';
import Navbar from './Navbar';
import WishlistTable from './pages/WishlistTable';
import About from './pages/About';
import Home from './pages/Home';
import OnePerson from './pages/OnePerson';
import { Route, Routes } from 'react-router-dom';

function App() {

  return (
    <>
    <Navbar />
    <div className = "container">
      <Routes>
        <Route path="/" element = {<Home />} />
        <Route path="/OnePerson" element = {<OnePerson />}/>
        <Route path="/About" element = {<About />} />
        <Route path="/WishlistTable" element = {<WishlistTable />} />
      </Routes>
    </div>
  </>
  );
}

export default App;
