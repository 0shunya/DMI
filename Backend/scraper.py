# from jobspy import scrape_jobs


# def scrape_job_data(
#     search_term="software developer",
#     location="India",
#     results_wanted=20,
# ):
#     jobs = scrape_jobs(
#         site_name=["indeed"],
#         search_term=search_term,
#         location=location,
#         results_wanted=results_wanted,
#         country_indeed="India",
#     )

#     return jobs


# if __name__ == "__main__":
#     jobs = scrape_job_data()

#     print(
#         jobs[
#             [
#                 "title",
#                 "company",
#                 "location",
#                 "job_url",
#                 "date_posted",
#             ]
#         ].to_string(index=False)
#     )

from jobspy import scrape_jobs
import pandas as pd


def scrape_job_data(
    search_term="software developer",
    location="India",
    country="India",
    results_wanted=20,
):
    jobs = scrape_jobs(
        site_name=["indeed"],
        search_term=search_term,
        location=location,
        results_wanted=results_wanted,
        country_indeed=country,
    )

    return jobs


def scrape_multiple_countries(
    search_term="software developer",
    results_per_country=20,
):
    countries = [
        {
            "country": "India",
            "location": "India",
        },
        {
            "country": "USA",
            "location": "United States",
        },
        {
            "country": "Canada",
            "location": "Canada",
        },
        {
            "country": "UK",
            "location": "United Kingdom",
        },
        {
            "country": "Australia",
            "location": "Australia",
        },
    ]

    all_jobs = []

    for country_info in countries:
        print(
            f"Scraping {country_info['country']}..."
        )

        try:
            jobs = scrape_job_data(
                search_term=search_term,
                location=country_info["location"],
                country=country_info["country"],
                results_wanted=results_per_country,
            )

            if not jobs.empty:
                jobs["country"] = country_info["country"]
                all_jobs.append(jobs)

        except Exception as error:
            print(
                f"Failed to scrape "
                f"{country_info['country']}: {error}"
            )

    if not all_jobs:
        return pd.DataFrame()

    return pd.concat(
        all_jobs,
        ignore_index=True,
    )


if __name__ == "__main__":
    jobs = scrape_multiple_countries(
        results_per_country=5
    )

    print(
        jobs[
            [
                "title",
                "company",
                "location",
                "country",
                "job_url",
            ]
        ].to_string(index=False)
    )