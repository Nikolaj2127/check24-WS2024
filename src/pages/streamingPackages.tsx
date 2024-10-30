import * as React from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../components/DataTable'

export default function StreamingPackagesPage() {
  return <Typography>
            <DataTable filename='bc_streaming_package' />
        </Typography>;
}
