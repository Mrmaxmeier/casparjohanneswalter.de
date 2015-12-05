#!/usr/bin/python3

print("building...")
import jinja2
import arrow
import time
import shutil
import os
import json
import markdown
import copy
import sh
from collections import defaultdict


BUILD_DIR = os.getenv("BUILD_DIR", "../johannes_website_out/")
contents = [os.path.join(BUILD_DIR, i) for i in os.listdir(BUILD_DIR)]
[shutil.rmtree(i) if os.path.isdir(i) else os.unlink(i) for i in contents]

for folder in ["works", "tags"]:
	os.mkdir(BUILD_DIR + "/" + folder)

env = jinja2.Environment(loader=jinja2.FileSystemLoader(searchpath="./templates/"), lstrip_blocks=True, trim_blocks=True)
env.globals['last_built'] = arrow.utcnow()

def urlify_filename(s):
	return s.lower().replace(" ", "_")

def group(l, n):
	nl = []
	for i, e in enumerate(l):
		if i % n == 0:
			nl.append([e])
		else:
			nl[-1].append(e)
	return nl

class Renderable(object):
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

		try:
			with open(self.path, "w") as f:
				f.write(env.get_template(self._templatename_.lower() + ".html").render(**data))
		except Exception as e:
			raise e

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
	def has_entries(self):
		return len(self.entries) > 0

	@property
	def renderargs(self):
		works = sorted(self.entries, key=lambda work: work.date.timestamp if work.date else 0, reverse=True)
		return dict(tags=tags.list(), workslists=group(works, 2), by_instruments=tags["by Instruments"])


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
		self.data = data
		self.name = data['title']
		self.link = "/works/" + urlify_filename(self.name) + ".html"
		self.postlist = postlist
		self.postlist.append(self)
		self.tags = []
		self.content = None
		# if 'content' in data:
		#     content = data["content"]
		#     with open("works/" + content, "r") as f:
		#         content_data = f.read()
		#     if content.endswith(".md"):
		#         self.content = markdown.markdown(content_data)
		self.add_tags(data['tags'])
		if "year" in data:
			self.date = arrow.get(data["year"], data.get("month", 1), data.get("day", 1))
		self.media = data.get('media', [])
		self.media = [data if isinstance(data, list) else (data, data) for data in self.media]
		self.summary = data.get("summary")
		self.versions = data.get("versions")
		if self.versions:
			nv = []
			for version in self.versions:
				v = copy.deepcopy(self.data)
				v.pop("versions")
				v.update(version)
				nv.push(v)
			self.versions = nv
		self.renderargs = {"work": self}

	def add_tags(self, tag_names):
		for name in tag_names:
			tag = tags[name]
			self.tags.append(tag)
			tag.entries.append(self)

	def has(self, key):
		if key in self.data:
			if isinstance(self.data[key], str):
				return self.data[key] != ""
			return True
		return False

	def __getitem__(self, key):
		if key in self.data:
			if not key in ["tags", "media"]:
				if isinstance(self.data[key], list):
					return "\n".join(self.data[key])
			return self.data[key]
		else:
			raise ValueError(key)



works = []

for work in os.listdir("works"):
	if not work.endswith(".json"):
		continue
	with open("works/" + work, "r") as f:
		try:
			data = json.load(f)
		except ValueError as e:
			print(work)
			raise e
	w = Work(data)
	w.render()
	works.append(w)

works = sorted(works, key=lambda work: work.date.timestamp if work.date else 0, reverse=True)

with open("tags.json", "r") as f:
	tags.load_subtags(json.load(f))

tags["by Instruments"].show = False
tags["by Instruments"].isLink = False
tags["by Genre"].isLink = False
print("render tags")
tags.render()


Renderable.render_simple("works", tags=tags.list(), workslists=group(works, 2), by_instruments=tags["by Instruments"], all=True)
Renderable.render_simple("biography")
Renderable.render_simple("index")
Renderable.render_simple("press")
Renderable.render_simple("research")

print("webpacking")
sh.Command("./node_modules/webpack/bin/webpack.js")()

print("copying static stuff")
shutil.copytree("static", BUILD_DIR + "static")
print("built.")
