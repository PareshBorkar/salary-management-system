import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../../api/responses";
import { setSessionToken } from "../../api/session";
import { login } from "./login.api";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      setSessionToken(result.token);
      navigate("/");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: { xs: 2, sm: 3 },
        py: 5
      }}
    >
      <Stack spacing={4} alignItems="center" sx={{ width: "100%", maxWidth: 640 }}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid",
            borderColor: "rgba(148, 163, 184, 0.24)",
            borderRadius: 3,
            px: { xs: 3, sm: 5 },
            py: { xs: 4, sm: 5 },
            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.10)",
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(18px)"
          }}
        >
          <Stack spacing={3.5}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  background:
                    "linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(15, 118, 110, 0.08))"
                }}
              >
                <ApartmentOutlinedIcon sx={{ fontSize: 42 }} />
              </Box>

              <Stack spacing={0.75}>
                <Typography variant="h1" sx={{ color: "#101828" }}>
                  Welcome back
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  Sign in to continue to your account
                </Typography>
              </Stack>
            </Stack>

            <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

              <Stack spacing={1}>
                <Typography fontWeight={700} color="text.primary">
                  Email address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>

              <Stack spacing={1}>
                <Typography fontWeight={700} color="text.primary">
                  Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" aria-label="Show password" size="small">
                          <VisibilityOffOutlinedIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Remember me"
                  sx={{ color: "text.secondary" }}
                />
                <Link href="#" underline="none" fontWeight={700}>
                  Forgot password?
                </Link>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ py: 1.55 }}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
          <LockOutlinedIcon fontSize="small" />
          <Typography>Secure login protected by enterprise security</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
