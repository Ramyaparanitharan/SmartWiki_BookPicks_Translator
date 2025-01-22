import React, { useState } from "react"; 
import axios from "axios";
import { Button, InputGroup, FormControl, Card, ListGroup } from "react-bootstrap";
import logo from "../src/assets/images/smartwiki.png";
import search from "../src/assets/images/search.svg";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [books, setBooks] = useState([]);

  const [translateLang, setTranslateLang ] = useState("");
  const [translatedText, setTranslateText] = useState("");
  const otherLang = ["arabic", "assamese", "bengali", "chinese",
    "danish","dutch","german","greek","gujarati","hindi",
    "indonesian","irish","italian",
    "kannada","korean","latin","malayalam",
    "marathi","manipuri","nepali","persian","polish","punjabi",
    "ukranian",
    "japanese","spanish","tamil","teligu","thai","urdu","vietnamese"]
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;
    if(query.split(" ").length <= 1)
    {
      setMessage("Please enter a more meaningful sentence for search");
      return;
    }
    setLoading(true);
    setSearchedQuery(query);
    setResults([]);
    setSuggestedKeywords([]);
    setMessage("");
    setBooks([]);
    try {
      const response = await axios.post("http://localhost:5000/search", { query, language });
      if (response.status === 200) {
        setResults(response.data.results || []);
        setBooks(response.data.books || []);
        if (response.data.suggested_keywords) {
          setSuggestedKeywords(response.data.suggested_keywords || []);
        }
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || "An error occurred.");
        if (error.response.data.suggested_keywords) {
          setSuggestedKeywords(error.response.data.suggested_keywords);
        }
      } else {
        setMessage("Searched message is not valid");
      }
    } finally {
      setLoading(false);
    }
    setQuery("");
  };

  const selectHandler = (language) => {
    setSelectedLanguage(language);
  };

  const translateHandler = () => {
    if (!translateLang.trim()) {
      console.log("Please enter text to translate");
      return;
    }
    
   const slicedChar = selectedLanguage.slice(0,2);
   console.log("SLICED CHARACTER",slicedChar)
    try {
      const url = `https://lingva.ml/api/v1/en/${slicedChar}/${translateLang}`;
  
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.translation) {
           setTranslateText(data.translation)
          } else {
            console.log("Translation not found.");
          }
        })
        .catch(error => console.error("Error:", error));
  
    } catch (e) {
      console.error("Error in translation request:", e);
    }
  };
  
  return (
    <div className="App">
      <div className="d-flex align-center justify-space-around"> 
        <img src={logo} alt="logo" height={100} />
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search..."
            aria-label="Search"
            aria-describedby="basic-addon2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-search"
          />
          <img src={search} alt="search" onClick={handleSearch} className="ms-2 cursor-pointer" />
        </InputGroup>
      </div>

      <div className="mx-5 my-0 p-2">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {message && <h4>{message}</h4>}
            {searchedQuery && 
            <div>
              <h2 className="d-flex fs14">Searched Word : 
                <p className="style-search-word">{searchedQuery.toUpperCase()}</p>              
              </h2>
            </div>
            }
            {suggestedKeywords.length > 0 ? (
              <div>
                <h5>Suggested Keywords :</h5>
                <ListGroup>
                  {Array.isArray(suggestedKeywords) && suggestedKeywords.map((keyword, index) => (
                    <ListGroup.Item key={index} className="border-none">
                      <Button variant="link" onClick={() => setQuery(keyword)}>
                        {keyword}
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            ) : 
            query && <p>No Suggestion Available</p>            
            }
            <ListGroup>
              {Array.isArray(results) && results.map((result, index) => (
                <ListGroup.Item key={index}>
                  <Card className="border-none">
                    <Card.Body>
                      <Card.Title>{result.title}</Card.Title>
                      <Card.Text>{result.summary}</Card.Text>
                      <Button href={result.url} target="_blank">
                        Read More
                      </Button>
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
              ))}
              {results == null &&  "Please Enter A Valid Query"}
            </ListGroup>
            {books.length > 0 ? (
        <div>
          <h5>Recommended Books:</h5>
          <div className="book-list">
            <div className="row">
              {Array.isArray(books) && books.map((book, index) => (
                <div className="col-md-3">
                  <Card key={index} className="mb-3">
                    <Card.Img
                        variant="top"
                        src={book.thumbnail || "https://via.placeholder.com/128x193"}
                        alt={book.title}
                        className="h200 w200"
                    />
                    <Card.Body>
                        <Card.Title>
                          <p className="description book-description">
                            {book.title}
                          </p>
                        </Card.Title>
                        <Card.Text>
                            <strong>Authors:</strong> {book.authors.join(", ")} <br />
                            <strong>Description:</strong> 
                            <p className={book.description == "No Description" ? "description truncated-description h200" : "description truncated-description"}>
                              {book.description}
                            </p>
                        </Card.Text>
                        <Button href={book.link} target="_blank" variant="primary">
                            Learn More
                        </Button>
                    </Card.Body>
                </Card>
              </div>
            ))}
            {Array.isArray(books) && books.length === 0 && <p>Please enter a valid search</p>}
            </div>
        </div>
    </div>
) : <p className="my-3">No Books Available</p>}

          </>
        )}
        {results ?
        <div>
        <textarea onChange={(e)=>setTranslateLang(e.target.value)} value={translateLang} width="100%"
        cols={100}
        rows={10}
        maxLength={1000}
        placeholder="Select or Enter your text in English"/>
       <p>{1000 - translateLang.length} characters remaining</p>
        <select onChange={(e)=>selectHandler(e.target.value)} placeholder="Selet a language" value={selectedLanguage}>
        <option value="">Select a language</option>
        {otherLang.map(key => 
          <option>{key}</option>)}
        </select>
          <button type="submit" onClick={translateHandler} className="mx-2">Translate</button>

          <div>{translatedText}</div>
          </div> : ""
        }
      </div>
    </div>
  );
}

export default App;