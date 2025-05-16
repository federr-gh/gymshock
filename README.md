# GymShock

## Development Setup

1. Clone the repository
```bash
git clone https://github.com/andersondev17/gymshock.git
cd gymshock

```
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
npm install passport-jwt-cookiecombo

# Api Fast
cd ../frontend/services/api-fast
python -m venv env
env\Scripts\activate
pip install fastapi uvicorn pandas scikit-learn
uvicorn api:app