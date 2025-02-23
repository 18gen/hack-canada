from flask import Flask, request, jsonify
import config
import os
from werkzeug.utils import secure_filename
from supabase import create_client
from face_embedding import generate_face_embedding, image_to_embedding
from supabase_client import face_already_exists, register_user, verify_user_face_embedding

supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/register', methods=['POST'])
def register():
    # first name, last name, email
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    email = request.form.get("email")
    if not first_name or not last_name or not email:
        return jsonify({"error": "All fields are required"}), 400
    
    # check if email in use already
    try:
        response = supabase.table("users").select("id").eq("email", email).single().execute()
        if not response.data:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": "Email in use, please log in."}), 500
    
    
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files['image']

    filename = secure_filename(image_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(file_path)

    # Generate embedding
    embedding = image_to_embedding(file_path)
    
    print(embedding)
    
    if face_already_exists(embedding, tolerance=0.4):
        os.remove(file_path)
        return jsonify({"error": "Face already exists, please sign in."}), 400
    else:
        print(first_name, last_name, email, embedding)
        user_id = register_user(first_name, last_name, email, embedding)
        if user_id:
            os.remove(file_path)
            return jsonify({"user_id": user_id}), 200
        else:
            os.remove(file_path)
            return jsonify({"error": "Error registering user"}), 500
        
    

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
    embedding = image_to_embedding(file_path)
    if embedding is None:
        os.remove(file_path)
        return jsonify({"error": "No face detected"}), 400

    matched = verify_user_face_embedding(user_id, embedding, tolerance=0.4)
    os.remove(file_path)

    if matched:
        return jsonify({"message": "Face verified successfully"}), 200
    else:
        return jsonify({"error": "Face verification failed"}), 401
    
@app.route('/api/login', methods=['POST'])
def login():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files['image']
    email = request.form.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # check if user exists if so get user_id
    try:
        response = supabase.table("users").select("id").eq("email", email).single().execute()
        if not response.data:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": "Email not found, please register."}), 500
    
    user_id = response.data.get("id")

    filename = secure_filename(image_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(file_path)

    # Generate embedding for verification
    embedding = image_to_embedding(file_path)
    if embedding is None:
        os.remove(file_path)
        return jsonify({"error": "No face detected"}), 400

    matched = verify_user_face_embedding(user_id, embedding, tolerance=0.4)
    os.remove(file_path)

    if matched:
        return jsonify({"user_id": user_id}), 200
    else:
        return jsonify({"error": "Face verification failed, please try again"}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)