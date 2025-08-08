import pandas as pd
from langchain_community.document_loaders import CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate # <-- NEW IMPORT
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import torch

# --- Global variable to hold the initialized RAG chain ---
qa_chain = None

def create_rag_chain():
    """
    Initializes the entire RAG pipeline and returns the QA chain.
    """
    global qa_chain

    # 1. Load Data
    print("Loading FAQ data from CSV...")
    loader = CSVLoader(file_path="faq_data.csv", source_column="Answer", metadata_columns=['Question', 'Class'])
    documents = loader.load()
    print(f"Loaded {len(documents)} documents.")

    # 2. Split Documents
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    docs = text_splitter.split_documents(documents)
    print(f"Split into {len(docs)} chunks.")

    # 3. Create Embeddings
    print("Loading embedding model (MiniLM)...")
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    model_kwargs = {'device': 'cpu'} 
    embeddings = HuggingFaceEmbeddings(model_name=model_name, model_kwargs=model_kwargs)
    print("Embedding model loaded.")

    # 4. Create Vector Store
    print("Creating FAISS vector store...")
    vectorstore = FAISS.from_documents(docs, embeddings)
    print("Vector store created successfully.")

    # 5. Load the LLM
    print("Loading generation model (FLAN-T5-base)...")
    llm_tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
    llm_model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base", torch_dtype=torch.bfloat16)
    
    pipe = pipeline(
        "text2text-generation",
        model=llm_model,
        tokenizer=llm_tokenizer,
        max_length=512,
        temperature=0.7,
        top_p=0.95
    )
    llm = HuggingFacePipeline(pipeline=pipe)
    print("Generation model loaded.")

    # --- NEW CODE BLOCK: Define a custom prompt template ---
    prompt_template = """
    You are a helpful and polite banking assistant for the Bank of Maharashtra. Use the following context to answer the user's question. Be conversational and clear.

    If the user's question is not about banking or is not covered by the context, politely say that you can only answer banking-related questions based on the information you have.
    If the user just says "hello", "hi", or a similar greeting, respond with a friendly greeting and ask how you can help with their banking needs.

    CONTEXT:
    {context}

    QUESTION: {question}

    CONVERSATIONAL ANSWER:
    """
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )
    # --- END OF NEW CODE BLOCK ---

    # 6. Create the RetrievalQA Chain, now with the custom prompt
    print("Creating the RAG chain...")
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT} # <-- MODIFIED: Add the custom prompt here
    )
    print("RAG chain is ready!")
    return qa_chain

def get_rag_response(query: str):
    """
    Takes a user query and uses the RAG chain to generate a response.
    """
    if not qa_chain:
        return "The RAG chain is not initialized yet."
        
    print(f"Invoking RAG chain for query: '{query}'")
    result = qa_chain({"query": query})
    
    # --- NEW: Add a debugging print to see the full result ---
    print("\n--- RAG Chain Result ---")
    print(result)
    print("------------------------\n")
    
    return result['result']