from flask import Flask, request, jsonify
import whisper
import os

# Initialize Flask app and Whisper model
app = Flask(__name__)
model = whisper.load_model("base")

# Create an endpoint for file upload and transcription
@app.route('/transcribe', methods=['POST'])
def transcribe_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    
    # Check if the file is an MP4 video
    if file.filename == '' or not file.filename.endswith('.mp4'):
        return jsonify({"error": "Invalid file type. Please upload an MP4 video."}), 400
    
    # Save the file temporarily
    file_path = os.path.join("uploads", file.filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    file.save(file_path)

    try:
        # Transcribe the video
        result = model.transcribe(file_path)
        transcript = result["text"]
        
        # Clean up the temporary file
        os.remove(file_path)
        
        # Return the transcription as JSON
        return jsonify({"transcription": transcript})

    except Exception as e:
        # Clean up the temporary file on error
        os.remove(file_path)
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
