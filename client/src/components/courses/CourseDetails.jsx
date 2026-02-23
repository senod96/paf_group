import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Skeleton,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import QuizTaker from './QuizTaker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizError, setQuizError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuizError(null);

        const res = await fetch(`http://localhost:8080/api/courses/${courseId}`);
        
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Course not found" : "Failed to fetch course");
        }

        const data = await res.json();
        
        if (!data.title || !data.description) {
          throw new Error("Invalid course data");
        }

        if (data.quiz) {
          if (!data.quiz.questions || !Array.isArray(data.quiz.questions)) {
            setQuizError("Invalid quiz format - questions missing or invalid");
          } else if (data.quiz.questions.some(q => !q.question || !q.options || !Array.isArray(q.options))) {
            setQuizError("Some quiz questions are incomplete or invalid");
          }
        }

        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error("Failed to delete course");
      
      navigate('/courses', { state: { message: 'Course deleted successfully' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning">No course data available</Alert>
        <Button variant="contained" onClick={() => navigate('/courses')} sx={{ mt: 2 }}>
          Back to Courses
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/courses')}
        >
          Back to Courses
        </Button>
      </Box>

      <Card sx={{ mb: 4, boxShadow: 3 }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={300} />
        ) : (
          <CardMedia
            component="img"
            height="300"
            image={course.imageUrl || "https://via.placeholder.com/1200x300?text=Course+Image"}
            alt={course.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            {course.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Chip label={course.level} 
              color={
                course.level === 'Beginner' ? 'primary' : 
                course.level === 'Intermediate' ? 'secondary' : 'error'
              } 
            />
            {course.category && <Chip label={course.category} />}
            {course.duration && <Chip label={`Duration: ${course.duration}`} />}
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newVal) => setActiveTab(newVal)}
          variant="fullWidth"
        >
          <Tab label="Description" />
          <Tab label="Content" />
          <Tab label="Quiz" />
        </Tabs>
        <Divider />

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                About This Course
              </Typography>
              <Typography paragraph>{course.description}</Typography>

              <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
                What You'll Learn
              </Typography>
              <ul>
                {course.whatYouWillLearn?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
                Requirements
              </Typography>
              <ul>
                {course.requirements?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Course Content
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={200} />
              ) : course.videoUrl ? (
                <Box sx={{ mt: 2 }}>
                  <video 
                    src={course.videoUrl} 
                    controls 
                    style={{ width: '100%', borderRadius: 2 }}
                  />
                </Box>
              ) : (
                <Alert severity="info">No video content available for this course.</Alert>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {course.quiz?.title || "Course Quiz"}
              </Typography>
              
              {quizError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {quizError}
                </Alert>
              ) : course.quiz ? (
                <QuizTaker 
                  quizData={course.quiz} 
                  courseTitle={course.title}
                />
              ) : (
                <Alert severity="info">No quiz available for this course.</Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this course? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCourse} 
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetails;