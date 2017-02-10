FROM alpine:3.5
RUN apk add --no-cache python3 py3-pip
RUN pip3 install bottle jinja2
ADD . /code/
WORKDIR /code
EXPOSE 8080
CMD ["/bin/sh", "-c", "python3 app.py"]
