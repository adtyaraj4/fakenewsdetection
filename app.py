from flask import Flask, request, jsonify
from flask_cors import CORS
from ocr1 import extract_text_from_image
from brain import check_news
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)  # ✅ Fix CORS issues (VERY IMPORTANT)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data)).convert("RGB")

        # OCR
        text = extract_text_from_image(image)

        if not text.strip():
            return jsonify({
                "result": "VERDICT: Unknown\nCONFIDENCE SCORE: --\nANALYSIS: No readable text found in image."
            })

        # AI credibility check
        result = check_news(text)

        return jsonify({
            "text": text,
            "result": result
        })

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({
            "result": "VERDICT: Error\nCONFIDENCE SCORE: 0%\nANALYSIS: AI processing failed."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
