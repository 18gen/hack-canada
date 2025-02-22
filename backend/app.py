# backend/app.py
from flask import Flask, request, jsonify
import base64
import os

app = Flask(__name__)

@app.route('/api/face_recognition', methods=['POST'])
def face_recognition():
    data = request.get_json()
    image_data = data.get('image')
    
    if not image_data:
        return jsonify({'message': 'No image provided'}), 400

    # The image data is typically in the format: "data:image/png;base64,iVBORw0KGgoAAAANS..."
    try:
        header, encoded = image_data.split(',', 1)
        image_bytes = base64.b64decode(encoded)
    except Exception as e:
        return jsonify({'message': 'Invalid image data', 'error': str(e)}), 400

    # Ensure the uploads directory exists
    upload_dir = 'uploads'
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, 'captured.png')

    # Save the image to the file system
    with open(file_path, 'wb') as f:
        f.write(image_bytes)
    
    # Here you could integrate your facial recognition logic.
    # For example, using the face_recognition library:
    # import face_recognition
    # image = face_recognition.load_image_file(file_path)
    # face_locations = face_recognition.face_locations(image)
    # if not face_locations:
    #     return jsonify({'message': 'No face detected'}), 400
    # else:
    #     # Process recognition, compare with stored encodings, etc.
    #     pass

    return jsonify({'message': 'Image received and processed'}), 200

if __name__ == '__main__':
    app.run(debug=True)
