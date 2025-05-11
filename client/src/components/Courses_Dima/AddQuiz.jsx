
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const AddQuiz = ({ quizData, setQuizData }) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [error, setError] = useState("");
  const theme = useTheme();

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      setError("Question cannot be empty");
      return;
    }

    if (questionType === "multiple_choice") {
      if (newOptions.some(opt => !opt.trim())) {
        setError("All options must be filled");
        return;
      }
      if (correctAnswer === "") {
        setError("Please select a correct answer");
        return;
      }
    }

    let processedCorrectAnswer = correctAnswer;
    if (questionType === "true_false") {
      processedCorrectAnswer = correctAnswer;
    }

    const newQuizItem = {
      question: newQuestion,
      questionType,
      options: questionType === "multiple_choice" ? newOptions : [],
      correctAnswer: questionType === "multiple_choice" ? parseInt(correctAnswer) : processedCorrectAnswer
    };

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuizItem]
    }));

    setNewQuestion("");
    setNewOptions(["", "", ""]);
    setCorrectAnswer("");
    setQuestionType("multiple_choice");
    setError("");
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };

  const handleRemoveQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  return (
    <Box sx={{
      p: 3,
      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      borderRadius: 3,
      maxWidth: '800px',
      mx: 'auto',
      mt: 4
    }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        ✏️ Add Quiz Question
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        label="Question"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Question Type</InputLabel>
        <Select
          value={questionType}
          label="Question Type"
          onChange={(e) => setQuestionType(e.target.value)}
        >
          <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
          <MenuItem value="true_false">True/False</MenuItem>
          <MenuItem value="short_answer">Short Answer</MenuItem>
        </Select>
      </FormControl>

      {questionType === "multiple_choice" && (
        <>
          <Typography variant="subtitle1" fontWeight="medium" mb={1}>
            Options
          </Typography>
          {newOptions.map((option, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              sx={{ mb: 1 }}
            />
          ))}

          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Correct Answer</InputLabel>
            <Select
              value={correctAnswer}
              label="Correct Answer"
              onChange={(e) => setCorrectAnswer(e.target.value)}
            >
              {newOptions.map((option, index) => (
                <MenuItem key={index} value={index}>
                  {option || `Option ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      {questionType === "true_false" && (
        <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
          <InputLabel>Correct Answer</InputLabel>
          <Select
            value={correctAnswer}
            label="Correct Answer"
            onChange={(e) => setCorrectAnswer(e.target.value)}
          >
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
          </Select>
        </FormControl>
      )}

      {questionType === "short_answer" && (
        <TextField
          fullWidth
          label="Correct Answer"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          sx={{ mt: 2, mb: 2 }}
        />
      )}

      <Button
        variant="contained"
        startIcon={<AddCircleIcon />}
        onClick={handleAddQuestion}
        sx={{ mb: 3 }}
      >
        Add Question
      </Button>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        📝 Current Questions ({quizData.questions.length})
      </Typography>

      {quizData.questions.length > 0 ? (
        <List>
          {quizData.questions.map((question, index) => (
            <ListItem
              key={index}
              divider
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveQuestion(index)}>
                  <DeleteIcon color="error" />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${index + 1}. ${question.question}`}
                secondary={
                  <Box>
                    {question.questionType === "multiple_choice" ? (
                      question.options.map((opt, optIndex) => (
                        <Typography
                          key={optIndex}
                          sx={{
                            color: optIndex === question.correctAnswer ? "success.main" : "text.primary",
                            fontWeight: optIndex === question.correctAnswer ? "bold" : "normal"
                          }}
                        >
                          {`${optIndex + 1}. ${opt}`}
                        </Typography>
                      ))
                    ) : (
                      <Typography sx={{ color: "success.main", fontWeight: "bold" }}>
                        Correct Answer: {question.correctAnswer}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No questions added yet.
        </Typography>
      )}
    </Box>
  );
};

export default AddQuiz;
