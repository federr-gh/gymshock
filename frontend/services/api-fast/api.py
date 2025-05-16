from fastapi import FastAPI, HTTPException
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import pickle
from typing import Dict, List
from urllib.parse import unquote

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:3000", "http://127.0.0.1:3000"],  # Lista de orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],  # Métodos permitidos
    allow_headers=["*"],  # Cabeceras permitidas
)

# Carga la matriz de recomendaciones del disco
try:
    exercises = pickle.load(open('exercises.pkl', 'rb'))  # Asegúrate que el nombre del archivo es correcto
    similarity = pickle.load(open('similarity.pkl', 'rb'))
except Exception as e:
    raise RuntimeError(f"Error loading data files: {e}")
    
@app.get("/api/recommendations/{exercise_name}", response_model=Dict[str, List[str]]) 
async def recommend(exercise_name: str) -> Dict[str, List[str]]:
    try:
        index = exercises[exercises['name']==exercise_name].index[0]
        distance = sorted(list(enumerate(similarity[index])), reverse=True, key=lambda x: x[1])[1:6]
        exercises_list = [exercises.iloc[x[0]]['name'] for x in distance]
        return {"recommendations": exercises_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))