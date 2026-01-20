import json

output_file="b1_nouns_output.json"

with open("german.json", "r", encoding="utf-8") as f:
    data = json.load(f)

a1 = []
a2 = []
b1 = []
for item in data:
    if(item["pos"]=="noun" and item["cefr_level"]=="B1"):
        a1.append(item)
    # if(item["pos"]=="noun" and item["cefr_level"]=="A2"):
    #     a2.append(item)
    # if(item["pos"]=="noun" and item["cefr_level"]=="B1"):
    #     b1.append(item)
    # break
# print(data)
print(len(a1))
print(len(a2))
print(len(b1))

import json

# write to a file called 'a1_words_output.json'
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(a1, f, ensure_ascii=False, indent=2)
