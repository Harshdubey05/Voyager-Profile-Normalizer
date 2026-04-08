import json
import os
import sys
from normalizer import ProfileNormalizer

def run_evaluation():
    normalizer = ProfileNormalizer()
    inputs_dir = "tests/samples/inputs"
    expected_dir = "tests/samples/expected"
    report_file = "EVALUATION_REPORT.md"
    
    if not os.path.exists(inputs_dir) or not os.path.exists(expected_dir):
        print(f"Error: Missing test directories. Run generate_test_data.py first.")
        sys.exit(1)

    filenames = sorted([f for f in os.listdir(inputs_dir) if f.endswith(".json")])
    if not filenames:
        print(f"No samples found in {inputs_dir}")
        sys.exit(1)

    total_samples = len(filenames)
    fully_passed = 0
    field_stats = {}
    
    # Contract fields to track
    contract_fields = [
        "public_identifier", "linkedin_url", "first_name", "last_name", 
        "full_name", "headline", "current_role_title", "company_name", 
        "location_name", "summary", "positions", "educations", "profile_text"
    ]
    for field in contract_fields:
        field_stats[field] = 0

    table_rows = []

    for filename in filenames:
        input_path = os.path.join(inputs_dir, filename)
        expected_path = os.path.join(expected_dir, filename)
        
        with open(input_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
        with open(expected_path, "r", encoding="utf-8") as f:
            expected_data = json.load(f)
        
        actual_data = normalizer.normalize(raw_data)
        
        all_fields_match = True
        match_summary = []
        
        for field in contract_fields:
            if actual_data.get(field) == expected_data.get(field):
                field_stats[field] += 1
                match_summary.append("✅")
            else:
                field_stats[field] += 0
                match_summary.append("❌")
                all_fields_match = False
        
        if all_fields_match:
            fully_passed += 1
        
        # Add to table: File | Status | Detail
        status_icon = "✅ Pass" if all_fields_match else "❌ Fail"
        table_rows.append(f"| {filename} | {status_icon} | {''.join(match_summary)} |")

    # Generate Markdown Report
    with open(report_file, "w", encoding="utf-8") as f:
        f.write("# 📊 Evaluation Report: Voyager Profile Normalizer\n\n")
        
        f.write("## 📈 Performance Summary\n\n")
        pass_rate = (fully_passed / total_samples) * 100
        f.write(f"- **Total Samples**: {total_samples}\n")
        f.write(f"- **Overall Pass Rate**: {pass_rate:.1f}%\n")
        f.write(f"- **Contract Compliance**: {'100% Verified' if pass_rate == 100 else 'Issues Detected'}\n\n")
        
        f.write("### 🏗️ Field-Level Accuracy\n\n")
        f.write("| Field Name | Accuracy |\n")
        f.write("| :--- | :--- |\n")
        for field in contract_fields:
            accuracy = (field_stats[field] / total_samples) * 100
            f.write(f"| `{field}` | {accuracy:.1f}% |\n")
        
        f.write("\n## 🔍 Detailed Results (50 Samples)\n\n")
        f.write("| Sample ID | Result | Field Match Pattern |\n")
        f.write("| :--- | :--- | :--- |\n")
        f.write("\n".join(table_rows))
        f.write("\n\n---\n*Report generated automatically by run_eval.py*")

    print(f"Evaluation complete. Report saved to {report_file}")

if __name__ == "__main__":
    run_evaluation()
