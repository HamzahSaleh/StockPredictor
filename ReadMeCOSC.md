Backend: Fast Api setup
After cloning repo, (optional) setup anaconda environment, install dependencies with "pip install -r requirements.txt"
    - only necessary ones are:
run the backend with "uvicorn main:app --reload"

Frontend: 
After navigating out of the backend folder, intall front end dependencies with "npm install", then "npm run dev" to open the local host.

Project Structure:
/YOUR_REPO
│── backend/           # FastAPI backend
│   ├── main.py        # Backend entry point
│   ├── requirements.txt  # Backend dependencies
│── node_modules/      # Frontend dependencies (auto-generated)
│── package.json       # Frontend dependency list
│── vite.config.js     # Vite configuration
│── README.md          # Documentation
│── src/               # Source files

