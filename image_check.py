from ocr1 import extract_text_from_image
from brain import check_news
from PIL import Image

def check_image(image_path):
    print("📷 Extracting text from image...")

    # ✅ OPEN IMAGE AS PIL OBJECT
    image = Image.open(image_path).convert("RGB")

    # ✅ PASS PIL IMAGE (NOT PATH)
    text = extract_text_from_image(image)

    if not text:
        return "No readable text found in image."

    print("📝 Extracted Text:\n", text)
    print("\n🤖 Analyzing credibility...\n")

    result = check_news(text)
    return result


if __name__ == "__main__":
    image_path = "new.png"  # <-- your railway image
    verdict = check_image(image_path)
    print("✅ RESULT:\n", verdict)
