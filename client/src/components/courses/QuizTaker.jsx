import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Divider,
  TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CertificateGenerator from './CertificateGenerator';

const QuizTaker = ({ quizData, courseTitle }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  useEffect(() => {
    if (!quizStarted || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted]);

  useEffect(() => {
    if (quizData) {
      console.log('Quiz Data:', {
        title: quizData.title,
        questionCount: quizData.questions?.length || 0,
        firstQuestion: {
          text: quizData.questions?.[0]?.question,
          type: quizData.questions?.[0]?.questionType,
          correctAnswer: quizData.questions?.[0]?.correctAnswer,
          correctAnswerType: typeof quizData.questions?.[0]?.correctAnswer
        }
      });
    }
  }, [quizData]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleTextAnswerChange = (questionIndex, e) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: e.target.value }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
////////////////////////////////////////////////////

  // In QuizTaker.js, modify the handleSubmitQuiz function:
const handleSubmitQuiz = () => {
  if (!quizData?.questions?.length) return;

  let correct = 0;
  const results = {};

  quizData.questions.forEach((question, index) => {
    const userAnswer = answers[index];
    let isCorrect = false;

    switch(question.questionType) {
      case 'multiple_choice':
        isCorrect = String(userAnswer) === String(question.correctAnswer);
        break;
      case 'true_false':
        // Compare as strings
        isCorrect = String(userAnswer) === String(question.correctAnswer);
        break;
      case 'short_answer':
        isCorrect = String(userAnswer).trim().toLowerCase() === 
                   String(question.correctAnswer).trim().toLowerCase();
        break;
      default:
        isCorrect = false;
    }

    results[index] = {
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect
    };

    if (isCorrect) correct++;
  });

  const scorePercentage = Math.round((correct / quizData.questions.length) * 100);
  setSubmittedAnswers(results);
  setScore(scorePercentage);
  setQuizCompleted(true);
};
//////////////////////////////////////////////////////////////////////////
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderQuestionInput = (question) => {
    switch(question.questionType) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={answers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
          >
            {question.options.map((option, i) => (
              <FormControlLabel 
                key={i} 
                value={i.toString()} 
                control={<Radio />} 
                label={option}
                sx={{ 
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: answers[currentQuestionIndex] === i.toString() ? 'action.selected' : 'transparent',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              />
            ))}
          </RadioGroup>
        );
      case 'true_false':
        return (
          <RadioGroup
            value={answers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
          >
            <FormControlLabel value="true" control={<Radio />} label="True" />
            <FormControlLabel value="false" control={<Radio />} label="False" />
          </RadioGroup>
        );
      case 'short_answer':
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={answers[currentQuestionIndex] || ''}
            onChange={(e) => handleTextAnswerChange(currentQuestionIndex, e)}
            placeholder="Type your answer here..."
            sx={{ mt: 2 }}
          />
        );
      default:
        return null;
    }
  };

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];

  if (!quizData) {
    return <Alert severity="info" sx={{ mt: 2 }}>No quiz data available</Alert>;
  }

  if (!quizStarted) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>{quizData.title}</Typography>
        <Typography variant="body1" paragraph>
          This quiz contains {quizData.questions.length} questions.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => setQuizStarted(true)}
          sx={{ mt: 4, px: 4, py: 1.5 }}
        >
          Start Quiz
        </Button>
      </Card>
    );
  }

  if (quizCompleted) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Quiz Results
        </Typography>
        
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ 
            color: score >= 70 ? 'success.main' : score >= 50 ? 'warning.main' : 'error.main',
            fontWeight: 700
          }}>
            {score}%
          </Typography>
          <Typography variant="subtitle1">
            {score >= 70 ? 'Excellent!' : score >= 50 ? 'Good job!' : 'Keep practicing!'}
          </Typography>
        </Box>

        <CertificateGenerator 
          courseName={courseTitle || "Course"} 
          score={score} 
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Question Review:
        </Typography>
        {quizData.questions.map((question, index) => {
          const result = submittedAnswers[index];
          const isCorrect = result?.isCorrect;

          let userAnswer = result?.userAnswer || "Not answered";
          let correctAnswer = question.correctAnswer;

          // Format answers for display
          if (question.questionType === 'multiple_choice') {
            userAnswer = question.options[userAnswer] || userAnswer;
            correctAnswer = question.options[correctAnswer];
          } else if (question.questionType === 'true_false') {
            userAnswer = userAnswer === 'true' ? 'True' : 'False';
            correctAnswer = correctAnswer ? 'True' : 'False';
          }

          return (
            <Box key={index} sx={{ 
              mb: 3, p: 2, borderRadius: 1,
              border: '1px solid',
              borderColor: isCorrect ? 'success.light' : 'error.light',
              backgroundColor: isCorrect ? 'success.50' : 'error.50'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {isCorrect ? (
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <CancelIcon color="error" sx={{ mr: 1 }} />
                )}
                <Typography fontWeight="bold">
                  {index + 1}. {question.question}
                </Typography>
              </Box>
              
              <Box sx={{ ml: 4 }}>
                <Typography color={!isCorrect ? 'error.main' : 'text.primary'}>
                  Your answer: {userAnswer}
                </Typography>
                {!isCorrect && (
                  <Typography color="success.main">
                    Correct answer: {correctAnswer}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={() => {
              setQuizStarted(false);
              setQuizCompleted(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
              setTimeLeft(300);
            }}
          >
            Retake Quiz
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">
          Question {currentQuestionIndex + 1} of {quizData.questions.length}
        </Typography>
        <Typography variant="subtitle1">
          Time remaining: {formatTime(timeLeft)}
        </Typography>
      </Box>

      <LinearProgress 
        variant="determinate" 
        value={((currentQuestionIndex + 1) / quizData.questions.length) * 100} 
        sx={{ mb: 3, height: 6, borderRadius: 3 }}
      />

      <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
          {currentQuestion.question}
        </FormLabel>
        {renderQuestionInput(currentQuestion)}
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        {currentQuestionIndex < quizData.questions.length - 1 ? (
          <Button 
            variant="contained" 
            endIcon={<ArrowForwardIcon />}
            onClick={handleNextQuestion}
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmitQuiz}
          >
            Submit Quiz
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default QuizTaker;