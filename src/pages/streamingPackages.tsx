import * as React from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../components/DataTable'
import { PageContainer } from '@toolpad/core';

export default function StreamingPackagesPage() {
  return (
      <Typography component='div'>
        <DataTable filename='bc_streaming_package' />
      </Typography>
  )
}

