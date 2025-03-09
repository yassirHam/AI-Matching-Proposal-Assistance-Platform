import pandas as pd

def clean_data():
    df_anapec = pd.read_csv("anapec_jobs.csv")
    df_je_recrute = pd.read_csv("je_recrute_jobs.csv")
    df_anapec["Job Title"] = df_anapec["Job Title"].str.title()
    df_je_recrute["Job Title"] = df_je_recrute["Job Title"].str.title()
    if "Job Location" in df_anapec.columns:
        df_anapec["Job Location"] = df_anapec["Job Location"].str.title()
    df_anapec.drop_duplicates(inplace=True)
    df_je_recrute.drop_duplicates(inplace=True)
    df_anapec.fillna("Not specified", inplace=True)
    df_je_recrute.fillna("Not specified", inplace=True)
    df_anapec.to_csv("clean_anapec_jobs.csv", index=False)
    df_je_recrute.to_csv("clean_je_recrute_jobs.csv", index=False)
    print("✅ Anapec and JeRecrute data cleaned and saved!")

def clean_linkedin_data():
    df_linkedin = pd.read_csv("linkedin_posts.csv")
    df_linkedin["Post Text"] = df_linkedin["Post Text"].str.title()
    df_linkedin.drop_duplicates(subset=["Post Text", "Post Link"], inplace=True)
    df_linkedin.fillna("Not specified", inplace=True)
    df_linkedin.to_csv("clean_linkedin_posts.csv", index=False)
    print("✅ LinkedIn data cleaned and saved!")

if __name__ == "__main__":
    clean_data()
    clean_linkedin_data()