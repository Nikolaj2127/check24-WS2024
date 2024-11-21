import * as React from 'react';
import {useState, useEffect} from 'react'
import { Box } from '@mui/material';
import { DataGrid, GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';
import { fetchData, bc_game, bc_streaming_package } from './fetchData'
import '../index.css'

interface bc_game_Column {
  id: 'id' | 'team_home' | 'team_away' | 'starts_at' | 'tournament_name';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

interface bc_streaming_package_Column {
  id: 'id' | 'name' | 'monthly_price_cents' | 'monthly_price_yearly_subscription_in_cents'
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const bc_game_columns: readonly GridColDef[] = [
  { field: 'id', headerName: 'ID', minWidth: 50 },
  { field: 'team_home', headerName: 'Team Home', minWidth: 200 },
  { field: 'team_away', headerName: 'Team Away', minWidth: 200 },
  { field: 'starts_at', headerName: 'Starts At', minWidth: 170 },
  { field: 'tournament_name', headerName: 'Name', minWidth: 200 },
]

const bc_streaming_package_columns: readonly GridColDef[] = [
  { field: 'id', headerName: 'ID', minWidth: 50 },
  { field: 'name', headerName: 'Name', minWidth: 100},
  { field: 'monthly_price_cents', headerName: 'Monthly Price', minWidth: 50 },
  { field: 'monthly_price_yearly_subscription_in_cents', headerName: 'Monthly Price for Yearly Subscription', minWidth: 170 },
]

export default function DataTable<T extends bc_game | bc_streaming_package>({ filename }: { filename: string }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData(filename)
      setRows(result as T[])
      setLoading(false);
    }
    getData()
  }, [])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function isBcGame(row: bc_game | bc_streaming_package): row is bc_game {
    return (row as bc_game).id !== undefined;
  }

  function isBcStreamingPackage(row: bc_game | bc_streaming_package): row is bc_streaming_package {
    return (row as bc_streaming_package).id !== undefined
  }

  if (loading) {
    return <div></div>;
  }

  

  return (
    <div>
      <Box>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            sx={{ width: '100%', overflow: 'hidden', border: '5px solid darkblue', borderRadius: '15px' }}
            rows={rows}
            columns={bc_game_columns || bc_streaming_package_columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 10,
                    },
                },
            }}
            pageSizeOptions={[10]}
            disableColumnResize={true}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
            toolbar: {
                showQuickFilter: true,
            },
            }}
          />
          </div>
        </Box>
    </div>
  );
}