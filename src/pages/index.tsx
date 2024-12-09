import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <Typography component="div">
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h2>
          Find the best streaming package combination for your favourite games!
        </h2>
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        marginBottom: 4,
        mx: 10
      }}>
          <Button onClick={() => navigate("/streaming_packages")} sx={{width: "100%", border: 1, height: 200, borderRadius: 15}}>
            See supported packages
          </Button>
          <Button onClick={() => navigate("/games")} sx={{width: "100%", border: 1, height: 200, borderRadius: 15}}>
            See supported games
          </Button>
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 10
      }}>
        <Button onClick={() => navigate("/calculate_best_packages")} sx={{width: "100%", border: 1, height: 200, borderRadius: 15}}>
          Calculate your optimal combination
        </Button>
      </Box>
    </Typography>
  );
}
