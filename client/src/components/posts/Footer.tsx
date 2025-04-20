import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
      {"Copyright © "}
      <Link color="text.secondary" href="https://mui.com/">
        Sitemark
      </Link>{" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <React.Fragment>
      <Divider />
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 4, sm: 8 },
          py: { xs: 8, sm: 10 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            gap: { xs: 4, sm: 4 },
            width: "100%",
          }}
        >
          {/* Newsletter */}
          <Box
            sx={{
              flex: 1,
              minWidth: "250px",
              pr: { sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
              Join the newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Subscribe for weekly updates. No spams ever!
            </Typography>
            <InputLabel htmlFor="email-newsletter">Email</InputLabel>
            <Stack direction="row" spacing={1} useFlexGap>
              <TextField
                id="email-newsletter"
                hiddenLabel
                size="small"
                variant="outlined"
                fullWidth
                placeholder="Your email address"
                sx={{ width: "250px" }}
              />
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ flexShrink: 0 }}
              >
                Subscribe
              </Button>
            </Stack>
          </Box>

          {/* Product Links */}
          <Box
            sx={{
              flex: 1,
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: "medium", color: "white" }}
            >
              Product
            </Typography>
            <Link color="text.secondary" variant="body2" href="#">
              Features
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              Testimonials
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              Highlights
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              Pricing
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              FAQs
            </Link>
          </Box>

          {/* Company Links */}
          <Box
            sx={{
              flex: 1,
              minWidth: "150px",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              Company
            </Typography>
            <Link color="text.secondary" variant="body2" href="#">
              About us
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              Careers
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              Press
            </Link>
          </Box>

          {/* Legal Links */}
          <Box
            sx={{
              flex: 1,
              minWidth: "150px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              Legal
            </Typography>
            <Link color="text.secondary" variant="body2" href="#">
              Terms
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              Privacy
            </Link>
            <Link color="text.secondary" variant="body2" href="#">
              Contact
            </Link>
          </Box>
        </Box>

        {/* Footer Bottom Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            pt: { xs: 4, sm: 8 },
            width: "100%",
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 2,
          }}
        >
          <div>
            <Link color="text.secondary" variant="body2" href="#">
              Privacy Policy
            </Link>
            <Typography sx={{ display: "inline", mx: 0.5, opacity: 0.5 }}>
              &nbsp;•&nbsp;
            </Typography>
            <Link color="text.secondary" variant="body2" href="#">
              Terms of Service
            </Link>
            <Copyright />
          </div>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ color: "text.secondary" }}
          >
            <IconButton
              color="inherit"
              size="small"
              href="https://github.com/mui"
              aria-label="GitHub"
            ></IconButton>
            <IconButton
              color="inherit"
              size="small"
              href="https://x.com/MaterialUI"
              aria-label="X"
            ></IconButton>
            <IconButton
              color="inherit"
              size="small"
              href="https://www.linkedin.com/company/mui/"
              aria-label="LinkedIn"
            ></IconButton>
          </Stack>
        </Box>
      </Container>
    </React.Fragment>
  );
}
