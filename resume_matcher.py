import fitz  # PyMuPDF
import pandas as pd
import re
from sentence_transformers import SentenceTransformer, util

# Load BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

# 1️⃣ Extract resume text from PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# 2️⃣ Extract sections using improved regex
def extract_sections_from_text(text):
    section_patterns = {
        'skills': r"(skills?|technologies)[\s\-:]*",
        'experience': r"(experience|background)[\s\-:]*",
        'education': r"(education|qualification)[\s\-:]*",
        'certifications': r"(certifications?)[\s\-:]*"
    }

    sections = {}
    for key, pattern in section_patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            start = match.end()
            next_starts = [text.find(pat, start) for pat in section_patterns.values() if text.find(pat, start) != -1]
            end = min(next_starts) if next_starts else len(text)
            sections[key] = text[start:end].strip()
    return sections

# 3️⃣ Compute weighted cosine similarity
section_weights = {
    'skills': 0.4,
    'experience': 0.3,
    'education': 0.2,
    'certifications': 0.1
}

def compute_weighted_score(jd_sections, resume_sections):
    total_score = 0
    for section in section_weights:
        jd_text = jd_sections.get(section, "")
        resume_text = resume_sections.get(section, "")

        if not jd_text or not resume_text:
            print(f"⚠️ Missing data in section '{section}', skipping...")
            continue

        jd_emb = model.encode(jd_text, convert_to_tensor=True)
        res_emb = model.encode(resume_text, convert_to_tensor=True)
        sim = util.cos_sim(jd_emb, res_emb).item()

        print(f"✅ Section: {section} | Similarity: {round(sim, 4)} | Weight: {section_weights[section]}")
        total_score += sim * section_weights[section]

    return round(total_score, 4)

# 4️⃣ Load job keyword data and resume
df = pd.read_csv("job_keywords_output.csv")
resume_text = extract_text_from_pdf("C8631.pdf")
resume_sections = extract_sections_from_text(resume_text)

# 5️⃣ Iterate through all job titles
for idx, row in df.iterrows():
    job_title = row["Job Title"]
    try:
        jd_combined = (
            "Skills: " + ", ".join(eval(row["Description_Keywords"])) + "\n" +
            "Experience: " + ", ".join(eval(row["Responsibilities_Keywords"])) + "\n" +
            "Education: " + ", ".join(eval(row["Qualifications_Keywords"])) + "\n" +
            "Certifications: AWS Certified, Google Cloud"
        )

        jd_sections = extract_sections_from_text(jd_combined)

        print(f"\n🔍 Processing Job Title: {job_title}")
        print("📌 JD Sections:", jd_sections)

        score = compute_weighted_score(jd_sections, resume_sections)
        print(f"📊 Final Match Score for '{job_title}': {score}")

    except Exception as e:
        print(f"⚠️ Could not process job title '{job_title}': {e}")

