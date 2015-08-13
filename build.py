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
env.globals['lorem'] = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

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
        self.entries = []


class Tags(dict):
    def __missing__(self, key):
        value = self[key] = Tag(key)
        return value

    def render(self):
        for tag in self.values():
            tag.render()

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

tags.render()


Renderable.render_simple("works", tags=tags.list(), works=works)
Renderable.render_simple("biography")
Renderable.render_simple("index")
Renderable.render_simple("press_reviews")

print("built.")
