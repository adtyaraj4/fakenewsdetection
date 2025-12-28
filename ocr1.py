import cv2
import numpy as np
import pytesseract

# 👉 ONLY needed on Windows (remove if not using Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_image(pil_image):
    """
    Accepts a PIL Image object and returns extracted text using Tesseract OCR
    """

    # Convert PIL Image → OpenCV format
    img = np.array(pil_image)

    # Convert RGB → BGR if needed
    if len(img.shape) == 3:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Resize (improves OCR accuracy)
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Reduce noise
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    # Thresholding for better text detection
    gray = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)[1]

    # OCR extraction
    text = pytesseract.image_to_string(gray, config="--psm 6")

    return text.strip()


# 🔹 Test OCR independently (optional)
if __name__ == "__main__":
    from PIL import Image
    img = Image.open("test.png")  # any test image
    print(extract_text_from_image(img))
