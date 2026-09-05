import re


SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C#",
    "C++",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Django",
    "Flask",
    "Spring Boot",
    "ASP.NET",
    "AWS",
    "Azure",
    "Docker",
    "Kubernetes",
    "SQL",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Git",
    "REST API",
]


def extract_skills(text):
    """
    Find known skills inside a job description.
    """

    if not text:
        return []

    found_skills = []

    for skill in SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"

        if re.search(pattern, text, re.IGNORECASE):
            found_skills.append(skill)

    return found_skills


def analyze_jobs(jobs):
    """
    Count how many jobs mention each skill.
    """

    skill_counts = {
        skill: 0
        for skill in SKILLS
    }

    for _, job in jobs.iterrows():

        title = str(job.get("title", ""))
        description = str(job.get("description", ""))

        text = f"{title} {description}"

        found_skills = extract_skills(text)

        for skill in found_skills:
            skill_counts[skill] += 1

    return skill_counts