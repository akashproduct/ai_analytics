from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import google.generativeai as genai
import re
import json

app = Flask(__name__)
CORS(app, 
     resources={
         r"/*": {
             "origins": ["http://localhost:3000", "http://localhost:3001", "https://ai-analytics-ivory.vercel.app"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type"],
             "max_age": 120
         }
     }
)

# Path to your Excel file
try:
    DATA_FILES = {
        "food_data.xlsx": pd.read_excel("AI_Analytics_Data.xlsx")
    }
    print("Data file loaded successfully")
except Exception as e:
    print(f"Error loading data file: {str(e)}")
    DATA_FILES = {
        "food_data.xlsx": pd.DataFrame()
    }

# Configure Gemini API
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))  # Now loads from environment variable

def clean_generated_code(code):
    """
    Clean the generated code by removing markdown formatting,
    extra backticks, and any additional formatting that might
    cause execution issues.
    """
    # Remove markdown code blocks completely
    code = re.sub(r'```(?:python|py)?\n', '', code)
    code = re.sub(r'```', '', code)
    
    # Ensure the code doesn't have any leading/trailing whitespace
    code = code.strip()
    
    # Remove any commented out print statements that might be causing issues
    code = re.sub(r'^# ?print\(.*\)$', '', code, flags=re.MULTILINE)
    
    return code
