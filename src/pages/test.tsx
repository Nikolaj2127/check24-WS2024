import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Skeleton } from '@mui/material';


export default function Test() {
  const loading = false
  const packageName = 'Test Package'
  
  return (
    <div style={{height: 2000}}>
      
      <Card>
      <Typography className='sticky-header'>
          packageName
        </Typography>
      <CardContent>
        
        <Typography variant="h5" sx={{ marginTop: 'auto' }}>
        {loading ? (
          <Skeleton />
        ) : (
          0
        )}
        </Typography>
      </CardContent>
    </Card>
      <div style={{marginBottom: 1000}}>
        Content below the sticky header
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        more content
      </div>
    </div>
  );
}