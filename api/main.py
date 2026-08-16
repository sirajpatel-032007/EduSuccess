from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI(title="Dropout Prediction API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentData(BaseModel):
    student_id: str
    gpa: float
    attendance_rate: float
    credits_earned: int
    socio_economic_status: str

class PredictionResponse(BaseModel):
    student_id: str
    risk_score: float
    risk_level: str
    recommended_interventions: list[str]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Dropout Prediction API is running"}

@app.post("/predict", response_model=PredictionResponse)
def predict_risk(data: StudentData):
    # Mock AI Model Logic
    # In a real scenario, this would use a loaded scikit-learn or TensorFlow model
    
    # Detect if GPA is on a 10.0 scale (CGPA) or 4.0 scale
    is_cgpa_scale = data.gpa > 4.0
    
    # Calculate a mock risk score based on inputs
    risk_score = 0.05 # Base risk
    
    if is_cgpa_scale:
        if data.gpa < 6.0:
            risk_score += 0.45
        elif data.gpa < 7.2:
            risk_score += 0.25
    else:
        if data.gpa < 2.0:
            risk_score += 0.45
        elif data.gpa < 2.7:
            risk_score += 0.25
        
    if data.attendance_rate < 0.75: # College attendance limit (often 75% is compulsory)
        risk_score += 0.40
    elif data.attendance_rate < 0.85:
        risk_score += 0.20
        
    if data.socio_economic_status.lower() == 'low':
        risk_score += 0.1
        
    # Cap risk score at 0.99
    risk_score = min(0.99, risk_score)
    
    # Determine risk level
    if risk_score > 0.7:
        risk_level = "High"
        interventions = ["Schedule counselor review session", "Academic probation mentoring", "Review for low-income grants"]
    elif risk_score > 0.4:
        risk_level = "Medium"
        interventions = ["Recommend peer tutoring", "Send attendance warnings"]
    else:
        risk_level = "Low"
        interventions = ["Continue current trajectory"]
        
    return PredictionResponse(
        student_id=data.student_id,
        risk_score=round(risk_score, 2),
        risk_level=risk_level,
        recommended_interventions=interventions
    )
