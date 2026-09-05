from fastapi import FastAPI
from scraper import scrape_job_data;
from fastapi.middleware.cors import CORSMiddleware;
from skill_extractor import analyze_jobs
from skill_extractor import extract_skills

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "DevMarket Intelligence API is running"}


@app.get("/api/jobs")
def get_jobs():
    jobs = scrape_job_data(results_wanted=20)

    return jobs[
    [
        "title",
        "company",
        "location",
        "job_url",
        "date_posted",
        "description",
    ]
].fillna("").to_dict(orient="records")

@app.get("/api/skills")
def get_skills():

    jobs = scrape_job_data(results_wanted=20)

    skill_counts = analyze_jobs(jobs)

    return [
        {
            "skill": skill,
            "jobs": count
        }
        for skill, count in skill_counts.items()
        if count > 0
    ]

@app.get("/api/locations")
def get_locations():
    jobs = scrape_job_data(results_wanted=20)

    locations = {}

    for job in jobs.to_dict("records"):
        location = job.get("location")

        if not location:
            continue

        locations[location] = locations.get(location, 0) + 1

    return [
        {
            "location": location,
            "jobs": count
        }
        for location, count in sorted(
            locations.items(),
            key=lambda item: item[1],
            reverse=True
        )
    ]
@app.get("/api/location-skills")
def get_location_skills():

    jobs = scrape_job_data(results_wanted=20)

    location_skill_counts = {}

    for _, job in jobs.iterrows():

        location = job.get("location")

        if not location:
            continue

        title = str(job.get("title", ""))
        description = str(job.get("description", ""))

        text = f"{title} {description}"

        found_skills = extract_skills(text)

        if location not in location_skill_counts:
            location_skill_counts[location] = {}

        for skill in found_skills:

            if skill not in location_skill_counts[location]:
                location_skill_counts[location][skill] = 0

            location_skill_counts[location][skill] += 1

    return location_skill_counts