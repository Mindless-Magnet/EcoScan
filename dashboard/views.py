from django.shortcuts import render
import os
from django.conf import settings

from dashboard.models import Food
from . import nutri
# Create your views here.
def app(request):
    foods = Food.objects.filter(username=request.user.username)  # Filter by current user's username
    
    # Check if the request method is POST
    if request.method == 'POST':
        search_name = request.POST.get('search')  # Get the search name from the form
        if search_name:
            foods = foods.filter(name__icontains=search_name)  # Filter foods by search name

    context = {
        'foods': foods,
    }
    return render(request, 'search.html', context)

# Create your views here.
def scan(request):
    if request.method == 'POST':
        # Extract form data
        barcode = request.POST.get('barcode')
        name = request.POST.get('productName')
        category = request.POST.get('category')

               # Define the path to static/images
        static_path = os.path.join(settings.STATIC_ROOT, 'images') if settings.STATIC_ROOT else os.path.join(settings.BASE_DIR, 'static', 'images')
        
        # Ensure the directory exists
        os.makedirs(static_path, exist_ok=True)

        # Handle Product Image (front of packet - f)
        if 'productImage' in request.FILES:
            product_image = request.FILES['productImage']
            with open(os.path.join(static_path, f"{barcode}f"), 'wb') as f:
                f.write(product_image.file.read())
            
        # Handle Nutrition Table Image (n)
        if 'nutritionImage' in request.FILES:
            nutrition_image = request.FILES['nutritionImage']
            with open(os.path.join(static_path, f"{barcode}n"), 'wb') as f:
                f.write(nutrition_image.file.read())
            
        # Handle Ingredients List Image (i)
        if 'ingredientsImage' in request.FILES:
            ingredients_image = request.FILES['ingredientsImage']
            with open(os.path.join(static_path, f"{barcode}i"), 'wb') as f:
                f.write(ingredients_image.file.read())      


        context = {
            'barcode': barcode,
            'product_name': name,
            'submission_success': True
        }

        try:
            nutri_in=nutri.generate_nutrient_nanonet(static_path+"/"+str(barcode),category,name)
            if nutri_in==0:
                nutri_in=nutri.generate_nutrient_paddle(static_path+"/"+str(barcode),category,name)
        except:
            nutri_in={"nutrient": {"energy": 0, "fibers": 0, "fruit_percentage": 0, "proteins": 0, "saturated_fats": 0, "sodium": 0, "sugar": 0}, "class": "solid", "unit": "kcal", "category": "Others"}        

        # nutri_in=nutri.generate_nutrient_paddle("storage/"+str(barcode),category,name)    

        ingredient_in=nutri.generate_ingredient(static_path +"/"+str(barcode))



        #make \n in ingredient_in to " "
        ingredient_in=ingredient_in.replace("\n"," ")
        context = {"nutrition_data":nutri_in,"ingredient_data":ingredient_in,
                "barcode":barcode,
                "name":name,         
                }
        
        nutri_in,nutri_score,nutri_class=nutri.calculate_nutriscore(nutri_in)

        nova_group,nova_summary,eco_score,sustainability_summary=nutri.calculate_nova_group(ingredient_in,nutri_score,name,nutri_in)

        food = Food(
            bar_code=barcode,
            name=name,
            category=category,
            nova_group=nova_group,
            nutri_score=nutri_score,
            nutri_class=nutri_class,
            nutrient_data=nutri_in,
            ingredient_data=ingredient_in,
            eco_score=eco_score,
            sustainability_summary=sustainability_summary,
            nova_summary=nova_summary,
            username=request.user.username,
        )
        food.save()
        print(context)
        food = get_object_or_404(Food, bar_code=barcode)
    
        context = {
            'food': food,
        }

        
        return render(request, 'product.html', context)
        
    return render(request, 'scan.html')

from django.shortcuts import render, get_object_or_404
def product_detail(request, barcode):
    # Get the food item or return 404 if not found
    food = get_object_or_404(Food, bar_code=barcode)
    
    context = {
        'food': food,
    }
    
    return render(request, 'product.html', context)