@app.route('/query', methods=['POST'])
def process_query():
    print(DATA_FILES)
    data = request.json
    user_query = data.get('query', '')
    if not user_query:
        return jsonify({"result": "Please provide a query"}), 400
    
    try:
        # Step 1: Ask LLM to generate Python code to answer the query
        code_generation_prompt = f"""
I have a dataset containing information about food samples with the following columns:

General Information:
- Order ID: Unique identifier for each sample (e.g., FS-UK-DE-CUMIN_WHOLE-260851)
- Status: Report status (e.g., Report Uploaded)
- Sector: Organized, Unorganized, e-commerce
- Commodity: Type of food product (e.g., Cumin Whole, Turmeric Powder, Coriander Powder, Chilli Powder)
- State: Indian state where sample was collected
- District: District within the state
- Type: Physical form (e.g., Whole, Powder)
- Variant: Product variant (e.g., Normal, Loose, Organic)
- Lab Name: Testing laboratory name
- Overall Compliance: Compliance status (Compliant as per FSSR, Unsafe, Sub-Standard, Mis-Labelled)
- Total Key Parameters: Number of parameters tested
- Overall Safety Classification: Safe, Unsafe
- Unsafe Cases: Names of parameters that were found unsafe
- Count Safe: Number of safe parameters
- Count Unsafe: Number of unsafe parameters
- Overall Quality Classification: Standard, Sub-Standard
- Sub-Standard Cases: Names of parameters that were sub-standard
- Count Standard: Number of standard parameters
- Count Sub-Standard: Number of sub-standard parameters
- Overall Labelling Complaince: Branded, Mis-Labelled, Not Applicable
- Failed Labelling Parameters: Reasons for labelling non-compliance

Sample Information:
- Fit for analysis (Yes/No)
- Sample Weight (grams)
- Type of shop
- Name of the shop
- Address of the Shop
- Date of sample collection
- Time Stamp (Received at Lab)
- Time Stamp (Under Testing)
- Time Stamp (Report Uploaded Testing)
- TAT Testing (Completed - Received at Lab)

Labelling Information:
- Country of Origin
- Country of Origin Presence
- FSSAI Licence Number
- FSSAI License Number Presence
- Manufacturing Plant Address (if printed on packing)
- Manufacturing Address Presence
- Does the sample have Jaivik Bharat symbol?
- Jaivik Kisan Presense
- Does the sample have Veg/Non-veg symbol?
- Does the sample have FSSAI logo?
- Lot / Batch Number
- Lot / Batch Number Response
- Brand Name (if applicable)
- Brand Name Lab Response
- Expiry Date (if Applicable)
- Expiry Date Lab Response
- Date of Manufacturing
- Manufacturing Date Lab Response

Testing Parameters (each with value and compliance status):
- Added Colouring Matter
- Aflatoxin B1, µg/kg
- Arsenic as As, mg/kg
- Cadmium as Cd, mg/kg
- Copper as Cu, mg/kg
- Lead as Pb (on Dry Basis), mg/kg
- Mercury as Hg, mg/kg
- Tin as Sn, mg/kg
- Total Aflatoxins, µg/kg
- Aerobic Plate Count, CFU/g
- Bacillus Cereus, CFU/g
- Enterobacteriaceae, CFU/g
- Moisture, %
- Salmonella, Per 25g
- Staphylococcus aureus, CFU/g
- Sulfite reducing clostridia, CFU/g
- Total ash (on dry basis), %
- Acid insoluble ash (on dry basis), %
- Volatile oil content, ml/100g
- Yeast and Moulds, CFU/g
- Extraneous vegetable matter, %
- Foreign matter, %
- Insect damaged matter, %
- Broken, %
- Mouldy seeds, %
- Proportion of damaged/defective fruits, %
- Coal tar dyes
- Sand, dirt, earth, gritty matter, %
- Starch powder
- Mustiness
- Foreign odour, flavour
- Live insects, Dead Insects, Insect Fragments
- Animal excreta (mg/kg)
- Dead insects, insect fragments, rodent contamination, percent by mass
- Harmful substances
- Immature fennel (seeds)
- Uric Acid, mg/kg

Pesticide Residues (each with value and compliance status):
- Abamectin, mg/kg
- Acetamiprid, mg/kg
- Alpha naphthyl Acetic Acid, mg/kg
- Azoxystrobin, mg/kg
- Buprofezin, mg/kg
- Carbaryl, mg/kg
- Carbosulfan, mg/kg
- Chlorantraniliprole, mg/kg
- Chlorfenapyr, mg/kg
- Copper Oxychloride (Copper determined as elemental copper), mg/kg
- Cuprous Oxide (Copper determined as elemental copper), mg/kg
- Cyantranilipole, mg/kg
- Deltamethrin/Decamethrin, mg/kg
- Dicofol (Sum of p,p and o,p isomers), mg/kg
- Difenoconazole, mg/kg
- Dimethoate, mg/kg
- Dithiocarbamates, mg/kg
- Epoxyconazole, mg/kg
- Fenazaquin, mg/kg
- Fenpropathrin, mg/kg
- Fenpyroximate, mg/kg
- Fipronil, mg/kg
- Flubendiamide, mg/kg
- Flusilazole, mg/kg
- Fosetyl-Al, mg/kg
- Hexaconazole, mg/kg
- Hexythiazox, mg/kg
- Imidacloprid, mg/kg
- Indoxacarb, mg/kg
- Kresoxim methyl, mg/kg
- Lambda cyhalothrin, mg/kg
- Lufenuron, mg/kg
- Mancozeb, mg/kg
- Metalaxyl-M, mg/kg
- Methomyl, mg/kg
- Metiram as CS2, mg/kg
- Milbemectin, mg/kg
- Monocrotophos, mg/kg
- Myclobutanil, mg/kg
- Novaluron, mg/kg
- Oxadiargyl, mg/kg
- Oxydemeton methyl, mg/kg
- Pendimethalin, mg/kg
- Picoxystrobin, mg/kg
- Propargite, mg/kg
- Propineb, mg/kg
- Pyraclostrobin, mg/kg
- Pyridalyl, mg/kg
- Pyriproxyfen, mg/kg
- Quinalphos, mg/kg
- Spinetoram and its metabolites (Spinosyn-J and Spinosyn-L), mg/kg
- Spinosad, mg/kg
- Spiromesifen, mg/kg
- Spirotetramat, mg/kg
- Tebuconazole, mg/kg
- Thiacloprid, mg/kg
- Thiamethoxam, mg/kg
- Thiodicarb, mg/kg
- Triadimefon, mg/kg
- Triazophos, mg/kg
- Tricyclazole, mg/kg
- Trifloxystrobin, mg/kg
- Zineb as CS2, mg/kg

For each parameter, there is both a value column and a corresponding compliance column (e.g., "Moisture, %" and "Moisture, % Compliance").

Based on this user query: "{user_query}"

Generate Python code using pandas to extract the relevant information. The code should:
1. Use the data_files dictionary to access the data
2. Process the data
3. Create a list called 'result' which will contain objects for different visualization types
   - For text: {{"type": "text", "content": "your text explanation here"}}
   - For pie charts: {{"type": "pie", "title": "Distribution of...", "labels": [...], "values": [...]}}
   - For bar charts: {{"type": "bar", "title": "Comparison of...", "labels": [...], "values": [...]}}
   - For tables: {{"type": "table", "title": "Data Summary", "headers": [...], "rows": [...]}}

Choose appropriate visualizations based on the query. For example:
- Use pie charts for distributions (e.g., compliance status, sector-wise breakdown)
- Use bar charts for comparisons across categories (e.g., state-wise unsafe samples)
- Use tables for detailed results or when showing multiple parameters
- Always include at least one text component that explains the key findings

When creating tables:
- Limit the number of columns to the most relevant ones (max 5-6 columns)
- If showing sample details, prioritize columns like State, District, Overall Compliance, and the specific parameters mentioned in the query
- For parameter-specific queries, show the parameter value, its compliance status, and FSSR limit
- Limit tables to 50 rows maximum to avoid sending too much data

IMPORTANT: DO NOT include any markdown formatting. DO NOT include `````` in your response. 
Only provide the raw Python code without any explanation or formatting.
Your output will be executed directly, so make sure to set the variable 'result' with the final output.

The code should directly use DataFrames from data_files:
df = data_files["food_data.xlsx"]
Use pandas and numpy only in the code
NEVER use pd.read_csv() or pd.read_excel() again. The DataFrame is already loaded.

IMPORTANT: Do not define functions in your code. Write the code to directly process the data and set the 'result' variable.
"""
        
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(code_generation_prompt)
        generated_code = response.text
        
        # Clean the generated code using our improved function
        generated_code = clean_generated_code(generated_code)
        
        print("Cleaned code to execute:\n", generated_code)
        
        # Step 2: Execute the generated code
        local_vars = {"pd": pd, "np": np, "data_files": DATA_FILES, "df": DATA_FILES["food_data.xlsx"], "result": None}
        exec(generated_code, globals(), local_vars)
        
        # Extract the result from the local variables
        result = local_vars.get("result", [{"type": "text", "content": "No result was generated"}])
        print("Result type:", type(result))
        
        # Convert any pandas objects to Python native types for JSON serialization
        def convert_to_serializable(obj):
            if isinstance(obj, pd.DataFrame):
                return obj.fillna("N/A").to_dict(orient='records')
            if isinstance(obj, pd.Series):
                return obj.fillna("N/A").to_list()
            if isinstance(obj, (pd.Timestamp, pd._libs.tslibs.timestamps.Timestamp)):
                return obj.isoformat()
            if isinstance(obj, (pd.Timedelta, pd._libs.tslibs.timedeltas.Timedelta)):
                return str(obj)
            if isinstance(obj, (set, frozenset)):
                return list(obj)
            if isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
                return int(obj)
            if isinstance(obj, (np.float64, np.float32, np.float16)):
                return float(obj) if not np.isnan(obj) else "N/A"
            if isinstance(obj, (np.bool_)):
                return bool(obj)
            if isinstance(obj, (np.ndarray,)):
                return [convert_to_serializable(x) for x in obj]
            if isinstance(obj, list):
                return [convert_to_serializable(x) for x in obj]
            # Handle scalar NaN values
            if pd.api.types.is_scalar(obj) and pd.isna(obj):
                return "N/A"
            return obj
        
        # Ensure result is a list
        if result is None:
            result = [{"type": "text", "content": "No result was generated"}]
        elif not isinstance(result, list):
            result = [{"type": "text", "content": str(result)}]
        
        # Convert all elements in result to JSON serializable format
        for item in result:
            for key, value in item.items():
                item[key] = convert_to_serializable(value)
        
        return jsonify({"result": result})
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error processing query: {str(e)}\n{error_details}")
        return jsonify({"result": [{"type": "text", "content": f"Error processing query: {str(e)}"}]}), 500

@app.route('/download', methods=['GET'])
def download_file():
    try:
        return send_file('AI_Analytics_Data.xlsx',
                        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        as_attachment=True,
                        download_name='AI_Analytics_Data.xlsx')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
