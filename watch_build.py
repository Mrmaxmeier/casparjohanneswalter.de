#!/usr/bin/python3

import sys
import time
import logging
import sh
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler
from watchdog.events import FileSystemEventHandler

class Builder(FileSystemEventHandler):
	def on_any_event(self, event):
		print(event)
		if event.src_path.endswith(".bundle.js"):
			return

		print()
		self.build()

	def build(self):
		sh.python3("./build.py", _out=lambda d: print(d, end=""))

if __name__ == "__main__":
	logging.basicConfig(level=logging.INFO,
						format='%(asctime)s - %(message)s',
						datefmt='%Y-%m-%d %H:%M:%S')
	path = sys.argv[1] if len(sys.argv) > 1 else '.'
	event_handler = LoggingEventHandler()
	builder = Builder()
	observer = Observer()
	observer.schedule(event_handler, path, recursive=True)
	observer.schedule(builder, path, recursive=True)
	observer.start()
	try:
		builder.build()
		while True:
			time.sleep(1)
	except KeyboardInterrupt:
		observer.stop()
	observer.join()
