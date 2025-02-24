from flask import Flask, request, jsonify
from flask_cors import CORS
import config
import os
from werkzeug.utils import secure_filename
from supabase import create_client
from face_embedding import image_to_embedding
from supabase_client import face_already_exists, register_user, verify_user_face_embedding
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
gemini_api_key = os.getenv('GEMINI_API_KEY')

client = genai.Client(api_key=gemini_api_key)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/register', methods=['POST'])
def register():
    # first name, last name, email
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    email = request.form.get("email")
    birthday = request.form.get("birthday")

    if not first_name or not last_name or not email or not birthday:
        return jsonify({"error": "All fields are required"}), 400

    # Check if email is already in use
    try:
        response = supabase.table("users").select("id").eq("email", email).execute()
        # If data exists and has entries, email is in use
        if response.data and len(response.data) > 0:
            return jsonify({"error": "Email in use, please log in."}), 400
    except Exception as e:
        return jsonify({"error": "Error checking user existence"}), 500

    # If we get here, email is not in use. Continue with registration...
    
    # Check if image is provided
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files['image']
    filename = secure_filename(image_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(file_path)

    # Generate embedding
    embedding = image_to_embedding(file_path)

    # Check if face already exists
    if face_already_exists(embedding, tolerance=0.4):
        os.remove(file_path)
        return jsonify({"error": "Face already exists, please sign in."}), 400

    # Register the new user
    user_id = register_user(first_name, last_name, email, birthday, embedding)
    os.remove(file_path)  # Clean up file

    if user_id:
        return jsonify({"user_id": user_id}), 200
    else:
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
    
@app.route('/api/get-votes/<poll_id>', methods=['GET'])
def get_votes(poll_id):
    try:
        response = supabase.rpc('get_poll_votes', params={'poll_id_input': poll_id}).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analysis/<poll_id>', methods=['GET'])
def analysis(poll_id):
    try:
        # A) Fetch poll options
        options_response = supabase.table("options").select("id, option_text").eq("poll_id", poll_id).execute()
        options = options_response.data
        if not options:
            return jsonify({"error": "No options found for this poll."}), 404
        

        # B) Fetch votes for those options
        option_ids = [opt['id'] for opt in options]
        votes_response = supabase.table("votes").select("option_id, user_id").in_("option_id", option_ids).execute()
        votes = votes_response.data
        if not votes:
            return jsonify({"error": "No votes recorded for this poll."}), 404
    
        
        # C) Extract unique user IDs
        user_ids = list(set(vote['user_id'] for vote in votes))

        # D) Fetch user birthdays
        users_response = supabase.table("users").select("id, birthday").in_("id", user_ids).execute()
        users = users_response.data

        # E) Map votes to user birth months
        vote_stats = {}
        for vote in votes:
            user = next((u for u in users if u['id'] == vote['user_id']), None)
            birth_group = "Unknown"
            if user and user['birthday']:
                month = int(user['birthday'].split('-')[1])  # Extract month from birthday
                birth_group = f"Month_{month}"

            if vote['option_id'] not in vote_stats:
                vote_stats[vote['option_id']] = {}
            if birth_group not in vote_stats[vote['option_id']]:
                vote_stats[vote['option_id']][birth_group] = 0

            vote_stats[vote['option_id']][birth_group] += 1
    
        # F) Convert option_id to candidate names
        candidate_vote_stats = {opt['option_text']: vote_stats.get(opt['id'], {}) for opt in options}

        # G) Generate text prompt for Gemini AI
        gemini_prompt = f"""
        You are an AI expert in analyzing voting behavior. Given the following poll results (votes per candidate grouped by voter birth month), provide a short and insightful analysis on potential age-group influence. Do not mention the poll_id or any variable names such as (Month_5) but talk about the options using their option_texts. 

        **Poll ID:** {poll_id}
        **Candidate-Birthday Vote Breakdown:** 
        {candidate_vote_stats}

        **Question:** What trends can be observed based on voter birth months? Keep the response under 100 words.
        """

        print(f"Gemini Prompt: {gemini_prompt}")  # Debugging statement

        # H) Call Gemini AI
        result = client.models.generate_content(model='gemini-2.0-flash-001', contents=gemini_prompt)
        response_text = result.text

        print(f"Gemini Response: {response_text}")  # Debugging statement

        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error: {str(e)}")  # Debugging statement
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)