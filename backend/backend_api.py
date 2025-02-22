from flask import Flask, request, jsonify
import os
from face_embedding import generate_face_embedding, embedding_to_list, list_to_embedding
from supabase_client import register_face_embedding, get_user_face_embedding, verify_face_embedding
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Endpoint for registering a face (sign up / account setup)
@app.route('/api/register', methods=['POST'])
def register():
    # Check if an image file is part of the request
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files['image']
    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # Save the image temporarily
    filename = secure_filename(image_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(file_path)

    # Generate the face embedding from the uploaded image
    embedding = generate_face_embedding(file_path)
    if embedding is None:
        os.remove(file_path)
        return jsonify({"error": "No face detected"}), 400

    # Register the embedding in your database
    if register_face_embedding(user_id, embedding):
        os.remove(file_path)
        return jsonify({"message": "Face registered successfully"}), 200
    else:
        os.remove(file_path)
        return jsonify({"error": "Face registration failed - face might already be registered"}), 409


# Endpoint for verifying a face (vote verification or sign in)
@app.route('/api/verify', methods=['POST'])
def verify():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files['image']
    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    filename = secure_filename(image_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(file_path)

    # Generate the embedding for the new image
    embedding = generate_face_embedding(file_path)
    if embedding is None:
        os.remove(file_path)
        return jsonify({"error": "No face detected"}), 400

    # Verify the new embedding against the stored embedding for this user
    if verify_face_embedding(user_id, embedding, tolerance=0.5):
        os.remove(file_path)
        return jsonify({"message": "Face verified successfully"}), 200
    else:
        os.remove(file_path)
        return jsonify({"error": "Face verification failed"}), 401

if __name__ == '__main__':
    # Run the API on all interfaces on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
