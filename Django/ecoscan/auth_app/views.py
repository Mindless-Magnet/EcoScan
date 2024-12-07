from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib import messages

def auth_login(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return redirect('/')
        else:
            messages.error(request, 'Invalid email or password')
    return render(request, 'login_signup.html')



from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        full_name = data.get('full_name')
        email = data.get('email')
        password = data.get('password')

        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already in use'}, status=400)

        user = User.objects.create_user(username=email, email=email, password=password)
        user.first_name = full_name
        user.save()
        return JsonResponse({'message': 'Account created successfully'})

    return JsonResponse({'message': 'Invalid request method'}, status=405)
