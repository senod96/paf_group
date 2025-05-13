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
  CircularProgress,
} from "@mui/material";

const SearchPost = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = localStorage.getItem("user");
  const currentUserId = currentUser?.startsWith("{") ? JSON.parse(currentUser).id : currentUser;

  useEffect(() => {
    fetch("http://localhost:8080/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setHasSearched(true);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/api/posts/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
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

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    setHasSearched(false);
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box className="font-sans px-4 pt-4 pb-0 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-3xl">
        <InputBase
          value={query}
          onChange={handleInputChange}
          placeholder="Search posts..."
          required
          className="flex-grow bg-white dark:bg-gray-700 dark:text-white rounded-full px-4 py-2 border dark:border-gray-600"
        />
        <Button
          type="submit"
          variant="contained"
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6"
          sx={{ height: "42px", textTransform: "none", fontWeight: "bold" }}
        >
          Search
        </Button>
        {hasSearched && (
          <Button
            onClick={handleClear}
            className="rounded-full bg-pink-600 hover:bg-pink-700 text-white px-6"
            sx={{ height: "42px", textTransform: "none", fontWeight: "bold" }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Paper className="w-full max-w-3xl mt-1 rounded-lg overflow-hidden dark:bg-gray-800">
          {suggestions.map((s, idx) => (
            <Box
              key={idx}
              onClick={() => {
                setQuery(s.post);
                setSuggestions([]);
              }}
              className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
            >
              {s.post}
            </Box>
          ))}
        </Paper>
      )}

      {/* Search Results */}
      <Box className="w-full max-w-4xl mt-4">
        {loading ? (
          <Box className="flex justify-center mt-8">
            <CircularProgress />
          </Box>
        ) : results.length === 0 && hasSearched ? (
          <Typography className="text-gray-600 dark:text-gray-300 text-center mt-6">
            No matching posts found.
          </Typography>
        ) : (
          <Grid container spacing={3} direction="column">
            {results.map((post) => (
              <Grid item xs={12} key={post.postId}>
                <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border dark:border-gray-700">
                  {post.videoUrl ? (
                    <CardMedia
                      component="video"
                      src={post.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full max-h-[400px] object-cover"
                    />
                  ) : post.imageUrls?.length > 0 ? (
                    <CardMedia
                      component="img"
                      src={post.imageUrls[0]}
                      alt="Post"
                      className="w-full max-h-[400px] object-cover"
                    />
                  ) : (
                    <CardMedia
                      component="img"
                      src="https://via.placeholder.com/800x300?text=No+Media"
                      alt="No media"
                      className="w-full object-cover"
                    />
                  )}

                  <CardContent className="p-4">
                    <Typography className="text-xl font-semibold text-gray-800 dark:text-white">
                      {post.post}
                    </Typography>
                    <Typography className="text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">
                      {post.description}
                    </Typography>

                    <Box className="flex flex-wrap gap-2 mt-4">
                      {post.tags?.map((tag, i) => (
                        <Chip
                          key={i}
                          label={`#${tag}`}
                          variant="outlined"
                          size="small"
                          style={{
                            color: "#3b82f6",
                            borderColor: "#3b82f6",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>

                    <Typography className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      By: {post.userId} | {formatDate(post.date)}
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
