import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle, Stepper, Step, StepLabel,
  TextField, MenuItem
} from '@mui/material';

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const CourseStepperModal = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    level: 'Beginner',
    requirements: '',
    whatYouLearn: ''
  });

  const steps = ['Course Details', 'Add Content', 'Add Quiz', 'Review & Submit'];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Course</DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Box mt={4} display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={2}>
            <TextField
              label="Course Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              required
            />
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
            <TextField
              label="Duration (e.g., 4 weeks)"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            />
            <TextField
              label="Level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              select
            >
              {levels.map((level) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Requirements (one per line)"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              multiline
            />
            <TextField
              label="What You'll Learn (one per line)"
              name="whatYouLearn"
              value={formData.whatYouLearn}
              onChange={handleChange}
              multiline
            />
          </Box>
        )}

        <Box mt={4} display="flex" justifyContent="space-between">
          <Button onClick={handleBack} disabled={step === 0}>Back</Button>
          <Button variant="contained" onClick={step < steps.length - 1 ? handleNext : onClose}>
            {step < steps.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CourseStepperModal;
