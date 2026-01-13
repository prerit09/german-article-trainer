import json

with open("german.json", "r", encoding="utf-8") as f:
    data = json.load(f)

pos = []
a1 = []
for item in data:
    if(item["pos"]=="noun" and item["cefr_level"]=="A1"):
        a1.append(item)
# for item in data:
#     pos.append(item["pos"])

word = []
for item in a1:
    word.append((item["word"]))
print(len(set(word)))
# set_a1 = set(a1)