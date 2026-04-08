import json
import re
import sys
import os
from typing import List, Dict, Any, Optional

class ProfileNormalizer:
    """
    Normalizes messy LinkedIn-style profile payloads into a deterministic format.
    """

    def __init__(self):
        pass

    def _clean_string(self, text: Any) -> str:
        """Trim and collapse whitespace in strings. Convert nulls to empty strings."""
        if text is None or not isinstance(text, str):
            return ""
        # Collapse multiple whitespaces into one
        return " ".join(text.split()).strip()

    def _split_name(self, full_name: str) -> tuple:
        """Split name: first token -> first_name, rest -> last_name."""
        tokens = full_name.split()
        if not tokens:
            return "", ""
        if len(tokens) == 1:
            return tokens[0], ""
        return tokens[0], " ".join(tokens[1:])

    def normalize(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Entry point for normalizing a single profile object."""
        
        # 1. Basic Field Extraction & Cleaning
        public_id = self._clean_string(raw.get("public_identifier"))
        raw_first = self._clean_string(raw.get("first_name"))
        raw_last = self._clean_string(raw.get("last_name"))
        raw_full = self._clean_string(raw.get("full_name"))
        
        # 2. Name Normalization
        first_name = raw_first
        last_name = raw_last
        full_name = raw_full

        if not full_name and (first_name or last_name):
            full_name = " ".join(filter(None, [first_name, last_name]))
        elif full_name and not (first_name or last_name):
            first_name, last_name = self._split_name(full_name)
        
        # Final pass to ensure all name parts are trimmed (already handled by _clean_string)

        # 3. URL Logic
        linkedin_url = self._clean_string(raw.get("linkedin_url"))
        if not linkedin_url and public_id:
            linkedin_url = f"https://www.linkedin.com/in/{public_id}/"

        # 4. Positions & Current Role
        raw_positions = raw.get("positions")
        if not isinstance(raw_positions, list):
            raw_positions = []
        
        normalized_positions = []
        current_role_title = ""
        company_name = ""

        for pos in raw_positions:
            if not isinstance(pos, dict):
                continue
            
            p_title = self._clean_string(pos.get("title"))
            p_company = self._clean_string(pos.get("company_name"))
            p_location = self._clean_string(pos.get("location"))
            
            normalized_positions.append({
                "title": p_title,
                "company_name": p_company,
                "location": p_location
            })

            # Detect current role (first current position)
            # A position counts as current if date_range.end is missing or null
            if not current_role_title:
                dr = pos.get("date_range")
                if isinstance(dr, dict):
                    if dr.get("end") is None:
                        current_role_title = p_title
                        company_name = p_company
                elif dr is None: # Missing entirely
                     current_role_title = p_title
                     company_name = p_company

        # 5. Educations
        raw_educations = raw.get("educations")
        if not isinstance(raw_educations, list):
            raw_educations = []
        
        normalized_educations = []
        for edu in raw_educations:
            if not isinstance(edu, dict):
                continue
            normalized_educations.append({
                "school_name": self._clean_string(edu.get("school_name")),
                "degree_name": self._clean_string(edu.get("degree_name")),
                "field_of_study": self._clean_string(edu.get("field_of_study"))
            })

        # 6. Final Field Aggregation
        headline = self._clean_string(raw.get("headline"))
        summary = self._clean_string(raw.get("summary"))
        location_name = self._clean_string(raw.get("location_name"))

        # 7. profile_text concatenation
        # lowercase concatenation of:
        # headline, summary, location_name, position titles, position company names, 
        # position locations, education school names, education degree names, education field_of_study values
        text_parts = []
        text_parts.append(headline)
        text_parts.append(summary)
        text_parts.append(location_name)
        
        for p in normalized_positions:
            text_parts.append(p["title"])
            text_parts.append(p["company_name"])
            text_parts.append(p["location"])
            
        for e in normalized_educations:
            text_parts.append(e["school_name"])
            text_parts.append(e["degree_name"])
            text_parts.append(e["field_of_study"])
            
        profile_text = " ".join(filter(None, text_parts)).lower()
        # Collapse any double spaces introduced by the join
        profile_text = " ".join(profile_text.split())

        return {
            "public_identifier": public_id,
            "linkedin_url": linkedin_url,
            "first_name": first_name,
            "last_name": last_name,
            "full_name": full_name,
            "headline": headline,
            "current_role_title": current_role_title,
            "company_name": company_name,
            "location_name": location_name,
            "summary": summary,
            "positions": normalized_positions,
            "educations": normalized_educations,
            "profile_text": profile_text
        }

def main():
    if len(sys.argv) < 2:
        print("Usage: python normalizer.py <file_or_directory_path>")
        sys.exit(1)

    path = sys.argv[1]
    normalizer = ProfileNormalizer()

    if os.path.isfile(path):
        files = [path]
    elif os.path.isdir(path):
        files = [os.path.join(path, f) for f in os.listdir(path) if f.endswith(".json")]
    else:
        print(f"Error: Path {path} not found.")
        sys.exit(1)

    results = []
    for f_path in files:
        try:
            with open(f_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                normalized = normalizer.normalize(raw_data)
                results.append(normalized)
        except Exception as e:
            print(f"Error processing {f_path}: {e}")

    if len(results) == 1 and os.path.isfile(path):
        print(json.dumps(results[0], indent=2))
    else:
        print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
