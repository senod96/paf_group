import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  InputBase,
  Button,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Grid,
} from "@mui/material";

const SearchPost = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const currentUserId = localStorage.getItem("user");

  useEffect(() => {
    fetch("http://localhost:8080/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setHasSearched(true);

    try {
      const res = await fetch(`http://localhost:8080/api/posts/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
    }
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
    <Box sx={{ mt: 4, maxWidth: "800px", mx: "auto" }}>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
        <InputBase
          value={query}
          onChange={handleInputChange}
          placeholder="Search by title"
          required
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            px: 2,
            py: 1.5,
            flexGrow: 1,
            fontSize: "1.1rem",
            border: "1px solid #ccc",
          }}
        />
        <Button variant="contained" type="submit">
          Search
        </Button>
      </form>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Paper sx={{ mt: 1, maxHeight: 200, overflowY: "auto", borderRadius: 2 }}>
          {suggestions.map((s, idx) => (
            <Box
              key={idx}
              sx={{ px: 2, py: 1, cursor: "pointer", "&:hover": { backgroundColor: "#eee" } }}
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
          <Grid container spacing={3} direction="column">
            {results.map((post) => (
              <Grid item xs={12} key={post.postId}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  {post.videoUrl ? (
                    <CardMedia
                      component="video"
                      src={post.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      sx={{ height: 400 }}
                    />
                  ) : post.imageUrls?.length > 0 ? (
                    <CardMedia
                      component="img"
                      src={post.imageUrls[0]}
                      alt="Post"
                      sx={{ height: 400, objectFit: "cover" }}
                    />
                  ) : (
                    <CardMedia
                      component="img"
                      src="https://via.placeholder.com/800x300?text=No+Media"
                      alt="No media"
                    />
                  )}

                  <CardContent>
                    <Typography variant="h6">{post.post}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {post.description}
                    </Typography>

                    <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {post.tags?.map((tag, i) => (
                        <Chip key={i} label={tag} variant="outlined" size="small" />
                      ))}
                    </Box>

                    <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                      By: {post.userId} | Date: {post.date}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default SearchPost;
