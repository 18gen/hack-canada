from supabase import create_client
import config
import face_recognition
import numpy as np
from face_embedding import embedding_to_list, list_to_embedding

# 1. Create the Supabase client
supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

def face_already_exists(new_embedding, tolerance=0.4):
    """
    Check if 'new_embedding' matches any face_embedding in the 'users' table.
    Returns True if a match is found, else False.
    """
    response = supabase.table("users").select("id, face_embedding").execute()

    # If no data or something went wrong, assume no duplicates
    if not response.data:
        return False

    for row in response.data:
        # Skip users without a stored embedding
        if row["face_embedding"] is None:
            continue

        stored_embedding = list_to_embedding(row["face_embedding"])
        results = face_recognition.compare_faces([stored_embedding], new_embedding, tolerance=tolerance)
        if results[0]:
            # Found a match => face already exists
            return True

    return False

def store_user_face_embedding(user_id, embedding):
    """
    Store a new face embedding for the user in the 'users' table,
    but only if the face doesn't already exist in the database.
    """
    # 1) Check for duplicates among all users
    if face_already_exists(embedding, tolerance=0.4):
        print("❌ Face already exists in the database!")
        return False

    # 2) Convert numpy array to list for JSON storage
    emb_list = embedding_to_list(embedding)

    # 3) Update the user row with the new face embedding
    response = supabase.table("users") \
        .update({"face_embedding": emb_list}) \
        .eq("id", user_id) \
        .execute()

    # 4) Check if data is returned (means update succeeded)
    if response.data:
        print(f"✅ Face embedding stored for user: {user_id}")
        return True
    else:
        print("❌ Error storing face embedding:", response)
        return False

def get_user_face_embedding(user_id):
    """
    Retrieve the stored face embedding for a given user from the 'users' table.
    Returns a numpy array if found, otherwise None.
    """
    response = supabase.table("users").select("face_embedding").eq("id", user_id).single().execute()

    # If no data is returned or the query failed, there's no stored embedding
    if not response.data:
        print("❌ No stored face embedding found for this user or an error occurred.")
        return None

    embedding_list = response.data["face_embedding"]
    if embedding_list is None:
        print(f"❌ User {user_id} has no face_embedding stored.")
        return None

    return list_to_embedding(embedding_list)

def verify_user_face_embedding(user_id, new_embedding, tolerance=0.4):
    """
    Compare the new face embedding to the stored embedding in the 'users' table.
    Returns True if they match, False otherwise.
    """
    stored_embedding = get_user_face_embedding(user_id)
    if stored_embedding is None:
        print(f"❌ No stored embedding for user {user_id}.")
        return False

    results = face_recognition.compare_faces([stored_embedding], new_embedding, tolerance=tolerance)
    distances = face_recognition.face_distance([stored_embedding], new_embedding)

    print("Face distance:", distances[0])
    return results[0]

def register_user(first_name, last_name, email, embedding):
    """
    Register a new user with the given details and face embedding.
    """
    emb_list = embedding_to_list(embedding)

    response = supabase.table("users").insert([
        {"first_name": first_name, "last_name": last_name, "email": email, "face_embedding": emb_list}
    ]).execute()

    user_id = response.data[0]["id"] if response.data else None
    if not user_id:
        print("❌ Error registering user:", response)
        return False

    return user_id

def check_email(email):
    """
    Check if the email is already registered in the 'users' table.
    Returns user_id if found, otherwise None.
    """
    response = supabase.table("users").select("id").eq("email", email).single().execute()
    return response.data.get("id") if response.data else None
