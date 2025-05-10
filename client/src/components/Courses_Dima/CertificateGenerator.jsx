import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Styled Certificate Container with gradient background, shadow, and padding
const CertificateContainer = styled(Box)(({ theme }) => ({
  width: '800px',
  height: '600px',
  border: '15px solid #2980b9',
  padding: '60px',
  textAlign: 'center',
  position: 'relative',
  background: 'linear-gradient(to right, #f5f5f5, #e0e0e0)', // Gradient background
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)', // Enhanced shadow
  margin: '0 auto',
  borderRadius: '20px', // Rounded corners
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    height: 'auto',
    padding: '30px',
    borderWidth: '10px'
  }
}));

// Decorative Border with soft corners
const DecorativeBorder = styled(Box)({
  position: 'absolute',
  top: '20px',
  left: '20px',
  right: '20px',
  bottom: '20px',
  border: '3px solid #2980b9', // Subtle blue border
  pointerEvents: 'none',
  borderRadius: '15px' // Rounded corners for elegance
});

// Enhanced Watermark styling for subtle branding
const Watermark = styled(Box)({
  position: 'absolute',
  opacity: 0.05,
  fontSize: '150px', 
  fontWeight: 'bold',
  color: '#1a2a3a', 
  transform: 'rotate(-45deg)',
  top: '20%',
  left: '10%',
  zIndex: 0,
  pointerEvents: 'none',
  fontFamily: '"Times New Roman", serif', 
});

// Logo Styling (Positioned at the top center of the certificate)
const Logo = styled(Box)({
  position: 'absolute',
  top: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '120px',
  height: '120px',
  backgroundImage: 'url(D:/PAF_NEW/client/src/components/courses/Bg.avif)',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  zIndex: 1,
});

// Signature Box with better spacing
const Signature = styled(Box)({
  marginTop: '40px',
  textAlign: 'center',
  '& img': {
    height: '80px',
    marginBottom: '10px'
  }
});

// Certificate Generator Component
const CertificateGenerator = ({ courseName, score }) => {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState('');
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const certificateRef = useRef(null); // Create ref for certificate container

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle dialog close
  const handleClose = () => {
    if (name.trim()) {
      setOpen(false);
      setCertificateGenerated(true);
    }
  };

  // Certificate Text based on score
  const getCertificateText = () => {
    if (score >= 90) return 'with Distinction';
    if (score >= 70) return 'with Honors';
    return '';
  };

  // Handle PDF download
  const handleDownload = () => {
    const certificateElement = certificateRef.current; // Access certificate container via ref
  
    if (certificateElement) {
      html2canvas(certificateElement).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        // Create new PDF instance
        const doc = new jsPDF();
  
        const certificateWidth = canvas.width;
        const certificateHeight = canvas.height;

        const pageWidth = 180; // Set the width for PDF image
        const aspectRatio = certificateWidth / certificateHeight;
        const pageHeight = pageWidth / aspectRatio;

        doc.addImage(imgData, "PNG", 15, 15, pageWidth, pageHeight);
        doc.save(`${name}_Certificate.pdf`);
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', color: '#2980b9' }}>
          Enter Your Name for Certificate
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Your Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ marginBottom: '16px' }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={!name.trim()}
            variant="contained"
            sx={{ bgcolor: '#2980b9', '&:hover': { bgcolor: '#1c5987' } }}
          >
            Generate Certificate
          </Button>
        </DialogActions>
      </Dialog>

      {certificateGenerated && (
        <CertificateContainer ref={certificateRef}>
          <Logo /> {/* Adding the logo at the top center */}
          <DecorativeBorder />
          <Watermark>Skillaura</Watermark>
          
          <Typography variant="h4" sx={{ color: '#2980b9', mb: 2, fontWeight: 'bold', fontFamily: '"Times New Roman", serif' }}>
            Certificate of Completion
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mb: 4, fontFamily: '"Georgia", serif', color: '#555' }}>
            This is to certify that
          </Typography>
          
          <Typography variant="h3" sx={{ 
            mb: 4, 
            fontWeight: 'bold',
            textDecoration: 'underline',
            textDecorationColor: '#2980b9',
            color: '#2c3e50'
          }}>
            {name}
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mb: 4, fontFamily: '"Georgia", serif', color: '#555' }}>
            has successfully completed the course
          </Typography>
          
          <Typography variant="h5" sx={{ 
            mb: 4, 
            fontWeight: 'bold',
            color: '#2980b9',
            fontFamily: '"Times New Roman", serif'
          }}>
            "{courseName || 'Course'}"
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mb: 4, fontFamily: '"Georgia", serif', color: '#555' }}>
            with a score of {score}% {getCertificateText()}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2980b9' }}>
                Date
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: '"Georgia", serif', color: '#555' }}>
                {currentDate}
              </Typography>
            </Box>
            
            <Signature>
              <Typography variant="h6" component="div" sx={{ 
                fontFamily: 'cursive',
                height: '50px',
                marginBottom: '10px',
                color: '#2c3e50'
              }}>
                Skillaura Learning
              </Typography>
              <Divider sx={{ width: '200px', mx: 'auto', mb: 1, borderColor: '#2980b9' }} />
             
            </Signature>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2980b9' }}>
                Certificate ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: '"Georgia", serif', color: '#555' }}>
                {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </Typography>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            sx={{ mt: 4, backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1c5987' } }}
            onClick={handleDownload}
          >
            Download Certificate
          </Button>
        </CertificateContainer>
      )}
    </>
  );
};

export default CertificateGenerator;
