// IntroduceDivideConquer.tsx
import { Box, Typography } from '@mui/material';

interface IntroduceDivideConquerProps {
  videoSrc: string;
}

const IntroduceDivideConquer: React.FC<IntroduceDivideConquerProps> = ({
  videoSrc,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      py={4}
      px={2}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Divide and conquer the problem with your team.
      </Typography>
      <Box mt={2} width="100%" maxWidth="1300px">
        <video
          src={videoSrc}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(17, 115, 68, 0.2)',
            display: 'block',
          }}
        />
      </Box>
    </Box>
  );
};

export default IntroduceDivideConquer;
