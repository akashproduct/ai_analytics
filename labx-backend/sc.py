import pandas as pd
import random
from datetime import datetime, timedelta

# Generate dummy data for the second CSV file
def generate_dummy_data2():
    regions = ['Tamil Nadu', 'Kerala', 'Rajasthan', 'Uttar Pradesh', 'Haryana']
    test_types = ['Cardamom', 'Clove', 'Nutmeg', 'Cinnamon', 'Bay Leaf']
    statuses = ['Pending', 'Completed', 'Rejected']
    rejection_reasons = ['Contamination', 'Incorrect Sample', 'None']

    data = []
    for i in range(200):
        sample_id = f"TEST-{i+1}"
        region = random.choice(regions)
        test_type = random.choice(test_types)
        status = random.choice(statuses)
        test_date = (datetime.now() - timedelta(days=random.randint(0, 90))).strftime('%Y-%m-%d')
        rejection_reason = random.choice(rejection_reasons) if status == 'Rejected' else 'None'

        data.append({
            'Sample ID': sample_id,
            'Region': region,
            'Test Type': test_type,
            'Status': status,
            'Test Date': test_date,
            'Rejection Reason': rejection_reason
        })

    return pd.DataFrame(data)

# Generate the data
dummy_data2 = generate_dummy_data2()
dummy_data2.to_csv('dummy_data2.csv', index=False)
