import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  InputBase,
  Button,
  Fade,
  Paper,
} from "@mui/material";

const SearchPost = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [triggerBounce, setTriggerBounce] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8080/api/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    setTriggerBounce(true);

    axios.get(`http://localhost:8080/api/posts/search?q=${query}`)
      .then((res) => setResults(res.data))
      .catch((err) => console.error("Error searching posts:", err));

    setTimeout(() => setTriggerBounce(false), 300);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    const filtered = posts.filter((p) =>
      p.post.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(value ? filtered.slice(0, 5) : []);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Search Posts
      </Typography>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <InputBase
          value={query}
          onChange={handleInputChange}
          placeholder="Search by keyword"
          required
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            px: 2,
            py: 1.5,
            flexGrow: 1,
            fontSize: "1.1rem",
            border: "1px solid #ccc",
            width: "100%",
          }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            height: "48px",
            fontSize: "1rem",
            animation: triggerBounce ? "bounce 0.3s ease" : "none",
            "@keyframes bounce": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.1)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        >
          Search
        </Button>
      </form>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            mt: 1,
            maxHeight: 200,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: 2,
          }}
        >
          {suggestions.map((s, idx) => (
            <Box
              key={idx}
              sx={{
                px: 2,
                py: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
              onClick={() => {
                setQuery(s.post);
                setSuggestions([]);
              }}
            >
              {s.post}
            </Box>
          ))}
        </Paper>
      )}

      {/* Results */}
      <Box sx={{ mt: 4 }}>
        {results.length === 0 && hasSearched ? (
          <Typography variant="body1" color="text.secondary">
            No matching posts found.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr",
                md: "1fr 1fr",
              },
            }}
          >
            {results.map((post) => (
              <Fade in={true} timeout={400} key={post.postId}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    maxWidth: "100%",
                  }}
                >
                  <Typography variant="h6">{post.post}</Typography>
                  <Typography variant="body2">{post.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {post.userId} | Likes: {post.likes} | {post.date}
                  </Typography>

                  {post.imageBase64List?.length > 0 && (
                    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {post.imageBase64List.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`preview-${idx}`}
                          style={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {post.videoBase64 && (
                    <video
                      src={post.videoBase64}
                      controls
                      style={{ marginTop: "10px", width: "100%", borderRadius: "4px" }}
                    />
                  )}
                </Box>
              </Fade>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchPost;
