# Stock Backtesting Platform
# Backend Setup

`cd backend `
`python -m venv venv `
`.\venv\Scripts\activate` 

`pip install -r requirements.txt`

`1. Get your PostgresSQl Url by making your db `
`2. Add in the db.py file `
`3. Now run the main.py file `
`4. Now run the populate_data.py by running ###python .populate_data.py  here you will get all the data from yfinance`
 5. Run this query for data cleaning on query tool 
UPDATE fundamentals
SET value = 0
WHERE value::text ILIKE 'nan'
   OR value::text ILIKE 'inf'
   OR value::text ILIKE '-inf';

`6.  backend is good to go`

# Frontend Setup
`1. cd frontend`
`2. npm i`
`3. npm run dev`