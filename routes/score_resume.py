import os
import sys
import json
import pandas as pd
import pdfplumber
import re
from sentence_transformers import SentenceTransformer, util
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load BERT model once
model = SentenceTransformer('all-MiniLM-L6-v2')

section_weights = {
    'skills': 0.35,
    'experience': 0.35,
    'education': 0.15,
    'tech_stack': 0.1,
    'certifications': 0.5
}

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_sections_from_text(text):
    section_patterns = {
        'skills': r"(skills?|technologies)[\s\-:]*",
        'experience': r"(experience|background)[\s\-:]*",
        'education': r"(education|qualification)[\s\-:]*",
        'tech_stack': r"(tech\s*stack|technologies|tools)[\s\-:]*",
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

def keyword_match_score(jd_text, resume_text):
    jd_keywords = set(re.findall(r'\b\w+\b', jd_text.lower()))
    resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
    matches = jd_keywords.intersection(resume_words)
    return len(matches) / len(jd_keywords) if jd_keywords else 0

def compute_weighted_score(jd_sections, resume_sections):
    total_score = 0
    for section in section_weights:
        jd_text = jd_sections.get(section, "")
        resume_text = resume_sections.get(section, "")
        if not jd_text or not resume_text:
            continue
        jd_emb = model.encode(jd_text, convert_to_tensor=True)
        res_emb = model.encode(resume_text, convert_to_tensor=True)
        sim = util.cos_sim(jd_emb, res_emb).item()
        keyword_score = keyword_match_score(jd_text, resume_text)
        final_section_score = (0.7 * sim) + (0.3 * keyword_score)
        total_score += final_section_score * section_weights[section]
    return round(total_score, 4)

def send_email(recipient_email, candidate_name, job_title, score):
    sender_email = "your-email@gmail.com"
    sender_password = "your-app-password"

    subject = f"Interview Invitation for {job_title}"
    body = f"""
    Dear {candidate_name},

    Congratulations! Based on our screening process, you have been shortlisted for the role of {job_title}.
    Match Score: {score}

    Please respond with your availability for the interview.

    Regards,
    Recruitment Team
    """

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())
        return True
    except Exception as e:
        print("Email Error:", e)
        return False

def main():
    try:
        # Read JSON from stdin
        input_data = json.load(sys.stdin)
        resume_path = input_data["resumePath"]
        name = input_data["name"]
        email = input_data["email"]
        job_title = input_data["jobTitle"]
        company = input_data["company"]

        df = pd.read_csv("job_keywords_output.csv")
        row = df[(df["Job Title"] == job_title) & (df["Company"] == company)].iloc[0]

        jd_combined = (
            "Skills: " + ", ".join(eval(row["Responsibilities_Keywords"])) + "\n" +
            "Experience: " + ", ".join(eval(row["Description_Keywords"])) + "\n" +
            "Education: " + ", ".join(eval(row["Qualifications_Keywords"])) + "\n" +
            "Tech Stack: " + ", ".join(eval(row["Qualifications_Keywords"])) + "\n" +
            "Certifications: " + ", ".join(eval(row["Responsibilities_Keywords"])) + "\n"
        )
        resume_text = extract_text_from_pdf(resume_path)
        resume_sections = extract_sections_from_text(resume_text)
        jd_sections = extract_sections_from_text(jd_combined)

        score = compute_weighted_score(jd_sections, resume_sections)
        email_sent = False

        if score >= 0.55:
            email_sent = send_email(email, name, job_title, score)

        print(json.dumps({
            "match_score": score,
            "shortlisted": score >= 0.55,
            "email_sent": email_sent
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
