import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Locations from "./pages/Locations";
import Compare from "./pages/Compare";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import { AuthProvider } from "./context/AuthProvider.jsx";

function App() {
  return (
    <AuthProvider><BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/applications" element={<Applications />} />
      </Routes>
    </BrowserRouter></AuthProvider>
  );
}

export default App;
