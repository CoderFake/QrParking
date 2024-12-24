from django import template
from django.contrib.humanize.templatetags.humanize import intcomma

register = template.Library()


@register.filter
def format_money(value):
    try:
        value = float(value)
        return f"{intcomma(int(value))} VNĐ"
    except (ValueError, TypeError):
        return "0 VNĐ"
