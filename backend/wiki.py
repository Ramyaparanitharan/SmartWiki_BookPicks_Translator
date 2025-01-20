from flask import Flask, request, jsonify
from flask_cors import CORS  
import openai
import requests
import time
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

# Initialize Flask app
app = Flask(__name__)
CORS(app) 

# Set your OpenAI API key
openai.api_key = "Your OpenAI API key"

# Define Wikipedia API URL
WIKI_API_URL = "https://en.wikipedia.org/w/api.php"

# Example: Integrating LangChain with a Vector DB (Chroma for now)
embedding_model = OpenAIEmbeddings(openai_api_key=openai.api_key)
vector_store = Chroma(persist_directory="./persist", embedding_function=embedding_model)


@app.route("/")
def index():
    return jsonify({"message": "Welcome to the Smart Wiki API. Use the /search endpoint with a POST request to search Wikipedia."})

@app.route("/favicon.ico")
def favicon():
    # Optionally serve a favicon or return an empty response
    return "", 204

@app.route("/search", methods=["POST"])
def search():
    # Get the query and language from the frontend
    data = request.get_json()
    query = data.get("query")
    language = data.get("language", "en")
    if not query:
        return jsonify({"error": "Query is required"}), 400

    # First step: Search Wikipedia API for the exact query
    wiki_response = requests.get(WIKI_API_URL, params={
        "action": "query",
        "format": "json",
        "titles": query,
        "prop": "extracts",
        "exintro": True,
        "explaintext": True,
    })

    if wiki_response.status_code != 200:
        return jsonify({"error": "Failed to fetch data from Wikipedia"}), 500

    pages = wiki_response.json().get("query", {}).get("pages", {})
    if pages:
        page = next(iter(pages.values()))
        if "missing" not in page:
            title = page.get("title", "Untitled")
            summary = page.get("extract", "No summary available.")
            url = f"https://en.wikipedia.org/?curid={page.get('pageid')}"

            # If summary is empty or unavailable, fetch first 10 sentences
            if not summary.strip() or summary == "No summary available.":
                full_text = page.get("extract", "")
                sentences = full_text.split(". ")[:10]  # Split by sentences, limit to 10
                summary = ". ".join(sentences) + "." if sentences else "No content available."

         

    # If the exact query is not found, try searching for related topics
    search_response = requests.get(WIKI_API_URL, params={
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": query,
    })

    if search_response.status_code != 200:
        return jsonify({"error": "Failed to fetch related topics from Wikipedia"}), 500

    search_results = search_response.json().get("query", {}).get("search", [])
    related_results = []
    keywords = []  # Collect related keywords
    if search_results:
        for result in search_results[:5]:  # Limit to top 5 results
            title = result.get("title", "Untitled")
            keywords.append(title)  # Add titles as potential keyword suggestions
            page_id = result.get("pageid")
            url = f"https://en.wikipedia.org/?curid={page_id}"

            # Fetch summary for each related result
            detail_response = requests.get(WIKI_API_URL, params={
                "action": "query",
                "format": "json",
                "titles": title,
                "prop": "extracts",
                "exintro": True,
                "explaintext": True,
            })
            detail_pages = detail_response.json().get("query", {}).get("pages", {})
            detail_page = next(iter(detail_pages.values()))
            summary = detail_page.get("extract", "No summary available.")

            # If summary is empty or unavailable, fetch first 10 sentences
            if not summary.strip() or summary == "No summary available.":
                full_text = detail_page.get("extract", "")
                sentences = full_text.split(". ")[:10]
                summary = ". ".join(sentences) + "." if sentences else "No content available."

            # if language != "en":
            #     summary = translate_text(summary, language)

            related_results.append({
                "title": title,
                "summary": summary,
                "url": url,
            })

    # Fetch books from Google Books API
    books_api_url = f"https://www.googleapis.com/books/v1/volumes?q={query}"

    books_response = requests.get(books_api_url)

    print("books", books_response)

    books = []
    if books_response.status_code == 429:
        retry_after = int(books_response.headers.get("Retry-After", 60))  # Default to 60 seconds if no header
        time.sleep(retry_after)

    if books_response.status_code == 200:
        books_data = books_response.json().get("items", [])
        books = [
            {
                "title": book.get("volumeInfo", {}).get("title", "No Title"),
                "authors": book.get("volumeInfo", {}).get("authors", ["Unknown"]),
                "description": book.get("volumeInfo", {}).get("description", "No Description"),
                "link": book.get("volumeInfo", {}).get("infoLink"),
                "thumbnail": book.get("volumeInfo", {}).get("imageLinks", {}).get("thumbnail"),
            }
            for book in books_data
        ]
    else:
        print("Failed to fetch books data, Status Code:", books_response.status_code)

    # Return combined response
    return jsonify({
        "results": related_results or [],
        "suggested_keywords": keywords or [],
        "books": books or [], 
    })

    # If no results were found, suggest related keywords
    opensearch_response = requests.get(WIKI_API_URL, params={
        "action": "opensearch",
        "format": "json",
        "search": query,
        "limit": 5,
    })

    suggested_keywords = []
    if opensearch_response.status_code == 200:
        opensearch_data = opensearch_response.json()
        suggested_keywords = opensearch_data[1] if len(opensearch_data) > 1 else []

    return jsonify({
        "message": "No results found. Try refining your search query or explore related topics.",
        "suggested_keywords": suggested_keywords or ["No suggestions available."],
        "suggestion": "Consider using a different keyword or checking Wikipedia directly."
    }), 404

if __name__ == "__main__":
    app.run(debug=True)
 