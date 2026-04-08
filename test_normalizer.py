import unittest
import json
from normalizer import ProfileNormalizer

class TestProfileNormalizer(unittest.TestCase):
    def setUp(self):
        self.normalizer = ProfileNormalizer()

    def test_cleaning_and_whitespace(self):
        raw = {"public_identifier": "  alice-smith  ", "headline": "VP   Growth"}
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["public_identifier"], "alice-smith")
        self.assertEqual(normalized["headline"], "VP Growth")

    def test_name_splitting(self):
        raw = {"full_name": "Alice Bob Smith"}
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["first_name"], "Alice")
        self.assertEqual(normalized["last_name"], "Bob Smith")

    def test_name_splitting_single_token(self):
        raw = {"full_name": "Alice"}
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["first_name"], "Alice")
        self.assertEqual(normalized["last_name"], "")

    def test_name_joining(self):
        raw = {"first_name": "Alice", "last_name": "Smith"}
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["full_name"], "Alice Smith")

    def test_url_generation(self):
        raw = {"public_identifier": "alice-smith"}
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["linkedin_url"], "https://www.linkedin.com/in/alice-smith/")

    def test_url_preservation(self):
        raw = {"public_identifier": "alice-smith", "linkedin_url": "https://custom.url/alice"}
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["linkedin_url"], "https://custom.url/alice")

    def test_current_role_detection(self):
        raw = {
            "positions": [
                {
                    "title": "Current Role",
                    "date_range": {"end": None}
                },
                {
                    "title": "Old Role",
                    "date_range": {"end": {"year": 2023}}
                }
            ]
        }
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["current_role_title"], "Current Role")

    def test_current_role_missing_date_range(self):
        raw = {
            "positions": [
                {
                    "title": "Implicit Current Role"
                }
            ]
        }
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["current_role_title"], "Implicit Current Role")

    def test_profile_text_concatenation(self):
        raw = {
            "headline": "Engineer",
            "location_name": "NYC",
            "positions": [{"title": "Dev", "company_name": "Google", "location": "Remote"}],
            "educations": [{"school_name": "MIT"}]
        }
        normalized = self.normalizer.normalize(raw)
        expected_text = "engineer nyc dev google remote mit"
        self.assertEqual(normalized["profile_text"], expected_text)

    def test_incomplete_payload(self):
        raw = {}
        # Should not crash
        normalized = self.normalizer.normalize(raw)
        self.assertEqual(normalized["public_identifier"], "")
        self.assertEqual(normalized["positions"], [])

if __name__ == "__main__":
    unittest.main()
