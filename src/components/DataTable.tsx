import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridColDef, gridClasses } from '@mui/x-data-grid';
import { PageContainer } from '@toolpad/core';
import { fetchData, bc_game, bc_streaming_package } from './dataFetching/fetchData';
import CustomToolbar from './customToolbar';
import '../index.css';
import '../css/glowBorder.css'; // Import the CSS file

const bc_game_columns: readonly GridColDef[] = [
  { field: 'id', headerName: 'ID', minWidth: 50 },
  { field: 'team_home', headerName: 'Team Home', minWidth: 200 },
  { field: 'team_away', headerName: 'Team Away', minWidth: 200 },
  { field: 'starts_at', headerName: 'Starts At', minWidth: 170 },
  { field: 'tournament_name', headerName: 'Name', minWidth: 200 },
];

const bc_streaming_package_columns: readonly GridColDef[] = [
  { field: 'id', headerName: 'ID', minWidth: 50 },
  { field: 'name', headerName: 'Name', minWidth: 350 },
  { field: 'monthly_price_cents', headerName: 'Monthly Price', minWidth: 150 },
  { field: 'monthly_price_yearly_subscription_in_cents', headerName: 'Monthly Price for Yearly Subscription', flex: 1 },
];

export default function DataTable<T extends bc_game | bc_streaming_package>({ filename }: { filename: string }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<T[]>([]);

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData(filename);
      setRows(result as T[]);
      setLoading(false);
    };
    getData();
  }, [filename]);

  if (loading) {
    return <div></div>;
  }

  return (
    <div style={{
      position: 'absolute',
      height: '100vh',
      width: '100vw'
    }}>
      <div style={{
        position: 'absolute',
        height: '100%',
        width: '100vw',
        backgroundImage: `url('/images/allianz_arena.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1
      }}></div>
      <PageContainer maxWidth={'xl'} style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '15px', paddingBottom: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className="card" style={{
            border: '0px solid',
            borderRadius: '15px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}>
            <DataGrid
              sx={{ 
                borderRadius: '15px', 
                border: '0px', 
                padding: 2, 
                backgroundColor: 'transparent', 
                "& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader": {backgroundColor: "blue"},
                "& .MuiDataGrid-columnHeadersInner": {backgroundColor: "blue"},
                '& .super-app-theme--header': {backgroundColor: 'blue'},
                [`& .${gridClasses.columnSeparator}`]: {
                  [`&:not(.${gridClasses['columnSeparator--resizable']})`]: {
                    display: 'none',
                  },
                },
              }}
              rows={rows}
              columns={filename === 'bc_game' ? bc_game_columns : bc_streaming_package_columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[10]}
              disableColumnResize={true}
              slots={{ toolbar: CustomToolbar }}
            />
          </div>
        </Box>
      </PageContainer>
    </div>
  );
}