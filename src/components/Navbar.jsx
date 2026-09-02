import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>DevMarket</h2>

      <div>
        <Link to="/">Dashboard</Link>
        <Link to="/skills">Skills</Link>
        <Link to="/locations">Locations</Link>
        <Link to="/compare">Compare</Link>
      </div>
    </nav>
  );
}

export default Navbar;