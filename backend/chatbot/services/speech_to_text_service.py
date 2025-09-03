import openai
import tempfile
import os
from django.conf import settings

class SpeechToTextService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    def transcribe_audio(self, audio_file):
        """
        Transcribe audio file using OpenAI's Whisper API
        """
        try:
            # Create a temporary file to store the audio
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                # Write the audio data to the temporary file
                for chunk in audio_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            # Open the temporary file and transcribe it
            with open(temp_file_path, 'rb') as audio:
                transcript = openai.Audio.transcribe(
                    model="whisper-1",
                    file=audio,
                    response_format="text"
                )

            # Clean up the temporary file
            os.unlink(temp_file_path)

            return transcript

        except Exception as e:
            print(f"Error in speech to text conversion: {str(e)}")
            return None

    def get_structured_data(self, transcript, data_type='ticket'):
        """
        Extract structured data from the transcript based on type
        """
        try:
            if data_type == 'ticket':
                prompt = f"""
                Extract the following information from this IT support issue into JSON format:
                - summary: A brief description of the issue
                - category: The type of issue (Hardware, Software, Network, Access, Other)
                - urgency: Priority level (Low, Medium, High, Critical)
                - impact: Impact level (Individual, Team, Department, Organization)

                Issue description: {transcript}

                Return only the JSON object without explanation.
                """
            else:
                return None

            response = openai.Completion.create(
                engine="text-davinci-003",
                prompt=prompt,
                max_tokens=200,
                temperature=0.3,
                n=1
            )

            return response.choices[0].text.strip()

        except Exception as e:
            print(f"Error extracting structured data: {str(e)}")
            return None