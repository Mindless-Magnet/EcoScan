import json
import requests
import pandas as pd
import openai
from dotenv import load_dotenv
import os
from openai import OpenAI
from paddleocr import PaddleOCR
from pyNutriScore import NutriScore
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
nanonet_api_key = os.getenv("NANONET_API_KEY")



def generate_nutrient_nanonet(filename,categories,name):
    url = 'https://app.nanonets.com/api/v2/OCR/Model/2983be57-2329-4fce-af3b-b6dad68eba14/LabelFile/?async=false'
    data = {'file': open(filename+"n", 'rb')}
    response = requests.post(url, auth=requests.auth.HTTPBasicAuth(nanonet_api_key, ''), files=data)
    out=response.text
    out=json.loads(out)
    table_list=[]
    print("Number of tables:" , len(out['result'][0]['prediction']))
    if len(out['result'][0]['prediction'])==0:
        return 0

    for i in out['result'][0]['prediction']:
        table_list.append(i)

    tables=[]
    for data in table_list:
        data_dict = {}
        for item in data['cells']:
            row = item["row"]
            col = item["col"]
            cell_text = item["text"]
            if row not in data_dict:
                data_dict[row] = {}
            data_dict[row][col] = cell_text

        # Create DataFrame
        df = pd.DataFrame.from_dict(data_dict, orient="index")
        # Sort the index
        df.sort_index(inplace=True)
        tables.append(df)

    df = pd.concat(tables, ignore_index=True)
    print(df.to_string(index=False, header=False),"Nanonet")
    table_str=df.to_string(index=False, header=False)

    client = OpenAI()

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": f'''I am going to give you a nutritional table extracted from a food. {table_str} \n\n\n
                            Give me the nutritional content in below format, give zero value wherever data is not available(if saturated fat value is missing, assign it with 50% of total fat), also from table find whether food is solid/beverage, also assign a category, name of food is :  {name},list of category={categories},choose others if you cannot assign it to any category,
                            Its to process unstructured data to structured data.
                            output format= {{
                            "nutrient":{{
                                "energy": float,
                                "fibers": float,
                                "fruit_percentage": float,
                                "proteins": float,
                                "saturated_fats": float,
                                "sodium": float,
                                "sugar": float 
                                }},
                            "class": either 'solid' or 'beverage',
                            "unit": kcal/kj,
                            "category": string,
                            }}
                            '''
            }
        ]
    )
    content = completion.choices[0].message.content
    print(content)
    print("_____________________________")
    nutri_in=json.loads(content)
    print("gpt yes",nutri_in)
    return nutri_in

def generate_nutrient_paddle(filename,categories,name):
    ocr = PaddleOCR(use_angle_cls=True, lang='en') # need to run only once to download and load model into memory
    img_path = filename+"n"
    result = ocr.ocr(img_path, cls=True)
    table_str=""
    for i in result[0]:
        table_str=table_str+"\n"+i[-1][0]
    print(table_str,"Paddle-Nutrient")
    client = OpenAI()

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": f'''I am going to give you a nutritional unstructured data extracted from a food label: {table_str} \n\n\n
                            Give me the nutritional content in below format(if the values is in %, convert to gram)(if saturated fat value is missing, assign it with 50% of total fat), give zero value wherever data is not available, also from table find whhether food is solid/beverage, also assign a category, name of food is :  {name},list of category={categories},choose others if you cannot assign it to any category,
                            output format= {{
                            nutrient:{{
                                "energy": float,
                                "fibers": float,
                                "fruit_percentage": float,
                                "proteins": float,
                                "saturated_fats": float,
                                "sodium": float,
                                "sugar": float 
                                }},
                            "class": either 'solid' or 'beverage',
                            "unit": kcal/kj,
                            "category": string,
                            }}
                            '''
            }
        ]
    )
    content = completion.choices[0].message.content
    # print(content)     

    nutri_in=json.loads(content)
    return nutri_in

def generate_ingredient(filename):
    ocr = PaddleOCR(use_angle_cls=True, lang='en') # need to run only once to download and load model into memory
    img_path =filename+"i"
    print(img_path)
    result = ocr.ocr(img_path, cls=True)
    ingredients=""
    for i in result[0]:
        ingredients=ingredients+"\n"+i[-1][0]
    return ingredients

def calculate_nutriscore(nutri_in):
    if nutri_in["unit"]=="kcal":
        nutri_in["nutrient"]["energy"]*=4.184
        nutri_in["nutrient"]["sodium"]*=0.001
    


    result = NutriScore().calculate(
        nutri_in["nutrient"],
        nutri_in["class"]  
    )
    # print(result)
    nutri_score=result

    result = NutriScore().calculate_class(
        nutri_in["nutrient"],
        nutri_in["class"]  
    )
    # print(result)  
    nutri_class=result

    return nutri_in,nutri_score,nutri_class

def calculate_nova_group(ingredient_data,nutri_score,name,nutri_in):
    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": f'''I am going to give you a food ingredeints extracted from  a food label. {ingredient_data} \n
                            And here is the food name: {name} \n
                            And nutriscore of the product is: {nutri_score} \n
                            And nutrtional conten( can be table or unstructured) {nutri_in} \n
                            Give me the NOVA score of the product and ingredient summary of the product whether its good or bad to consume it in 1 paragraph.
                            Then calculate Eco-Score class of the product, and use all these information generated and given and give a summary about the product focussing on sustainability aspect. 
                            Try to make it accurate as possible
                            Output format(JSON)={{
                            "Nova":1,2,3,4
                            "nova_summary": paragraph,
                            "eco_score": A,B,C,D,E,
                            "sustainability_summary": paragraph
                            }}
                            '''
            }
        ]
    )
    content = completion.choices[0].message.content
    print(content)
    #convert to json
    content=json.loads(content)
    nova=content["Nova"]
    nova_summary=content["nova_summary"]
    eco_score=content["eco_score"]
    sustainability_summary=content["sustainability_summary"]
    return nova,nova_summary,eco_score,sustainability_summary

