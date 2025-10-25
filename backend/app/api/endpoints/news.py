from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup

router = APIRouter()

@router.get("/news/{symbol}")
def get_stock_news(symbol: str):
    try:
        query = f"{symbol} stock news"
        url = f"https://www.google.com/search?q={query}&tbm=nws"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }

        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch news")

        soup = BeautifulSoup(response.text, "html.parser")
        articles = []

        for item in soup.select("div.dbsr")[:10]:  # limit to top 10 news
            title = item.select_one("div.JheGif.nDgy9d").get_text(strip=True)
            link = item.a["href"]
            source = item.select_one("div.CEMjEf.NUnG9d").get_text(strip=True)
            time_el = item.select_one("span.WG9SHc span")
            time_text = time_el.get_text(strip=True) if time_el else "Unknown"

            articles.append({
                "title": title,
                "link": link,
                "source": source,
                "time": time_text,
            })

        if not articles:
            raise HTTPException(status_code=404, detail=f"No news found for {symbol}")

        return {"symbol": symbol.upper(), "count": len(articles), "news": articles}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news for {symbol}: {str(e)}")
