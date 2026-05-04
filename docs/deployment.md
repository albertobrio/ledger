# Deployment

## Local

npm install  
npm run build  
npm start  

## Environment Variables

API_KEY=secret  
DB_HOST=localhost  
DB_USER=ledger_user  
DB_PASS=...  
PRIVATE_KEY_PATH=...  

## Docker

docker build -t ledger .  
docker run -p 3000:3000 ledger  

## Production Recommendations

- use HTTPS
- use reverse proxy
- backup database
- store keys securely