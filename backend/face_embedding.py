import face_recognition
import numpy as np

def generate_face_embedding(image):
    """
    Generate a 128-d face embedding from a given image.
    Returns a numpy array if a face is detected, otherwise returns None.
    """
    encodings = face_recognition.face_encodings(image)
    
    if len(encodings) == 0:
        print("❌ No face detected! Try again.")
        return None

    return encodings[0]  # Return the first detected face embedding

def image_to_embedding(image_path):
    """
    Load an image from a file and generate a face embedding.
    """
    image = face_recognition.load_image_file(image_path)
    return generate_face_embedding(image)

def embedding_to_list(embedding):
    """
    Convert a numpy embedding array to a list (for JSON storage).
    """
    return embedding.tolist()

def list_to_embedding(embedding_list):
    """
    Convert a list back to a numpy array.
    """
    return np.array(embedding_list)
    

# if __name__ == "__main__":
#     # For testing:
#     image_path = "current_face.jpg"
#     embedding = generate_face_embedding(image_path)
#     if embedding is not None:
#         emb_list = embedding_to_list(embedding)
#         print("✅ Face Embedding:", emb_list)
