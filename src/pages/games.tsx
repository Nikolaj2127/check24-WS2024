import * as React from 'react';
import Typography from '@mui/material/Typography';
import DataTable from '../components/DataTable'


export default function GamesPage() {
  return (
    <div style={{flex: 1}}>
            <iframe style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: `url('/images/gamesBackground.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                zIndex: -1,
                border: 0
            }}/>
      <DataTable filename='bc_game' />
    </div>
    
    )
}
