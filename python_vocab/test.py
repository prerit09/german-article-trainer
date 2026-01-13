import json

with open("german.json", "r", encoding="utf-8") as f:
    data = json.load(f)

pos = []
for item in data:
    pos.append(item["pos"])

print(set(pos))