# -*- coding: utf-8 -*-
import os
import string
import yaml

from html import escape


from functools import partial
from random import choice

import bottle
from bottle import (TEMPLATE_PATH, jinja2_template as template,
                    Bottle)
from bottle import HTTPResponse, request, abort

from jinja2 import Environment, exceptions


TEMPLATE_PATH.append(os.path.join(os.path.dirname(__file__), 'templates'))

app = Bottle()


def render_template(request):
    """render a template with vars"""
    jinja2_env = Environment()

    # Load the template
    try:
        jinja2_tpl = jinja2_env.from_string(request.json.get('template',
                                                             request.json.get('templateContent')))
    except (exceptions.TemplateSyntaxError, exceptions.TemplateError) as e:
        return "Syntax error in jinja2 template: {0}".format(e)

    values = request.json['values']
    # Check YAML for errors
    if values:
        try:
            values = values = yaml.load(values, Loader=yaml.SafeLoader)
        except ValueError as e:
            return "Value error in YAML: {0}".format(e)

    # If ve have empty var array or other errors we need to catch it and show
    try:
        rendered_jinja2_tpl = jinja2_tpl.render(values)
    except (ValueError, TypeError) as e:
        return "Error in your values input filed: {0}".format(e)

    return rendered_jinja2_tpl


def generate_csrf_token(length):
    '''Generate a random string using range [a-zA-Z0-9].'''
    chars = string.ascii_letters + string.digits
    return ''.join([choice(chars) for i in range(length)])


def require_csrf():
    def decorator(callback):
        def wrapper(*args, **kwargs):
            if request.is_ajax and request.json:
                token = request.json.get("csrf_token")
            else:
                token = request.params.csrf_token
            if not token or token != global_vars['csrf_token']:
                abort(400)
            return callback(*args, **kwargs)
        return wrapper
    return decorator


global_vars = {'csrf_token': generate_csrf_token(48)}

j2template = partial(template, template_settings={'globals': global_vars})


@app.route("/")
def editor():
    path = os.path.join(os.getcwd(), "editable-templates")
    templates = os.listdir(path)
    with open(os.path.join(path, "example-template.j2")) as f:
        template_content = f.read()

    return j2template('editor.html',
                      template_content=template_content,
                      templates=templates,
                      name="example-template.j2")


@app.get("/load/<name:path>")
def load_template(name):
    path = os.path.join(os.getcwd(), "editable-templates")
    with open(os.path.join(path, name)) as fh:
        content = fh.read()
    return HTTPResponse({'status': 200, 'body': content})


@app.get("/preview/<name:path>")
def load_tmp_template(name):
    args = {'status': 200}
    path = os.path.join(os.getcwd(), "editable-templates")
    preview_template = os.path.join(path, "preview-%s" % name)
    try:
        with open(preview_template, "rb") as fh:
            args['body'] = fh.read()
        os.unlink(preview_template)
    except FileNotFoundError:
        args = {'body': 'Expired'}

    return HTTPResponse(**args)


@app.post("/template/")
@require_csrf()
def template_():
    jinja2_env = Environment()
    template_content = request.json['templateContent']
    path = os.path.join(os.getcwd(), "editable-templates")
    if request.json.get("preview"):
        name = request.json["templateName"]
        with open(os.path.join(path, "preview-%s" % name), "w") as fh:
            rendered_jinja2_tpl = render_template(request)
            fh.write(rendered_jinja2_tpl)
        return HTTPResponse(**{"status": 200, "body": "/preview/%s" % name})
    ans = {}
    try:
        jinja2_env.from_string(template_content)
    except (exceptions.TemplateSyntaxError, exceptions.TemplateError) as e:
        ans = {'status': 412,
               'body': "Syntax error in jinja2 template: {0}".format(e)}
    if not ans:
        with open(os.path.join(path, "example-template.j2"), "w") as f:
            f.write(template_content)
            ans = {'status': 200,
                   'body': "Successfully saved !"}

    return HTTPResponse(**ans)


@app.route('/validate-jinja/', method=['GET', 'POST'])
@require_csrf()
def convert():

    rendered_jinja2_tpl = render_template(request)

    show_white_spaces = request.json['showwhitespaces']
    if int(show_white_spaces):
        # Replace whitespaces with a visible character (will be grayed with
        # javascript)
        rendered_jinja2_tpl = rendered_jinja2_tpl.replace(' ', u'•')
    return escape(rendered_jinja2_tpl).replace('\n', '<br />')


if __name__ == "__main__":
    bottle.debug(True)

    @app.route('/assets/<filepath:path>')
    def server_static(filepath):
        print(filepath)
        yield bottle.static_file(filepath, root='./assets/')

    bottle.run(app, host='0.0.0.0', debug=True, reloader=True, port=8080)
