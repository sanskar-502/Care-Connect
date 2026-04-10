"""
============================================================
CareConnect — Databricks Model Serving Client
HTTP client that proxies risk score predictions to the
Databricks XGBoost model endpoint.
============================================================
"""

import requests
from typing import Dict

from config import settings


def get_risk_score(patient_features: Dict) -> float:
    """
    Call the Databricks Model Serving REST endpoint
    to predict 30-day readmission risk.

    Args:
        patient_features: Dictionary of model input features
            (e.g., age, systolicBP, diastolicBP, bloodSugar, etc.)

    Returns:
        Predicted risk score as a float (0-100).
        Falls back to a mock score if Databricks is unreachable.
    """
    try:
        # For Hackathon Demo: Skip actual Databricks API request
        # and instantly invoke the mock function to avoid timeouts
        return _calculate_mock_risk(patient_features)
        
        # --- Original Code (Disabled for hackathon) ---
        # payload = {
        #     "dataframe_records": [patient_features]
        # }


        # --- Make the POST request ---
        response = requests.post(
            settings.DATABRICKS_HOST,
            headers={
                "Authorization": f"Bearer {settings.DATABRICKS_TOKEN}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=10,  # 10-second timeout
        )

        response.raise_for_status()
        result = response.json()

        # --- Parse the prediction ---
        # Databricks returns predictions in a "predictions" array
        predictions = result.get("predictions", [])
        if predictions:
            # The model returns a probability (0-1), we scale to 0-100
            raw_score = predictions[0]
            risk_score = round(raw_score * 100, 1) if raw_score <= 1 else round(raw_score, 1)
            print(f"🧠 Databricks risk score: {risk_score}%")
            return risk_score

        # If no predictions returned, fall through to mock
        raise ValueError("No predictions returned from Databricks")

    except Exception as e:
        # --- Graceful fallback for hackathon demo ---
        # If Databricks is offline or rate-limited, return a mock score
        # based on simple heuristics from the input features
        print(f"⚠️  Databricks offline or error: {e}")
        print("   → Returning heuristic mock risk score.")

        return _calculate_mock_risk(patient_features)


def _calculate_mock_risk(features: Dict) -> float:
    """
    Heuristic-based mock risk score for when Databricks is unavailable.
    Uses simple clinical thresholds to generate a reasonable-looking score.
    """
    score = 30.0  # Baseline

    # Age factor
    age = features.get("age", 50)
    if age > 70:
        score += 15
    elif age > 60:
        score += 8

    # Blood pressure factor
    systolic = features.get("systolicBP", 120)
    if systolic > 160:
        score += 20
    elif systolic > 140:
        score += 12
    elif systolic < 90:
        score += 10

    # Blood sugar factor
    sugar = features.get("bloodSugar", 100)
    if sugar > 250:
        score += 15
    elif sugar > 180:
        score += 8

    # Medication adherence
    meds_taken = features.get("medicationsTaken", True)
    if not meds_taken:
        score += 12

    # Baseline risk factor
    baseline = features.get("baselineRiskScore", 0)
    if baseline > 60:
        score += 10

    # Clamp to 0-100
    return round(min(max(score, 0), 100), 1)
