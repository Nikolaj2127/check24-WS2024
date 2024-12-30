import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { DataGrid, GridColDef, gridClasses } from '@mui/x-data-grid';
import { PageContainer } from '@toolpad/core';
import { fetchData, bc_game, bc_streaming_package } from './dataFetching/fetchData';
import CustomToolbar from './customToolbar';
import { formatPrice } from './utils/formatPrice';
import '../index.css';
import '../css/glowBorder.css';

const bc_game_columns: readonly GridColDef[] = [
  { field: 'team_home', headerName: 'Team Home', minWidth: 200, headerClassName: 'header-left' },
  { field: 'team_away', headerName: 'Team Away', minWidth: 200 },
  { field: 'starts_at', headerName: 'Starts At', minWidth: 200 },
  { field: 'tournament_name', headerName: 'Name', minWidth: 200, flex: 1, headerClassName: 'header-right' },
];

const bc_streaming_package_columns: readonly GridColDef[] = [
  { field: 'name', headerName: 'Name', minWidth: 350, headerClassName: 'header-left' },
  { field: 'monthly_price_cents', headerName: 'Monthly Price', minWidth: 150 },
  { field: 'monthly_price_yearly_subscription_in_cents', headerName: 'Monthly Price for Yearly Subscription', minWidth: 350, flex: 1, headerClassName: 'header-right' },
];

export default function DataTable<T extends bc_game | bc_streaming_package>({ filename }: { filename: string }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<T[]>([]);

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData(filename);
      if (filename === "bc_streaming_package") {
        const formattedResult = (result as bc_streaming_package[]).map((item: any) => {
        // Only format if the value is a number
        if (typeof item.monthly_price_cents === 'number') {
          item.monthly_price_cents = item.monthly_price_cents === 0 
            ? 'FREE' 
            : formatPrice(item.monthly_price_cents);
        }
    
        if (typeof item.monthly_price_yearly_subscription_in_cents === 'number') {
          item.monthly_price_yearly_subscription_in_cents = 
            item.monthly_price_yearly_subscription_in_cents === 0
              ? 'FREE'
              : formatPrice(item.monthly_price_yearly_subscription_in_cents);
        }
        
        return item;
        });
        setRows(formattedResult as T[]);
      } else {
        setRows(result as T[]);
      }
      setLoading(false);
    };
    getData();
  }, [filename]);

  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={400} />;
  }

  return (
    <div>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
          <Box sx={{width: 850}}>
            <DataGrid
                sx={{
                  width: 850,
                  borderRadius: '15px',
                  border: '0px',
                  padding: 2,
                  '& .header-left': {
                    borderTopLeftRadius: '15px',
                  },
                  '& .header-right': {
                    borderTopRightRadius: '15px',
                    [`& .${gridClasses.columnSeparator}`]: {
                      display: 'none',
                    },
                  },
                  '& .MuiDataGrid-main': {
                    borderRadius: "15px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  },
                  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
                    backgroundColor: "var(--primary)",
                  },
            
                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: "var(--primary)",
                  },
                  "& .MuiDataGrid-columnSeparator": {
                        color: "#FFFFFF",
                    },
                  "& .MuiDataGrid-cell": {
                    borderColor: "var(--primary)",
                    backgroundColor: "var(--items)",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderColor: "transparent"
                  },
                }}
                autosizeOnMount
                rows={rows}
                columns={filename === 'bc_game' ? bc_game_columns : bc_streaming_package_columns}
                getRowId={filename === "bc_game" ? (row) => row.game_id : (row) => row.id}
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
          </Box>
      </Box>
    </div>
  );
}