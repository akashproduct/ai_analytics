from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np  # Add NumPy import
import os
import google.generativeai as genai
import re
import json

app = Flask(__name__)
CORS(app)

# Path to your CSV files
DATA_FILES = {
    "dummy_data1.csv": pd.read_csv("dummy_data1.csv"),
    "dummy_data2.csv": pd.read_csv("dummy_data2.csv")
}

# Configure Gemini API
genai.configure(api_key="AIzaSyCXOZuigFYS739y0u-5P3Z4cYYx9__lJ98")  # Replace with your actual API key

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
    data = request.json
    user_query = data.get('query', '')
    if not user_query:
        return jsonify({"result": "Please provide a query"}), 400
    
    try:
        # Step 1: Ask LLM to generate Python code to answer the query
        code_generation_prompt = f"""
I have two CSV files stored in a dictionary called data_files with the following structures:

data_files["dummy_data1.csv"]:
- Sample ID: SAMPLE-1, SAMPLE-2, etc.
- Region: Punjab, Maharashtra, Gujarat, Karnataka, Delhi
- Test Type: Turmeric, Red Chili, Black Pepper, Coriander, Cumin
- Status: Pending, Completed, Rejected
- Test Date: Dates starting from 2025-01-01
- Rejection Reason: Contamination, Incorrect Sample, None

data_files["dummy_data2.csv"]:
- Sample ID: TEST-1, TEST-2, etc.
- Region: Tamil Nadu, Kerala, Rajasthan, Uttar Pradesh, Haryana
- Test Type: Cardamom, Clove, Nutmeg, Cinnamon, Bay Leaf
- Status: Pending, Completed, Rejected
- Test Date: Dates starting from 2025-02-01
- Rejection Reason: Contamination, Incorrect Sample, None

Based on this user query: "{user_query}"

Generate Python code using pandas to extract the relevant information. The code should:
1. Use the data_files dictionary to access the CSV data
2. Process the data
3. Create a list called 'visualizations' which will contain objects for different visualization types
   - For text: {{"type": "text", "content": "your text explanation here"}}
   - For pie charts: {{"type": "pie", "title": "Distribution of...", "labels": [...], "values": [...]}}
   - For bar charts: {{"type": "bar", "title": "Comparison of...", "labels": [...], "values": [...]}}
   - For tables: {{"type": "table", "title": "Data Summary", "headers": [...], "rows": [...]}}
4. Store the final 'visualizations' list in a variable called 'result'

Choose appropriate visualizations based on the query. For example:
- Counts and distributions work well as pie charts
- Comparisons across categories work well as bar charts
- Raw data or detailed results work well as tables
- Always include at least one text component that explains the findings

IMPORTANT: DO NOT include any markdown formatting. DO NOT include `````` in your response. 
Only provide the raw Python code without any explanation or formatting.
Your output will be executed directly, so make sure to set the variable 'result' with the final output.

The code should directly use DataFrames from data_files:
df1 = data_files["dummy_data1.csv"]
df2 = data_files["dummy_data2.csv"]

NEVER use pd.read_csv() again. The DataFrames are already loaded.
"""
        
        model = genai.GenerativeModel("gemini-1.5-pro")  # Use gemini-1.5-pro instead of gemini-1.5-flash
        response = model.generate_content(code_generation_prompt)
        generated_code = response.text
        
        # Clean the generated code using our improved function
        generated_code = clean_generated_code(generated_code)
        
        print("Cleaned code to execute:\n", generated_code)
        
        # Step 2: Execute the generated code
        local_vars = {"pd": pd, "np": np, "data_files": DATA_FILES, "result": None}
        exec(generated_code, globals(), local_vars)
        
        # Extract the result from the local variables
        result = local_vars.get("result", [{"type": "text", "content": "No result was generated"}])
        print("result, ", result)
        
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)