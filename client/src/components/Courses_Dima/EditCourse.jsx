import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Divider,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const EditCourse = ({ onUpdateSuccess }) => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored?.startsWith("{")) return JSON.parse(stored);
      return { id: stored };
    } catch {
      return null;
    }
  });

  const { courseId } = useParams();
  const navigate = useNavigate();
  const currentUserId = user?.id || "";

  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    duration: "",
    imageUrl: "",
    isPublished: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch course");
        const data = await res.json();

        setCourse({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          level: data.level || "Beginner",
          duration: data.duration || "",
          imageUrl: data.imageUrl || "",
          isPublished: data.isPublished || false
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...course,
          userId: currentUserId
        }),
      });

      if (!res.ok) throw new Error("Update failed");
      
      setSuccess(true);
      if (onUpdateSuccess) onUpdateSuccess();
      setTimeout(() => navigate('/MyCourses'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 }, my: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Edit Course
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Course updated successfully! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            {/* Basic Course Info */}
            <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Course Information</Typography>
              
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={course.title}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={course.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={course.category}
                  onChange={handleChange}
                  required
                />

                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    name="level"
                    value={course.level}
                    label="Level"
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Duration (e.g., 4 weeks)"
                  name="duration"
                  value={course.duration}
                  onChange={handleChange}
                />

                
              </Box>
            </Box>
          </Box>

          {/* Sidebar */}
          <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Course Image</Typography>
              
              {course.imageUrl && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={course.imageUrl}
                    alt="Course preview"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                label="Image URL"
                name="imageUrl"
                value={course.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </Box>

            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Publish</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>Status:</Typography>
                <Chip
                  label={course.isPublished ? "Published" : "Draft"}
                  color={course.isPublished ? "success" : "default"}
                  size="small"
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                sx={{ mt: 2 }}
              >
                Update Course
              </Button>
            </Box>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default EditCourse;
