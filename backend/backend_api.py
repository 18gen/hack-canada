from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename

from face_embedding import generate_face_embedding
from supabase_client import store_user_face_embedding, verify_user_face_embedding

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/register', methods=['POST'])
def register():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files['image']
    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    filename = secure_filename(image_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(file_path)

    # Generate embedding
    embedding = generate_face_embedding(file_path)
    if embedding is None:
        os.remove(file_path)
        return jsonify({"error": "No face detected"}), 400

    # Store embedding in the 'users' table
    success = store_user_face_embedding(user_id, embedding)
    os.remove(file_path)
    
    if success:
        return jsonify({"message": "Face registered successfully"}), 200
    else:
        return jsonify({"error": "Failed to store embedding"}), 500

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

    # Generate embedding for verification
    embedding = generate_face_embedding(file_path)
    if embedding is None:
        os.remove(file_path)
        return jsonify({"error": "No face detected"}), 400

    matched = verify_user_face_embedding(user_id, embedding, tolerance=0.5)
    os.remove(file_path)

    if matched:
        return jsonify({"message": "Face verified successfully"}), 200
    else:
        return jsonify({"error": "Face verification failed"}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
