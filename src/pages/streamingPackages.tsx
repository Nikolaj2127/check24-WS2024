import * as React from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../components/DataTable'
import { PageContainer } from '@toolpad/core';

export default function StreamingPackagesPage() {
  return (
      <Typography component='div'>
        <div style={{
        position: 'absolute',
        height: '100vh',
        width: '100vw'
        }}>
        <div style={{
          position: 'absolute',
          height: '100%',
          width: '100vw',
          backgroundImage: `url('/images/footballPlayers.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1
        }}/>
          <DataTable filename='bc_streaming_package' />
        </div>
      </Typography>
  )
}

