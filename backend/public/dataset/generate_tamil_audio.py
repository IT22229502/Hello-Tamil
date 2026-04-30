import os
import json
from gtts import gTTS

BASE = "."

for category in os.listdir(BASE):
    category_path = os.path.join(BASE, category)

    if not os.path.isdir(category_path):
        continue

    for word in os.listdir(category_path):
        word_path = os.path.join(category_path, word)

        if not os.path.isdir(word_path):
            continue

        json_file = os.path.join(word_path, "word.json")
        audio_file = os.path.join(word_path, "tamil_audio.mp3")

        # no word.json = skip
        if not os.path.exists(json_file):
            print("Missing word.json:", word_path)
            continue

        # old audio exists = skip safely
        if os.path.exists(audio_file):
            print("Skip existing:", audio_file)
            continue

        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            tamil_text = data["tamil"].strip()

            tts = gTTS(text=tamil_text, lang="ta")
            tts.save(audio_file)

            print("Created:", audio_file)

        except Exception as e:
            print("Error:", word_path, e)