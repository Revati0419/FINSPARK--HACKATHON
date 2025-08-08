import pandas as pd
from langchain_community.document_loaders import CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import torch

# --- Global variables for our models and data ---
qa_chain = None
translator = None # <-- NEW: We will have a single translator pipeline

# --- NEW: Language codes for the NLLB model ---
# Maps our simple codes (e.g., 'mr') to the official codes the NLLB model requires.
LANG_CODES = {
    'en': 'eng_Latn',
    'mr': 'mar_Deva',
    'hi': 'hin_Deva',
    'bn': 'ben_Beng',
    'gu': 'guj_Gujr'
}

def create_rag_chain():
    """
    Initializes the RAG pipeline AND the single, powerful translation model.
    """
    global qa_chain, translator

    # --- 1. Load and set up the main RAG chain (this part is unchanged) ---
    print("Loading FAQ data and setting up the RAG chain...")
    loader = CSVLoader(file_path="faq_data.csv", source_column="Answer", metadata_columns=['Question', 'Class'])
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    docs = text_splitter.split_documents(documents)
    
    embeddings_model_name = "sentence-transformers/all-MiniLM-L6-v2"
    model_kwargs = {'device': 'cpu'}
    embeddings = HuggingFaceEmbeddings(model_name=embeddings_model_name, model_kwargs=model_kwargs)
    
    vectorstore = FAISS.from_documents(docs, embeddings)
    
    print("Loading generation model (FLAN-T5-base)...")
    llm_model_name = "google/flan-t5-base"
    llm_tokenizer = AutoTokenizer.from_pretrained(llm_model_name)
    llm_model = AutoModelForSeq2SeqLM.from_pretrained(llm_model_name, torch_dtype=torch.bfloat16)
    
    pipe = pipeline("text2text-generation", model=llm_model, tokenizer=llm_tokenizer, max_length=512)
    llm = HuggingFacePipeline(pipeline=pipe)
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="map_reduce",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True
    )
    print("RAG chain is ready!")

    # --- 2. NEW: Load the single NLLB translation model ---
    print("Loading multilingual translation model (NLLB)... This may take a few minutes.")
    model_name = "facebook/nllb-200-distilled-600M"
    translator_tokenizer = AutoTokenizer.from_pretrained(model_name)
    translator_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    translator = pipeline(
        "translation",
        model=translator_model,
        tokenizer=translator_tokenizer,
        device=-1 # Use CPU
    )
    print("Translation model loaded successfully!")

    return qa_chain, translator


def get_rag_response(query: str, language: str):
    """
    Handles the full multilingual workflow using the NLLB model.
    """
    if language == 'en' or not language:
        print("Processing English query...")
        result = qa_chain({"query": query})
        return result['result']
    
    print(f"Processing query in language: '{language}'")
    
    # --- 1. Translate incoming query TO English ---
    try:
        source_lang_code = LANG_CODES.get(language)
        if not source_lang_code:
            return f"Language code '{language}' is not supported."
            
        # The NLLB pipeline needs source and target languages specified
        translated_result = translator(query, src_lang=source_lang_code, tgt_lang='eng_Latn')
        translated_query = translated_result[0]['translation_text']
        print(f"Translated query to English: '{translated_query}'")
    except Exception as e:
        print(f"Error during translation to English: {e}")
        return "Sorry, I encountered an error during translation."

    # --- 2. Run the core RAG chain on the English query ---
    print("Invoking RAG chain with translated query...")
    result = qa_chain({"query": translated_query})
    english_answer = result['result']
    print(f"Generated English answer: '{english_answer}'")
    
    # --- 3. Translate the English answer BACK to the original language ---
    try:
        # We use the same translator pipeline, just reverse the language codes
        final_result = translator(english_answer, src_lang='eng_Latn', tgt_lang=source_lang_code)
        final_answer = final_result[0]['translation_text']
        print(f"Translated answer back to '{language}': '{final_answer}'")
    except Exception as e:
        print(f"Error during translation from English: {e}")
        return "Sorry, I encountered an error during the final translation."
        
    return final_answer