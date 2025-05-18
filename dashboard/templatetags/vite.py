# dashboard/templatetags/vite.py

import json
import os
from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()

@register.simple_tag
def vite_asset(entry):


    dist_dir = os.path.join(settings.BASE_DIR, 'frontend', 'dist')

    manifest_path = os.path.join(dist_dir, 'manifest.json')
    if not os.path.exists(manifest_path):
        manifest_path = os.path.join(dist_dir, '.vite', 'manifest.json')

    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
    except FileNotFoundError:
        return f'<!-- No se encontró manifest: {manifest_path} -->'

    if entry not in manifest:
        return f'<!-- Entry "{entry}" no encontrado en manifest -->'

    asset = manifest[entry]
    tags = []


    for css_file in asset.get('css', []):
        tags.append(f'<link rel="stylesheet" href="/static/{css_file}">')


    js_file = asset.get('file')
    tags.append(f'<script type="module" src="/static/{js_file}"></script>')

    return mark_safe("\n".join(tags))
