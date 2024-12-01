import * as React from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../components/DataTable'
import { PageContainer } from '@toolpad/core';

export default function StreamingPackagesPage() {
  return (
    <div style={{flex: 1}}>
      <iframe style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `url('/images/footballPlayers.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: -1,
          border: 0
      }}/>
      <DataTable filename='bc_streaming_package' />
    </div>
    
  )
}

