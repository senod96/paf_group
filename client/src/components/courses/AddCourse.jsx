import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  IconButton
} from "@mui/material";
import {
  CloudUpload,
  Image as ImageIcon,
  VideoCameraBack,
  Delete
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import AddQuiz from "./AddQuiz";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const steps = ['Course Details', 'Add Content', 'Add Quiz', 'Review & Submit'];

const AddCourse = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored?.startsWith("{") ? JSON.parse(stored) : { id: stored };
    } catch {
      return null;
    }
  });

  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [requirements, setRequirements] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [quiz, setQuiz] = useState({ title: "", questions: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const storage = getStorage();

  const handleBack = useCallback(() => {
    setError("");
    setActiveStep(prev => prev - 1);
  }, []);

  const handleNext = useCallback(() => {
    if (activeStep === 0 && (!title.trim() || !description.trim())) {
      setError("Title and Description are required.");
      return;
    }
    if (activeStep === 1 && !imageFile) {
      setError("Course image is required.");
      return;
    }
    setError("");
    setActiveStep(prev => prev + 1);
  }, [activeStep, title, description, imageFile]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setError("");
    } else {
      setError("Please upload an image file");
    }
  }, []);

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setError("");
    } else {
      setError("Please upload a video file");
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
  }, []);

  const handleRemoveVideo = useCallback(() => {
    setVideoFile(null);
  }, []);

  const handleQuizUpdate = useCallback((quizData) => {
    setQuiz(quizData);
  }, []);

  const handleImageSubmit = async () => {
    if (!imageFile) return null;
    try {
      const imageUrl = await uploadImageToFirebase(
        imageFile,
        `courses/images/${Date.now()}_${imageFile.name}`,
        (progress) => setUploadProgress(progress)
      );
      setSuccess("Image uploaded successfully!");
      return imageUrl;
    } catch (error) {
      setError("Failed to upload image");
      return null;
    }
  };

  const handleVideoSubmit = async () => {
    if (!videoFile) return null;
    
    try {
      const videoRef = ref(storage, `courses/videos/${Date.now()}_${videoFile.name}`);
      
      const uploadTask = uploadBytesResumable(videoRef, videoFile);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setError("Video upload failed. Please try again.");
          throw error;
        }
      );
      
      await uploadTask;
      
      const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
      setSuccess("Video uploaded successfully!");
      return videoUrl;
    } catch (error) {
      console.error("Video upload failed:", error);
      setError("Failed to upload video. Please check the file and try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsSubmitting(true);

    try {
      const [imageUrl, videoUrl] = await Promise.all([
        handleImageSubmit(),
        handleVideoSubmit()
      ]);

      const newCourse = {
        title,
        description,
        instructorId: user?.id || "",
        category,
        duration,
        level,
        requirements: requirements.split("\n").filter(Boolean),
        whatYouWillLearn: whatYouWillLearn.split("\n").filter(Boolean),
        createdAt: new Date().toISOString(),
        quiz: quiz.questions.length > 0 ? quiz : null,
        imageUrl,
        videoUrl,
      };

      const res = await fetch("http://localhost:8080/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (!res.ok) throw new Error(await res.text());

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setDuration("");
      setLevel("Beginner");
      setRequirements("");
      setWhatYouWillLearn("");
      setImageFile(null);
      setVideoFile(null);
      setQuiz({ title: "", questions: [] });
      setActiveStep(0);
      setUploadProgress(0);

      setSuccess("Course created successfully!");
    } catch (err) {
      console.error("Course creation failed:", err);
      setError(err.message || "Failed to create course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = useCallback((step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (e.g., 4 weeks)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Level</InputLabel>
                <Select
                  value={level}
                  label="Level"
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements (one per line)"
                multiline
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Basic programming knowledge\nComputer with internet access"
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="What You'll Learn (one per line)"
                multiline
                rows={3}
                value={whatYouWillLearn}
                onChange={(e) => setWhatYouWillLearn(e.target.value)}
                placeholder="Build modern web applications\nUse React with TypeScript"
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon color="primary" /> Course Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload a high-quality image that represents your course (required)
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mt: 1 }}
                  >
                    Upload Image
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {imageFile && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label={imageFile.name} sx={{ maxWidth: '70%' }} />
                        <IconButton onClick={handleRemoveImage} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                      <CardMedia
                        component="img"
                        image={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        sx={{ maxHeight: 200, borderRadius: 1, mt: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideoCameraBack color="primary" /> Course Video
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload an introduction video for your course (optional)
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mt: 1 }}
                  >
                    Upload Video
                    <VisuallyHiddenInput
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                    />
                  </Button>
                  {videoFile && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label={videoFile.name} sx={{ maxWidth: '70%' }} />
                        <IconButton onClick={handleRemoveVideo} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                      <video
                        src={URL.createObjectURL(videoFile)}
                        controls
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 4, mt: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Quiz to Your Course
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a quiz to test your students' understanding (optional)
            </Typography>
            <AddQuiz
              quizData={quiz}
              setQuizData={handleQuizUpdate}
            />
          </Box>
        );
      default:
        return <Typography>Processing step</Typography>;
    }
  }, [title, description, category, duration, level, requirements,
    whatYouWillLearn, imageFile, videoFile, quiz,
    handleImageChange, handleVideoChange, handleRemoveImage, handleRemoveVideo, handleQuizUpdate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
          Create New Course
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {isSubmitting && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
            </Typography>
            <LinearProgress
              variant={uploadProgress > 0 ? "determinate" : "indeterminate"}
              value={uploadProgress}
            />
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? 'Creating...' : 'Create Course'}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default React.memo(AddCourse);