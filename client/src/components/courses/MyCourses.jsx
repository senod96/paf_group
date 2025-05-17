import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  Skeleton,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const navigate = useNavigate();

  const itemsPerPage = 6;

  useEffect(() => {
    // ✅ Enable Tailwind Dark Mode
    if (
      localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let url = `http://localhost:8080/api/courses`;

        if (searchQuery) {
          url += `/search?q=${encodeURIComponent(searchQuery)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch courses");

        const data = await res.json();
        setCourses(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleMenuOpen = (event, courseId) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourseId(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourseId(null);
  };

  const handleEditCourse = () => {
    if (selectedCourseId) {
      navigate(`/EditCourse/${selectedCourseId}`);
    }
    handleMenuClose();
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourseId) return;

    try {
      const res = await fetch(`http://localhost:8080/api/courses/${selectedCourseId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete course");

      setCourses(courses.filter((course) => course.id !== selectedCourseId));
    } catch (err) {
      setError(err.message);
    } finally {
      handleMenuClose();
    }
  };

  const handleStartCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const paginatedCourses = courses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (error) {
    return (
      <Box className="p-6 text-center dark:bg-gray-900 min-h-screen">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-400">
          Our Published Courses
        </Typography>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search courses..."
        value={searchQuery}
        onChange={handleSearch}
        sx={{
          mb: 4,
          maxWidth: 500,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#1e293b" : "#fff",
          borderRadius: 1,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Grid container spacing={4}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className="bg-white dark:bg-gray-800" sx={{ height: 500 }}>
                <Skeleton variant="rectangular" width="100%" height={180} />
                <CardContent>
                  <Skeleton width="80%" height={32} />
                  <Skeleton width="60%" height={24} sx={{ mt: 1 }} />
                  <Skeleton width="100%" height={72} sx={{ mt: 2 }} />
                  <Skeleton width="100%" height={36} sx={{ mt: 4 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : courses.length === 0 ? (
        <Box className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow text-center">
          <Typography variant="h5" className="mb-3">
            {searchQuery
              ? "No courses match your search"
              : "No courses available yet"}
          </Typography>
          {!searchQuery && (
            <Button variant="contained" onClick={() => navigate("/add-course")}>
              Create Your First Course
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {paginatedCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  sx={{
                    height: 500,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: "none",
                    border: "1px solid",
                    borderColor: "divider",
                    transition:
                      "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      height: 180,
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    onClick={() => handleStartCourse(course.id)}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                      image={
                        course.imageUrl ||
                        "https://via.placeholder.com/300x180?text=Course+Image"
                      }
                      alt={course.title}
                    />
                    <Box
                      sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
                    >
                      <Chip
                        label={course.level}
                        size="small"
                        color={
                          course.level === "Beginner"
                            ? "primary"
                            : course.level === "Intermediate"
                            ? "secondary"
                            : "error"
                        }
                      />
                    </Box>
                  </Box>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "1.15rem",
                          lineHeight: 1.3,
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                        onClick={() => handleStartCourse(course.id)}
                      >
                        {course.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, course.id)}
                        sx={{ ml: 1 }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontSize: "0.85rem",
                        mb: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {course.category && (
                        <Chip
                          label={course.category}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      )}
                      {course.duration && `Duration: ${course.duration}`}
                    </Typography>

                    <Box sx={{ overflowY: "auto", flexGrow: 1, mb: 2 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: "0.95rem",
                          color: "text.primary",
                          lineHeight: 1.6,
                        }}
                      >
                        {course.description}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={() => handleStartCourse(course.id)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          py: 1,
                        }}
                      >
                        View Course
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditCourse}>Edit Course</MenuItem>
        <MenuItem onClick={handleDeleteCourse} sx={{ color: "error.main" }}>
          Delete Course
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CourseList;
