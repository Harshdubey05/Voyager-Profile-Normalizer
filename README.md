# 🚀 Voyager Profile Normalizer (Python Utility)

A robust Python utility designed to normalize messy LinkedIn-style profile payloads into a deterministic JSON format.

## ✨ Features
- 🧼 **String Cleaning**: Trims and collapses multiple whitespaces across all fields.
- 🆔 **URL Generation**: Automatically builds LinkedIn URLs from public identifiers.
- 👤 **Name Normalization**: Deterministically splits full names into first/last parts or joins them.
- 💼 **Role Detection**: Identifies current roles and companies based on open-ended date ranges.
- 📝 **Profile Search Text**: Generates a unified, lowercased searchable text blob from all profile attributes.
- 🛡️ **Fail-Safe**: Handles missing fields, null values, and malformed inputs without crashing.

## 🛠️ Requirements
- **Python 3.x** (Standard library only, no external dependencies required).

## 🚀 Quick Start

### 1. Normalize a Single File
```bash
python normalizer.py candidate_pack/fixtures/profile_1.json
```

### 2. Normalize an Entire Directory
```bash
python normalizer.py candidate_pack/fixtures/
```

### 3. Run Unit Tests
```bash
python test_normalizer.py
```

## 📁 Output Contract
The utility produces a flattened JSON object with the following schema:
- `public_identifier`, `linkedin_url`
- `first_name`, `last_name`, `full_name`
- `headline`, `current_role_title`, `company_name`, `location_name`, `summary`
- `positions`: list of `{title, company_name, location}`
- `educations`: list of `{school_name, degree_name, field_of_study}`
- `profile_text`: searchable concatenation of all data.

## 🧪 Testing Edge Cases
The included test suite covers:
- Name splitting (e.g., "First Middle Last" -> "First", "Middle Last")
- Null array and text field conversions
- Implicit current role detection (missing end dates)
- Whitespace collapsing (e.g., `"  VP   Growth  "` -> `"VP Growth"`)
