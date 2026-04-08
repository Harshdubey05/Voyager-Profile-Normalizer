import json
import os
import unittest
from normalizer import ProfileNormalizer

class TestBulkNormalizer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.normalizer = ProfileNormalizer()
        cls.inputs_dir = "tests/samples/inputs"
        cls.expected_dir = "tests/samples/expected"

    def test_all_samples(self):
        input_files = [f for f in os.listdir(self.inputs_dir) if f.endswith(".json")]
        self.assertGreater(len(input_files), 0, "No sample files found to test.")
        
        failures = []
        for filename in input_files:
            input_path = os.path.join(self.inputs_dir, filename)
            expected_path = os.path.join(self.expected_dir, filename)
            
            with open(input_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
            
            with open(expected_path, "r", encoding="utf-8") as f:
                expected_data = json.load(f)
            
            actual_data = self.normalizer.normalize(raw_data)
            
            # Use JSON comparison for deep check
            if actual_data != expected_data:
                failures.append(filename)
        
        if failures:
            self.fail(f"Bulk test failed for {len(failures)} files: {', '.join(failures)}")
        else:
            print(f"Successfully verified {len(input_files)} samples.")

if __name__ == "__main__":
    unittest.main()
