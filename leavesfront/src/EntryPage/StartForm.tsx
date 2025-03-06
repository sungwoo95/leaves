import { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";

const StartForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        email,
        password,
      });

      console.log("응답:", response.data);
      setError(null); // 에러 초기화
      alert("로그인 성공!"); // 실제 앱에서는 리다이렉트 또는 토큰 저장
    } catch (err) {
      setError("로그인 실패: 이메일 또는 비밀번호를 확인하세요.");
      console.error("에러:", err);
    }
  };

  return (
    <Box sx={{ mt: 5, p: 3, border: "1px solid #ddd", borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h5" align="center" gutterBottom>
        로그인
      </Typography>

      <TextField fullWidth label="이메일" variant="outlined" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />

      <TextField fullWidth label="비밀번호" type="password" variant="outlined" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
        계속
      </Button>
    </Box>
  );
};

export default StartForm;
