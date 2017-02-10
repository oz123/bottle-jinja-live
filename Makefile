.PHONY: build run docker

build:
	docker build -t oz123/bottle-jinja-editor .

run:
	python3 app.py


docker:
	docker run  -t  -p 8080:8080 oz123/bottle-jinja-editor
