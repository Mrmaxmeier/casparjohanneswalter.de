print("building...")
import jinja2
import arrow
import time
import shutil
import os
import json
import markdown
import copy
from collections import defaultdict


BUILD_DIR = "../johannes_website_out/"
contents = [os.path.join(BUILD_DIR, i) for i in os.listdir(BUILD_DIR)]
[shutil.rmtree(i) if os.path.isdir(i) else os.unlink(i) for i in contents]

for folder in ["works", "tags"]:
    os.mkdir(BUILD_DIR + "/" + folder)

env = jinja2.Environment(loader=jinja2.FileSystemLoader(searchpath="./templates/"), lstrip_blocks=True, trim_blocks=True)
env.globals['last_built'] = arrow.utcnow()

def urlify_filename(s):
    return s.lower().replace(" ", "_")

class Renderable:
    def render(self):
        if not hasattr(self, "_templatename_"):
            self._templatename_ = self.__class__.__qualname__
        if not hasattr(self, "link"):
            self.link = "/" + self._templatename_ + ".html"
        if not hasattr(self, "path"):
            self.path = BUILD_DIR + self.link[1:]
        data = copy.copy(self.__dict__)
        data.update({key: self.__class__.__dict__[key] for key in self.__class__.__dict__ if not key.startswith("__")})
        if hasattr(self, "renderargs"):
            data.update(self.renderargs)
        with open(self.path, "w") as f:
            f.write(env.get_template(self._templatename_.lower() + ".html").render(**data))

    @classmethod
    def render_simple(cls, name, **kwargs):
        r = cls()
        r.__dict__.update(kwargs)
        r._templatename_ = name
        r.render()

class Tag(Renderable):
    def __init__(self, name):
        self.name = name
        self.link = "/tags/" + urlify_filename(self.name) + ".html"
        self.show = True
        self.isLink = True
        self.entries = []
        self._templatename_ = "works"
        self.isSubtag = False
        self.subtags = []

    @property
    def has_subtags(self):
        return len(self.subtags) > 0

    @property
    def renderargs(self):
        works = sorted(self.entries, key=lambda work: work.date.timestamp if work.date else 0, reverse=True)
        return dict(tags=tags.list(), works=works, by_instruments=tags["By Instruments"])


class Tags(dict):
    def __missing__(self, key):
        value = self[key] = Tag(key)
        return value

    def render(self):
        for tag in self.values():
            tag.render()

    def load_subtags(self, data):
        for tag, subtags in data.items():
            self[tag].subtags = [self[subtag] for subtag in subtags]
            for subtag in subtags:
                self[subtag].isSubtag = True

    def list(self):
        return [self[tag_name] for tag_name in sorted(self)]

tags = Tags()

class Work(Renderable):
    def __init__(self, data, postlist=[]):
        self.name = data['title']
        self.link = "/works/" + urlify_filename(self.name) + ".html"
        self.postlist = postlist
        self.postlist.append(self)
        self.tags = []
        self.content = None
        if 'content' in data:
            content = data["content"]
            with open("works/" + content, "r") as f:
                content_data = f.read()
            if content.endswith(".md"):
                self.content = markdown.markdown(content_data)
        self.add_tags(data['tags'])
        self.data = None
        if "year" in data:
            self.date = arrow.get(data["year"], data.get("month", 1), data.get("day", 1))
        self.media = data.get('media', [])
        self.media = [data if isinstance(data, list) else (data, data) for data in self.media]
        self.summary = data.get("summary")

    def add_tags(self, tag_names):
        for name in tag_names:
            tag = tags[name]
            self.tags.append(tag)
            tag.entries.append(self)

works = []

for work in os.listdir("works"):
    if not work.endswith(".json"):
        continue
    with open("works/" + work, "r") as f:
        data = json.load(f)
    w = Work(data)
    w.render()
    works.append(w)

works = sorted(works, key=lambda work: work.date.timestamp if work.date else 0, reverse=True)

with open("tags.json", "r") as f:
    tags.load_subtags(json.load(f))

tags["By Instruments"].show = False
tags["By Instruments"].isLink = False
tags.render()


Renderable.render_simple("works", tags=tags.list(), works=works, by_instruments=tags["By Instruments"], all=True)
Renderable.render_simple("biography")
Renderable.render_simple("index")
Renderable.render_simple("press_reviews")

print("copying static stuff")
shutil.copytree("static", BUILD_DIR + "static")

print("built.")
