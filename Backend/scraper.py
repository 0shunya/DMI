from jobspy import scrape_jobs


def scrape_job_data(
    search_term="software developer",
    location="India",
    results_wanted=20,
):
    jobs = scrape_jobs(
        site_name=["indeed"],
        search_term=search_term,
        location=location,
        results_wanted=results_wanted,
        country_indeed="India",
    )

    return jobs


if __name__ == "__main__":
    jobs = scrape_job_data()

    print(
        jobs[
            [
                "title",
                "company",
                "location",
                "job_url",
                "date_posted",
            ]
        ].to_string(index=False)
    )