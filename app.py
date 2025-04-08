import pdfplumber
import requests

# Step 1: Extract Text from PDF
def extract_text_from_pdf(file_path):
    full_text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"
    return full_text

# Step 2: Send Extracted Text to HuggingFace LLM
def extract_info_with_hf(text):
    prompt = f"""
You're an AI assistant that extracts structured information from raw CV/job text.

Extract and return:
- Education
- Experience
- Skills
- Certifications
- Achievements
- A short 3-sentence summary

From the following input:
{text[:3000]}

Respond only in JSON format with keys: education, experience, skills, certifications, achievements , summary.
"""

    API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
    headers = {"Authorization": "Bearer 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"}  # Replace with your own token if needed

    response = requests.post(API_URL, headers=headers, json={"inputs": prompt})
    result = response.json()

    # Handle response depending on structure
    if isinstance(result, list):
        return result[0]["generated_text"]
    else:
        return result

# === MAIN EXECUTION ===
pdf_path = "C1781.pdf"  # Replace with your actual PDF file path
extracted_text = extract_text_from_pdf(pdf_path)
print(extracted_text)
parsed_info = extract_info_with_hf(extracted_text)

print("\n===== EXTRACTED STRUCTURED INFO =====\n")
print(parsed_info)
