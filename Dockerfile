FROM alpine:3.5
RUN apk add --no-cache python3 py3-pip
RUN pip3 install bottle jinja2
ADD . /code/
WORKDIR /code
CMD ["rm -r __pycache__; python app.py"]
