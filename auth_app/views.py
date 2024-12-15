# views.py
from django.contrib.auth import authenticate, login,login as auth_login,logout as auth_logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render,redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
import json
from django.contrib import messages
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
    


def signup(request):
    if request.method == "POST":
        username = request.POST['username']
        email = request.POST['email'].strip()
        password = request.POST['password']
        confirm_password = request.POST['confirm_password'] 
        name = request.POST['name'] 
        # Basic validation
        if not username or not email or not password or not confirm_password:
            messages.error(request, 'All fields are required!')
            return redirect('signup')

        if password != confirm_password:
            messages.error(request, 'Passwords do not match!')
            return redirect('signup')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists!')
            return redirect('signup')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists!')
            return redirect('signup')

        try:
            # Create a new user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=name
            )
            user.save()

            # Automatically log the user in
            auth_login(request, user)
            messages.success(request, 'Registration successful! Welcome aboard!')
            return redirect('login.html')  # Replace 'home' with the name of your homepage URL

        except Exception as e:
            messages.error(request, f'An unexpected error occurred: {str(e)}')
            return redirect('login.html')

    return render(request, 'login.html')  # Ensure this template exists and is configured


def login(request):
    if request.method == "POST":
        if 'login' in request.POST.get('form'):
            context = {
            'active_form': 'login'
            }
            email = request.POST['email']
            password = request.POST['password']
            # Validate inputs
            if not email or not password:
                messages.error(request, 'Both email and password are required!')
                
                return redirect('login')

            try:
                # Authenticate using the username (retrieved by email)
                user = User.objects.filter(email=email).first()
                if user:
                    user = authenticate(request, username=user.username, password=password)
                    if user is not None:
                        auth_login(request, user)
                        messages.success(request, 'Login successful!')
                        return redirect('index')  # Replace 'home' with the name of your homepage URL
                    else:
                        messages.error(request, 'Invalid credentials!')
                else:
                    messages.error(request, 'No account found with this email!')

            except Exception as e:

                messages.error(request, f'An error occurred during login: {str(e)}')
            return redirect('login')
        else:
            username = request.POST['username']
            context = {
            'active_form': 'signup'
            }
            # context.update(context)
            email = request.POST['email'].strip()
            password = request.POST['password']
            # confirm_password = request.POST['confirm_password'] 
            name = request.POST['full_name'] 
            if User.objects.filter(username=username).exists():
                messages.error(request, 'Username already exists!')
                return render(request, 'login.html', context)

            if User.objects.filter(email=email).exists():
                messages.error(request, 'Email already exists!')
                return render(request, 'login.html', context)

            try:
                # Create a new user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=name
                )
                user.save()

                # Automatically log the user in
                auth_login(request, user)
                messages.success(request, 'Registration successful! Welcome aboard!')
                return render('index')  # Replace 'home' with the name of your homepage URL

            except Exception as e:
                messages.error(request, f'An unexpected error occurred: {str(e)}')
                return render(request, 'login.html', context)

    context = {
        'active_form': 'login'
    }
    return render(request, 'login.html',context)  # Ensure this template exists and is configured

def logout(request):
    auth_logout(request)
    messages.success(request, 'Logged out successfully!')
    return render(request, 'index.html')
