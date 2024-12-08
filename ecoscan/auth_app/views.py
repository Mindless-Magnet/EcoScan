# views.py
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
import json

@ensure_csrf_cookie
@require_http_methods(["GET", "POST"])
def auth_view(request):
    # Get the form type from URL parameter
    form_type = request.GET.get('form', 'login')  # default to login if not specified
    context = {
        'active_form': form_type
    }
    return render(request, 'login.html', context)

@require_http_methods(["POST"])
def signup_api(request):
    try:
        data = json.loads(request.body)
        full_name = data.get('full_name')
        email = data.get('email')
        password = data.get('password')
        
        if not all([full_name, email, password]):
            return JsonResponse({'message': 'All fields are required'}, status=400)
            
        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already in use'}, status=400)
            
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=full_name
        )
        
        return JsonResponse({
            'message': 'Account created successfully',
            'redirect_url': '/auth/?form=login'
        })
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)

@require_http_methods(["POST"])
def login_api(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({'message': 'Please provide both email and password'}, status=400)
            
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'message': 'Login successful',
                'redirect_url': '/',
                'user': {
                    'email': user.email,
                    'full_name': user.first_name
                }
            })
        else:
            return JsonResponse({'message': 'Invalid email or password'}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)