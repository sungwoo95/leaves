import { useRef, useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { path } from "../../config/config";
import { useNavigate } from "react-router-dom";

const StartForm = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const handleSubmit = async () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(`${path}/user/start`, { email, password });
      console.log("응답:", response.data);
      setError(null);
      navigate("/main");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "로그인 중 문제가 발생했습니다.";
      setError(errorMessage);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: 2,
        bgcolor: theme.palette.mode === "dark" ? "#001000" : "white", // ✅ 다크 모드 적용
        color: theme.palette.mode === "dark" ? "white" : "black", // ✅ 다크 모드 글자색 적용
      }}>
      <TextField fullWidth label="이메일" variant="outlined" margin="normal" inputRef={emailRef} placeholder="이메일을 입력하세요" />

      <TextField fullWidth label="비밀번호" type="password" variant="outlined" margin="normal" inputRef={passwordRef} placeholder="비밀번호를 입력하세요" />

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
        계속
      </Button>
    </Paper>
  );
};

export default StartForm;
