import pandas as pd
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

# --- Global variables ---
vectorstore = None
faq_data = None
translator = None
explainer_pipeline = None # For the "Expert Explainer" mode

# --- Constants ---
# MODIFIED: Language codes now match the frontend JS
LANG_CODES = {
    'en-US': 'eng_Latn', 'mr-IN': 'mar_Deva', 'hi-IN': 'hin_Deva',
    'bn-IN': 'ben_Beng', 'gu-IN': 'guj_Gujr'
}
GREETINGS_EN = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "namaste", "namaskar"]

def create_rag_chain():
    global vectorstore, faq_data, translator, explainer_pipeline

    print("Loading FAQ data...")
    faq_data = pd.read_csv("faq_data.csv")
    questions = faq_data['Question'].tolist()
    
    print("Loading embedding model...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2", model_kwargs={'device': 'cpu'})
    
    print("Creating FAISS vector store...")
    vectorstore = FAISS.from_texts(questions, embeddings)

    print("Loading translation model (NLLB)...")
    translator_model_name = "facebook/nllb-200-distilled-600M"
    translator_tokenizer = AutoTokenizer.from_pretrained(translator_model_name)
    translator_model = AutoModelForSeq2SeqLM.from_pretrained(translator_model_name)
    translator = pipeline("translation", model=translator_model, tokenizer=translator_tokenizer, device=-1)

    print("Loading FLAN-T5-small for Explainer Mode...")
    explainer_model_name = "google/flan-t5-small"
    explainer_tokenizer = AutoTokenizer.from_pretrained(explainer_model_name)
    explainer_model = AutoModelForSeq2SeqLM.from_pretrained(explainer_model_name)
    explainer_pipeline = pipeline("text2text-generation", model=explainer_model, tokenizer=explainer_tokenizer, max_new_tokens=150)
    
    print("--- All models loaded and ready. ---")

# MODIFIED: The function now accepts 'mode' and returns a dictionary payload
def get_rag_response(query: str, language: str, mode: str = 'chat'):
    response_payload = {"answer": "An error occurred.", "contexts": []}

    # 1. Translate query to English
    if language != 'en-US':
        try:
            source_lang_code = LANG_CODES[language]
            english_query = translator(query, src_lang=source_lang_code, tgt_lang='eng_Latn')[0]['translation_text']
        except Exception as e:
            response_payload["answer"] = "Error during translation."
            return response_payload
    else:
        english_query = query

    # 2. Handle Greetings
    if english_query.strip().lower() in GREETINGS_EN:
        english_answer = "Hello! How can I help you with your banking-related questions today?"
        response_payload["contexts"] = ["Greeting detected"]
    else:
        # 3. Handle different modes
        try:
            results = vectorstore.similarity_search_with_score(english_query, k=3)
            if not results: raise ValueError("No relevant documents found.")
            
            retrieved_contexts = [
                faq_data[faq_data['Question'] == doc.page_content]['Answer'].values[0]
                for doc, score in results
            ]
            response_payload["contexts"] = retrieved_contexts

            if mode == 'explain':
                print("Using Expert Explainer Mode...")
                context_string = "\n\n".join(retrieved_contexts)
                prompt = f"Based ONLY on the following context, provide a detailed and helpful explanation for the user's question.\n\nContext:\n{context_string}\n\nQuestion: {english_query}\n\nDetailed Explanation:"
                english_answer = explainer_pipeline(prompt)[0]['generated_text']
            else: # Default 'chat' mode
                print("Using Fast Retrieval (Chat) Mode...")
                english_answer = retrieved_contexts[0]

        except Exception as e:
            print(f"RAG Error: {e}")
            english_answer = "I'm sorry, I had an issue finding an answer in our knowledge base."
            response_payload["contexts"] = [str(e)]

    # 4. Translate the final English answer back
    if language != 'en-US':
        try:
            target_lang_code = LANG_CODES[language]
            response_payload["answer"] = translator(english_answer, src_lang='eng_Latn', tgt_lang=target_lang_code)[0]['translation_text']
        except Exception:
            response_payload["answer"] = "Error during final translation."
    else:
        response_payload["answer"] = english_answer
        
    return response_payload