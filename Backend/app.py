from fastapi import FastAPI
from scraper import scrape_job_data;
from fastapi.middleware.cors import CORSMiddleware;

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
        ]
    ].fillna("").to_dict(orient="records")