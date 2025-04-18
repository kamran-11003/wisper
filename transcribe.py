import whisper
import sys
import os

# Load whisper model
model = whisper.load_model("base")

# Check if the file path is passed
if len(sys.argv) != 2:
    print("Usage: python transcribe.py <file_path>")
    sys.exit(1)

# Get the file path from the command-line arguments
file_path = sys.argv[1]

# Check if the file exists
if not os.path.isfile(file_path):
    print(f"Error: The file {file_path} does not exist.")
    sys.exit(1)

try:
    print("converting")
    # Transcribe the video/audio
    result = model.transcribe(file_path)

    # Output the transcription
    print(result["text"])

except Exception as e:
    print(f"Error occurred during transcription: {str(e)}")
    sys.exit(1)
