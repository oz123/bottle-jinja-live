# bottle-jinja-live

A small live editor for jinja2 templates, inspired by

http://stackoverflow.com/q/20145709/492620. The OP
posted a repository with a flask application that does that,
I could not resist and built it with bottle.py.

## Usage:

```

	$ pip install bottle jinja2
	$ python app.py

```

Careful this application now listens to all incoming requests on 0.0.0.0.

You can run with Docker using:

```
	$ make build
	$ make run
```
