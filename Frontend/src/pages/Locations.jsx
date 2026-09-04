import { useState } from "react";

import "../styles/locations.css";

import LocationJobsChart from "../components/LocationJobsChart.jsx";
import LocationSkillChart from "../components/LocationSkillChart.jsx";

import Navbar from "../components/Navbar.jsx";
// import Handwriting from "../components/Handwriting";

import {
  cityJobs,
  citySkillDemand,
} from "../data/dashboardData.jsx";

function Locations() {
  const [selectedCity, setSelectedCity] = useState("Bengaluru");

  const cityJobsData = cityJobs.find(
    (item) => item.city === selectedCity
  );

  const citySkillData = citySkillDemand.find(
    (item) => item.city === selectedCity
  );

  return (
    <>
      <Navbar />

      <main>
        <h1>Location Intelligence</h1>

        <p>
          Explore developer jobs and skill demand by city.
        </p>

        {/* City Selector */}

        <section className="location-selector-card">
          {/* <Handwriting fontSize="30px"> */}
            Explore a City
          {/* </Handwriting> */}

          <label htmlFor="city">
            Select City:
          </label>

          <select
            id="city"
            value={selectedCity}
            onChange={(event) =>
              setSelectedCity(event.target.value)
            }
          >
            {cityJobs.map((item) => (
              <option
                key={item.city}
                value={item.city}
              >
                {item.city}
              </option>
            ))}
          </select>
        </section>

        {/* City Stats */}

        <section className="location-stats">

          <div className="location-stat-card">
            <p>Developer Jobs</p>
            <h2>{cityJobsData.jobs}</h2>
          </div>

          <div className="location-stat-card">
            <p>Top Skill</p>
            <h2>
              {getTopSkill(citySkillData)}
            </h2>
          </div>

          <div className="location-stat-card">
            <p>Top Skill Demand</p>
            <h2>
              {getTopSkillDemand(citySkillData)}
            </h2>
          </div>

        </section>

        {/* City Overview */}

        <section className="location-detail-card">
          {/* <Handwriting fontSize="32px"> */}
            {selectedCity}
          {/* </Handwriting> */}

          <p>
            {selectedCity} has{" "}
            <strong>{cityJobsData.jobs}</strong>{" "}
            developer jobs in the current dataset.
          </p>
        </section>

        <LocationJobsChart data={cityJobs} />
        <LocationSkillChart city={citySkillData} />

      </main>
    </>
  );
}


/* Find highest-demand skill */

function getTopSkill(city) {
  const skills = [
    { name: "Python", value: city.Python },
    { name: "Java", value: city.Java },
    { name: "JavaScript", value: city.JavaScript },
    { name: "C#", value: city.CSharp },
  ];

  return skills.reduce(
    (highest, current) =>
      current.value > highest.value
        ? current
        : highest
  ).name;
}


/* Find highest demand score */

function getTopSkillDemand(city) {
  const skills = [
    city.Python,
    city.Java,
    city.JavaScript,
    city.CSharp,
  ];

  return Math.max(...skills);
}

export default Locations;