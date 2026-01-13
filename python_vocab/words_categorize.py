import json

input_file="a1_words_output.json"
output_file = "a1_nouns_clean.json"

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

def get_article(gender):
    gender_map = {
        "masculine": "der",
        "feminine": "die",
        "neuter": "das"
    }
    return gender_map.get(gender.lower(), "")

# Convert to simplified flashcard format
flashcards = []
id_counter = 1
for item in data:
    if item.get("pos") == "noun":  # Only include nouns
        flashcards.append({
            "id": id_counter,
            "noun": item.get("word"),
            "article": get_article(item.get("gender", "")),
            "english": item.get("english_translation")
        })
        id_counter += 1

# Write the simplified JSON to a new file
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(flashcards, f, ensure_ascii=False, indent=2)

print(f"Converted {len(flashcards)} nouns to flashcards and saved to flashcards.json")