"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSearch } from "../hooks/useApi"
import "./SearchResults.css"

const SearchResults = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("")

  const { results, loading, error, search } = useSearch()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get("q") || ""
    const type = params.get("type") || ""

    setSearchQuery(query)
    setSearchType(type)

    if (query) {
      search(query, type)
    }
  }, [location.search])

  const handleResultClick = (result) => {
    if (result.type === "project") {
      navigate(`/project/${result.id}`)
    } else if (result.type === "blog") {
      navigate(`/blog/${result.id}`)
    }
  }

  const handleNewSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const query = formData.get("query")
    const type = formData.get("type")

    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ""}`)
    }
  }

  return (
    <div className="search-results-page">
      <div className="search-hero">
        <div className="search-hero-content">
          <h1>Search Results</h1>
          {searchQuery && (
            <p>
              Results for: "{searchQuery}" {searchType && `in ${searchType}`}
            </p>
          )}
        </div>
      </div>

      <div className="search-content">
        <div className="search-form-container">
          <form onSubmit={handleNewSearch} className="search-form">
            <input
              type="text"
              name="query"
              placeholder="Search projects, blogs..."
              defaultValue={searchQuery}
              className="search-input"
            />
            <select name="type" defaultValue={searchType} className="search-type">
              <option value="">All</option>
              <option value="projects">Projects</option>
              <option value="blogs">Blogs</option>
            </select>
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        <div className="search-results">
          {loading && <div className="loading">Searching...</div>}

          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && results.length === 0 && searchQuery && (
            <div className="no-results">
              <h3>No results found</h3>
              <p>Try different keywords or search terms.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="results-count">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </div>

              <div className="results-grid">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="result-card"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="result-image">
                      <img src={result.image || "/placeholder.svg"} alt={result.title} />
                      <div className="result-type">{result.type}</div>
                    </div>
                    <div className="result-content">
                      <h3>{result.title}</h3>
                      <p>{result.excerpt || result.description}</p>
                      {result.type === "project" && (
                        <div className="result-meta">
                          <span>{result.category}</span>
                          <span>{result.location}</span>
                          <span>{result.year}</span>
                        </div>
                      )}
                      {result.type === "blog" && (
                        <div className="result-meta">
                          <span>{result.author}</span>
                          <span>{result.date}</span>
                          <span>{result.readTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResults
