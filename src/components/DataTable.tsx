import * as React from 'react';
import {useState, useEffect} from 'react'
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { fetchData, bc_game, bc_streaming_package } from './fetchData'

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

const bc_game_columns: readonly bc_game_Column[] = [
  { id: 'id', label: 'ID', minWidth: 50 },
  { id: 'team_home', label: 'Team Home', minWidth: 100 },
  { id: 'team_away', label: 'Team Away', minWidth: 170 },
  { id: 'starts_at', label: 'Starts At', minWidth: 170 },
  { id: 'tournament_name', label: 'Name', minWidth: 100 },
]

const bc_streaming_package_columns: readonly bc_streaming_package_Column[] = [
  { id: 'id', label: 'ID', minWidth: 50 },
  { id: 'name', label: 'Name', minWidth: 100},
  { id: 'monthly_price_cents', label: 'Monthly Price', minWidth: 50 },
  { id: 'monthly_price_yearly_subscription_in_cents', label: 'Monthly Price for Yearly Subscription', minWidth: 170 },
]

export default function DataTable({ filename }: {filename: string}) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<bc_game[] | bc_streaming_package[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData(filename)
      setRows(result as bc_game[] | bc_streaming_package[])
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
      <Paper sx={{ width: '100%', overflow: 'hidden', border: '5px solid darkblue', borderRadius: '15px' }}>
        <TableContainer sx={{ maxHeight: '100%' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
            {filename === 'bc_game' ? (
              <TableRow>
                  {bc_game_columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
              </TableRow>
            ) : filename === 'bc_streaming_package' ? (
              <TableRow>
                  {bc_streaming_package_columns.map((index) => (
                    <TableCell
                      key={index.id}
                      align={index.align}
                      style={{ minWidth: index.minWidth }}
                    >
                      {index.label}
                    </TableCell>
                  ))}
              </TableRow>
            ) : null 
            }
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                filename === 'bc_game' && isBcGame(row) ? (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.team_home}</TableCell>
                    <TableCell>{row.team_away}</TableCell>
                    <TableCell>{row.starts_at}</TableCell>
                    <TableCell>{row.tournament_name}</TableCell>
                  </TableRow>
                ) : filename === 'bc_streaming_package' && isBcStreamingPackage(row) ? (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.monthly_price_cents / 100 + " €"}</TableCell>
                    <TableCell>{row.monthly_price_yearly_subscription_in_cents / 100 + " €"}</TableCell>
                  </TableRow>
                ) : null
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      </Paper>
    </div>
  );
}