from django.db import models

class Food(models.Model):
    bar_code = models.IntegerField(unique=True)
    username = models.TextField()
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    
    nutri_score = models.IntegerField()
    nutri_class = models.CharField(max_length=255)
    nutrient_data = models.JSONField()
    
    ingredient_data = models.TextField()
    nova_group = models.IntegerField()
    nova_summary = models.CharField(max_length=255)
    
    eco_score = models.CharField(max_length=255)
    sustainability_summary = models.CharField(max_length=255)
    
    palmoil = models.CharField(max_length=255)
    vegetarian = models.CharField(max_length=255)


