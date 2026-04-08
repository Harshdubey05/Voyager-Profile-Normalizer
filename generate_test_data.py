import json
import os
import random
from normalizer import ProfileNormalizer

def generate_samples(count=50):
    normalizer = ProfileNormalizer()
    inputs_dir = "tests/samples/inputs"
    expected_dir = "tests/samples/expected"
    
    first_names = ["Harsh", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Jesper", "Kevin", "Laura", "Mallory", "Niaj", "Oscar", "Peggy", "Quentin", "Rose", "Sybil"]
    last_names = ["Dubey", "Smith", "Jones", "Brown", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez"]
    headlines = ["Software Engineer", "Product Manager", "Designer", "CTO", "CEO", "Marketing Head", "Data Scientist", "DevOps Ninja", "HR Specialist", "Sales Associate"]
    companies = ["Google", "Microsoft", "Meta", "Amazon", "Netflix", "Apple", "Uber", "Airbnb", "Spotify", "Tesla"]
    locations = ["Bengaluru, India", "San Francisco, CA", "New York, NY", "London, UK", "Berlin, Germany", "Tokyo, Japan", "Sydney, Australia", "Singapore", "Toronto, Canada", "Paris, France"]
    schools = ["IIT Bombay", "Stanford University", "MIT", "Harvard", "Oxford", "Cambridge", "Insead", "Wharton", "Berkeley", "NTU"]
    degrees = ["B.Tech", "M.S.", "MBA", "Ph.D.", "B.Sc.", "M.A.", "B.A.", "Diploma"]

    for i in range(1, count + 1):
        # Build a messy payload
        choice = random.randint(0, 5)
        
        # Randomly omit or add fields
        payload = {
            "public_identifier": f" user-{i} " if random.random() > 0.1 else None,
            "first_name": f" {random.choice(first_names)} " if random.random() > 0.2 else None,
            "last_name": f" {random.choice(last_names)} " if random.random() > 0.2 else None,
            "full_name": None if random.random() > 0.3 else f" {random.choice(first_names)}   {random.choice(last_names)} ",
            "headline": f"  {random.choice(headlines)}  |  🚀  " if random.random() > 0.1 else "",
            "summary": "This is a summary with   some    extra spaces." if random.random() > 0.5 else None,
            "location_name": random.choice(locations) if random.random() > 0.2 else None
        }

        # Positions
        pos_count = random.randint(0, 3)
        positions = []
        for j in range(pos_count):
            is_current = (j == 0 and random.random() > 0.3)
            positions.append({
                "title": f" {random.choice(headlines)} ",
                "company_name": f" {random.choice(companies)} ",
                "location": random.choice(locations) if random.random() > 0.5 else None,
                "date_range": {
                    "start": {"year": 2020 - j},
                    "end": None if is_current else {"year": 2020 - j + 1}
                } if random.random() > 0.2 else None
            })
        payload["positions"] = positions

        # Educations
        edu_count = random.randint(0, 2)
        educations = []
        for j in range(edu_count):
            educations.append({
                "school_name": f" {random.choice(schools)} ",
                "degree_name": f" {random.choice(degrees)} " if random.random() > 0.3 else None,
                "field_of_study": "Computer Science" if random.random() > 0.5 else ""
            })
        payload["educations"] = educations

        # Save input
        input_filename = f"profile_{i}.json"
        with open(os.path.join(inputs_dir, input_filename), "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        
        # Generate and save expected
        expected_output = normalizer.normalize(payload)
        with open(os.path.join(expected_dir, input_filename), "w", encoding="utf-8") as f:
            json.dump(expected_output, f, indent=2)

    print(f"Generated {count} test cases in tests/samples/")

if __name__ == "__main__":
    generate_samples()
