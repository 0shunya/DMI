import { Link } from "react-router-dom";
import Handwriting from "../components/Handwriting";

function Navbar() {
  return (
    <nav>
       <Handwriting fontSize="20px"> 
      <h2>DevMarket</h2> </Handwriting>

      <div>
        <Handwriting fontSize="20px" gap="24px">
          <Link to="/">Dashboard</Link>
        </Handwriting>
        <Handwriting fontSize="20px" gap="24px"><Link to="/skills">Skills</Link></Handwriting>  
        <Handwriting fontSize="20px" gap="24px"><Link to="/locations">Locations</Link></Handwriting>  
        <Handwriting fontSize="20px" gap="24px"><Link to="/compare">Compare</Link></Handwriting>  
        
        {/* <Link to="/locations">Locations</Link>
        <Link to="/compare">Compare</Link>
         */}
      </div>
      {/* </Handwriting> */}
    </nav>
  );
}

export default Navbar;