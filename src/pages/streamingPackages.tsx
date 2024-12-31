import * as React from 'react';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../components/dataTable/DataTable'
import { PageContainer } from '@toolpad/core';
import { Button } from '@mui/material';

export default function StreamingPackagesPage() {

  return (
     <DataTable filename='bc_streaming_package' />
  )
}

