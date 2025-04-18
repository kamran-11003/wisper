import whisper
import sys
import os
import json

# Load whisper model
model = whisper.load_model("base")

# Check if the file path is passed
if len(sys.argv) != 2:
    print(json.dumps({"error": "Usage: python transcribe.py <file_path>"}))
    sys.exit(1)

# Get the file path from the command-line arguments
file_path = sys.argv[1]

# Check if the file exists
if not os.path.isfile(file_path):
    print(json.dumps({"error": f"The file {file_path} does not exist."}))
    sys.exit(1)

try:
    # Transcribe the video/audio with word-level timestamps
    result = model.transcribe(file_path, word_timestamps=True)

    # Create a list of words with their timestamps
    words_with_timestamps = []
    for segment in result["segments"]:
        for word in segment["words"]:
            words_with_timestamps.append({
                "word": word["word"].strip(),
                "start": word["start"],
                "end": word["end"]
            })

    # Output the transcription with timestamps as JSON
    print(json.dumps(words_with_timestamps))

except Exception as e:
    print(json.dumps({"error": f"Error occurred during transcription: {str(e)}"}))
    sys.exit(1)
