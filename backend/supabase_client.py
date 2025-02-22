from supabase import create_client
import config
import numpy as np
import face_recognition
from face_embedding import embedding_to_list, list_to_embedding

# Connect to Supabase
supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

def get_all_face_embeddings():
    """
    Fetch all stored face embeddings from Supabase.
    Returns a list of numpy arrays.
    """
    response = supabase.table("face_embeddings").select("embedding").execute()
    stored = []
    if response.data:
        for record in response.data:
            # Each embedding is stored as a JSON array
            stored.append(list_to_embedding(record["embedding"]))
    return stored

def register_face_embedding(new_embedding):
    """
    Register a new face embedding only if it does not match any existing embedding.
    Returns True if registration is successful, False if a duplicate is detected.
    """
    stored_embeddings = get_all_face_embeddings()
    
 
    if stored_embeddings:
        results = face_recognition.compare_faces(stored_embeddings, new_embedding, tolerance=0.4)
        if any(results):
            print("❌ Face already registered! Duplicate not allowed.")
            return False

    # If no match, store the new embedding.
    emb_list = embedding_to_list(new_embedding)
    data = {"embedding": emb_list}
    supabase.table("face_embeddings").insert(data).execute()
    return True

def verify_face_embedding(new_embedding):
    """
    Verify if the new face embedding matches any stored embedding.
    Returns True if a match is found, else False.
    """
    stored_embeddings = get_all_face_embeddings()
    if not stored_embeddings:
        print("❌ No registered faces found!")
        return False

    results = face_recognition.compare_faces(stored_embeddings, new_embedding, tolerance=0.4)
    if any(results):
        print("✅ Face Matched! Authentication successful.")
        return True
    else:
        print("❌ No match found! Verification failed.")
        return False

