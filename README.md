## Smart Wiki
A web application that integrates Wikipedia search, language translation, and curated book recommendations into one platform. Built using React for the frontend and Flask for the backend.

## Features
- Search for Wikipedia articles using a keyword or sentence.
- Translate text into multiple languages.
- Get book recommendations based on search queries.
- Suggested keywords for better search results.

## Tech Stack
- Frontend
    React: For building the user interface.
    React Bootstrap: For styling components.
    Axios: For API requests.
- Backend
    Flask: For handling API endpoints.
    Wikipedia API: To fetch content from Wikipedia.
    Google Books API: For fetching book recommendations.
    LangChain & Chroma: For semantic search and language processing.

## Ensure you have the following installed:

Node.js
Python (3.8 or later)
pip

Installation

1. Clone the Repository
2. Setup Backend
3. Navigate to the backend folder - install dependencied refer requirements.txt
4. Add your OpenAI API key in the code or create a .env file in the backend directory
5. Start the Flask server - python app.py

## Setup Frontend
1. Navigate to the frontend folder
2. Install dependencies and Start the React development server npm install , npm start

## Usage
Open your browser and navigate to:

Frontend: http://localhost:3000
Backend API: http://localhost:5000
Enter a search term in the search bar.

## Explore results including:

- Wikipedia articles and summaries.
- Suggested keywords.
- Curated book recommendations.
- Translate text into a supported language using the dropdown and text input.

## APIs Used

- Wikipedia API: Fetch summaries and details about articles.
- Google Books API: Provide book recommendations based on search terms.
- Lingva Translate API: Translate text into various languages.

## Contributing

Feel free to submit pull requests or raise issues to improve the project.

## License

This project is licensed under the MIT License.