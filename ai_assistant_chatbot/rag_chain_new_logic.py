import pandas as pd
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import HuggingFacePipeline
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import torch
import re

# --- Global variables ---
vectorstore = None
faq_data = None
translator = None
llm_pipeline = None # We'll need direct access to the LLM pipeline

# --- Constants for our logic ---
LANG_CODES = {'en': 'eng_Latn', 'mr': 'mar_Deva', 'hi': 'hin_Deva', 'bn': 'ben_Beng', 'gu': 'guj_Gujr'}
GREETINGS_EN = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "namaste", "namaskar"]

def create_rag_chain():
    """
    This function now sets up a FAST retrieval system and loads the LLM for summarization.
    """
    global vectorstore, faq_data, translator, llm_pipeline

    print("Loading FAQ data...")
    faq_data = pd.read_csv("faq_data.csv")
    
    questions = faq_data['Question'].tolist()
    
    print("Loading embedding model (for fast search)...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2", model_kwargs={'device': 'cpu'})
    
    print("Creating FAISS vector store for fast retrieval...")
    vectorstore = FAISS.from_texts(questions, embeddings)

    print("Loading generation model (FLAN-T5-small)...")
    llm_model_name = "google/flan-t5-small"
    llm_tokenizer = AutoTokenizer.from_pretrained(llm_model_name)
    llm_model = AutoModelForSeq2SeqLM.from_pretrained(llm_model_name, torch_dtype=torch.bfloat16)
    
    # We save the pipeline directly to use it manually
    llm_pipeline = pipeline("text2text-generation", model=llm_model, tokenizer=llm_tokenizer, max_length=512)

    print("Loading translation model...")
    translator_model_name = "facebook/nllb-200-distilled-600M"
    translator_tokenizer = AutoTokenizer.from_pretrained(translator_model_name)
    translator_model = AutoModelForSeq2SeqLM.from_pretrained(translator_model_name)
    translator = pipeline("translation", model=translator_model, tokenizer=translator_tokenizer, device=-1)
    
    print("--- All models loaded. System is in Manual RAG Mode. ---")

def get_rag_response(query: str, language: str):
    """
    Handles the full multilingual workflow using a manual, robust RAG process.
    """
    # 1. Translate query to English
    if language != 'en':
        try:
            english_query = translator(query, src_lang=LANG_CODES[language], tgt_lang='eng_Latn')[0]['translation_text']
        except Exception: return "Error during translation."
    else:
        english_query = query

    # 2. Handle Greetings
    if english_query.strip().lower() in GREETINGS_EN:
        english_answer = "Hello! How can I help you with your banking-related questions today?"
    else:
        # 3. Manual RAG for Real Questions
        try:
            print("Finding relevant documents...")
            # Retrieve the top 3 most relevant documents (their questions)
            results = vectorstore.similarity_search(english_query, k=3)
            
            if not results: raise ValueError("No relevant documents found.")
            
            context = ""
            for doc in results:
                # Find the full Answer for each retrieved Question
                retrieved_answer = faq_data[faq_data['Question'] == doc.page_content]['Answer'].values[0]
                context += retrieved_answer + "\n\n"

            # 4. Manually call the LLM with a clear prompt
            prompt = f"""
            Based on the following context, please provide a concise, conversational answer to the user's question.

            Context:
            {context}

            Question: {english_query}

            Answer:
            """
            
            print("Generating final answer from context...")
            llm_result = llm_pipeline(prompt)
            english_answer = llm_result[0]['generated_text']

        except Exception as e:
            print(f"RAG Error: {e}")
            english_answer = "I'm sorry, I had an issue finding a comprehensive answer."

    # 5. Translate back
    if language != 'en':
        try:
            return translator(english_answer, src_lang='eng_Latn', tgt_lang=LANG_CODES[language])[0]['translation_text']
        except Exception: return "Error during final translation."
    else:
        return english_answer