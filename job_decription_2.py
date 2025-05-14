import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer

# Optional: Show all columns and wider output
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)
pd.set_option('display.max_colwidth', None)

# Step 1: Read the CSV
df = pd.read_csv('job.csv', encoding='ISO-8859-1')

# Step 2: Extract sections from Job Description
def extract_sections(text):
    if pd.isna(text):
        return '', '', ''
    text = text.replace('\n', ' ').strip()

    desc_match = re.split(r'Responsibilities:|RESPONSIBILITIES:', text)
    description = desc_match[0].strip()

    responsibilities = ''
    qualifications = ''

    if len(desc_match) > 1:
        res_qual_split = re.split(r'Qualifications:|Requirements:|QUALIFICATIONS:|REQUIREMENTS:', desc_match[1])
        responsibilities = res_qual_split[0].strip()
        if len(res_qual_split) > 1:
            qualifications = res_qual_split[1].strip()

    return description, responsibilities, qualifications

df[['Description', 'Responsibilities', 'Qualifications']] = df['Job Description'].apply(
    lambda x: pd.Series(extract_sections(x))
)

# Step 3: TF-IDF Keyword Extraction
def extract_keywords(corpus, top_n=5):
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)
    feature_names = vectorizer.get_feature_names_out()
    
    keywords_list = []
    for row in tfidf_matrix:
        row_array = row.toarray()[0]
        top_indices = row_array.argsort()[-top_n:][::-1]
        keywords = [feature_names[i] for i in top_indices if row_array[i] > 0]
        keywords_list.append(', '.join(keywords))  # Format as CSV-friendly string
    
    return keywords_list

df['Description_Keywords'] = extract_keywords(df['Description'].fillna(''))
df['Responsibilities_Keywords'] = extract_keywords(df['Responsibilities'].fillna(''))
df['Qualifications_Keywords'] = extract_keywords(df['Qualifications'].fillna(''))

# Step 4: Create final DataFrame including Job Description
df_final = df[['Job Title', 'Job Description', 'Description_Keywords', 'Responsibilities_Keywords', 'Qualifications_Keywords']]

# Step 5: Save to CSV
df_final.to_csv('job_description_2.csv', index=False)

df_final.to_excel('job_description_2.xlsx', index=False)

# Final output for verification
print("✅ job_description_2.csv saved successfully.\n")
print("✅ job_description_2.xlsx saved successfully.\n")
print(df_final.head().to_string(index=False))
