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
  const theme = useTheme();
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [error, setError] = useState("");

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
    
    // Reset form
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
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
        border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        component="div"
        color="text.primary"
      >
        Add New Question
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        label="Question"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: theme.palette.mode === 'dark' ? '#444' : '#ccc',
            },
            '&:hover fieldset': {
              borderColor: theme.palette.mode === 'dark' ? '#666' : '#aaa',
            },
          },
        }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: 'text.primary' }}>Question Type</InputLabel>
        <Select
          value={questionType}
          label="Question Type"
          onChange={(e) => setQuestionType(e.target.value)}
          sx={{
            color: 'text.primary',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'dark' ? '#444' : '#ccc',
            },
          }}
        >
          <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
          <MenuItem value="true_false">True/False</MenuItem>
          <MenuItem value="short_answer">Short Answer</MenuItem>
        </Select>
      </FormControl>

      {questionType === "multiple_choice" && (
        <>
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ mt: 2, mb: 1 }}
            color="text.primary"
          >
            Options
          </Typography>
          
          {newOptions.map((option, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? '#444' : '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? '#666' : '#aaa',
                  },
                },
              }}
            />
          ))}

          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel sx={{ color: 'text.primary' }}>Correct Answer</InputLabel>
            <Select
              value={correctAnswer}
              label="Correct Answer"
              onChange={(e) => setCorrectAnswer(e.target.value)}
              sx={{
                color: 'text.primary',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.mode === 'dark' ? '#444' : '#ccc',
                },
              }}
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
          <InputLabel sx={{ color: 'text.primary' }}>Correct Answer</InputLabel>
          <Select
            value={correctAnswer}
            label="Correct Answer"
            onChange={(e) => setCorrectAnswer(e.target.value)}
            sx={{
              color: 'text.primary',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? '#444' : '#ccc',
              },
            }}
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
          sx={{ 
            mt: 2, 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#444' : '#ccc',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'dark' ? '#666' : '#aaa',
              },
            },
          }}
        />
      )}

      <Button
        variant="contained"
        startIcon={<AddCircleIcon />}
        onClick={handleAddQuestion}
        sx={{ 
          mb: 3,
          bgcolor: theme.palette.mode === 'dark' ? '#2563eb' : '#3b82f6',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? '#1d4ed8' : '#2563eb',
          }
        }}
      >
        Add Question
      </Button>

      <Divider sx={{ 
        my: 2,
        borderColor: theme.palette.mode === 'dark' ? '#333' : '#eee'
      }} />

      <Typography 
        variant="h6" 
        gutterBottom 
        component="div"
        color="text.primary"
      >
        Current Questions ({quizData.questions.length})
      </Typography>

      {quizData.questions.length > 0 ? (
        <List>
          {quizData.questions.map((question, index) => (
            <ListItem
              key={index}
              divider
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper',
                border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #eee',
                mb: 1,
                borderRadius: 1
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveQuestion(index)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Typography color="text.primary">
                    {`${index + 1}. ${question.question}`}
                  </Typography>
                }
                secondary={
                  <Box component="div">
                    {question.questionType === "multiple_choice" && 
                      question.options.map((opt, optIndex) => (
                        <Typography
                          key={optIndex}
                          component="div"
                          sx={{
                            color: optIndex === question.correctAnswer ? 
                              'success.main' : 
                              'text.secondary',
                            fontWeight: optIndex === question.correctAnswer ? "bold" : "normal"
                          }}
                        >
                          {`${optIndex + 1}. ${opt}`}
                        </Typography>
                      ))}
                    {question.questionType !== "multiple_choice" && (
                      <Typography
                        component="div"
                        sx={{ 
                          color: 'success.main', 
                          fontWeight: "bold" 
                        }}
                      >
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
        <Typography 
          variant="body2" 
          color="text.secondary" 
          component="div"
        >
          No questions added yet
        </Typography>
      )}
    </Paper>
  );
};

export default React.memo(AddQuiz);

/*import React, { useState } from 'react';
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
  Select
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const AddQuiz = ({ quizData, setQuizData }) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [error, setError] = useState("");

 




  // In AddQuiz.js, modify the handleAddQuestion function:
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
//////////////////////////////////
  let processedCorrectAnswer = correctAnswer;
  if (questionType === "true_false") {
    // Store as string to match quiz taker's expectations
    processedCorrectAnswer = correctAnswer; // already "true" or "false"
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
  
  // Reset form
  setNewQuestion("");
  setNewOptions(["", "", ""]);
  setCorrectAnswer("");
  setQuestionType("multiple_choice");
  setError("");
};

//////////////////////////////////////////////

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
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom component="div">
        Add New Question
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
          <Typography variant="subtitle1" component="div" sx={{ mt: 2, mb: 1 }}>
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

      <Typography variant="h6" gutterBottom component="div">
        Current Questions ({quizData.questions.length})
      </Typography>

      {quizData.questions.length > 0 ? (
        <List>
          {quizData.questions.map((question, index) => (
            <ListItem
              key={index}
              divider
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${index + 1}. ${question.question}`}
                secondary={
                  <Box component="div">
                    {question.questionType === "multiple_choice" && 
                      question.options.map((opt, optIndex) => (
                        <Typography
                          key={optIndex}
                          component="div"
                          sx={{
                            color: optIndex === question.correctAnswer ? "success.main" : "text.primary",
                            fontWeight: optIndex === question.correctAnswer ? "bold" : "normal"
                          }}
                        >
                          {`${optIndex + 1}. ${opt}`}
                        </Typography>
                      ))}
                    {question.questionType !== "multiple_choice" && (
                      <Typography
                        component="div"
                        sx={{ color: "success.main", fontWeight: "bold" }}
                      >
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
        <Typography variant="body2" color="text.secondary" component="div">
          No questions added yet
        </Typography>
      )}
    </Paper>
  );
};

export default React.memo(AddQuiz);*/