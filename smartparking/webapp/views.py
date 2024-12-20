from django.http import JsonResponse
from django.shortcuts import render
from django.utils import translation


def index(request):
    return render(request, 'webapp/home/index.html')


def language_setting(request):
    if request.method == "POST":
        language = request.POST.get('language', 'vi')
        if language not in ['en', 'vi']:
            language = 'vi'

        request.session['language'] = language
        translation.activate(language)

        return JsonResponse({"status": "success", "language": language})
    else:

        return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

