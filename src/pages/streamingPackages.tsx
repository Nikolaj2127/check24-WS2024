import * as React from 'react';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../components/DataTable'
import { PageContainer } from '@toolpad/core';
import { Button } from '@mui/material';

export default function StreamingPackagesPage() {
  const [isListView, setIsListView] = useState(true)

  return (
    <Typography>
      <div>
        {isListView ? (
          <DataTable filename='bc_streaming_package' />
        ) : (
          <div>
            Card Veiw
          </div>
        )
        }
      </div>
      <div>
        <Button 
          sx={{ backgroundColor: '#284366', border: 2, borderColor: 'white', color: 'white'}}
          type="button"
          variant="contained"
          color="primary" 
          onClick={() => setIsListView(!isListView)}>
          Change view
        </Button>
      </div>
    </Typography>
  )
}

