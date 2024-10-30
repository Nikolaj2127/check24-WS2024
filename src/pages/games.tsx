import * as React from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../components/DataTable'

export default function GamesPage() {
  return <Typography>
            <DataTable filename='bc_game' />
        </Typography>;
}
