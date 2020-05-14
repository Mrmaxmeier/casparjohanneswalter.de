import csv
import json
from pprint import pprint

works = []

medialinks = [
    "video (full)",
    "audio (full)",
    "score video (full)",
    "audio example",
    "audioExample",
    "score example",
    "scoreExample",
    "score video (excerpt)",
    "score video (excerpt 2)",
    "score video (excerpt 3)",
    "program note",
    "additional material"
]

with open("works.csv") as csvfile:
    csvreader = csv.reader(csvfile)
    fields = next(csvreader)
    print(fields)
    for row in csvreader:
        if row[1] == '':
            continue
        print()
        d = {}
        for k, v in zip(fields, row):
            if v and v != "Ja":
                d[k] = v.strip()
        if "tags" in d:
            d["tags"] = d["tags"].split(", ")
        else:
            print("tags missing?", d)
        media = []
        for k in medialinks:
            if k in d:
                link = d[k].split(" ")[0]
                desc = " ".join(d[k].split(" ")[1:]) or k
                media.append([desc, link])
                del d[k]
        if media:
            d["media"] = media
        d["index"] = int(d["index"])
        if len(d) < 3:
            continue
        pprint(d)
        works.append(d)

with open("works.json", "w") as f:
    json.dump(works, f, sort_keys=True, indent=2, ensure_ascii=False)
