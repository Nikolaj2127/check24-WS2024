import { useState, useEffect } from "react";
import { fetchData } from "./dataFetching/fetchData";
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
    GridColDef
  } from '@mui/x-data-grid';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import { Box } from "@mui/material";
import { PageContainer } from "@toolpad/core";
import CustomToolbar from "./customToolbar";


const bc_streaming_package_columns: readonly GridColDef[] = [
    { field: 'id', headerName: 'ID', minWidth: 50 },
    { field: 'name', headerName: 'Name', minWidth: 350 },
    { field: 'monthly_price_cents', headerName: 'Monthly Price', minWidth: 150 },
    { field: 'monthly_price_yearly_subscription_in_cents', headerName: 'Monthly Price for Yearly Subscription', flex: 1 },
  ];

function CustomPagination() {
const apiRef = useGridApiContext();
const page = useGridSelector(apiRef, gridPageSelector);
const pageCount = useGridSelector(apiRef, gridPageCountSelector);

return (
    <Pagination
    color="primary"
    variant="outlined"
    shape="rounded"
    page={page + 1}
    count={pageCount}
    // @ts-expect-error
    renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
    onChange={(event: React.ChangeEvent<unknown>, value: number) =>
        apiRef.current.setPage(value - 1)
    }
    />
);
}

const PAGE_SIZE = 5;

export default function TestDataTable() {
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: PAGE_SIZE,
        page: 0,
      });

    useEffect(() => {
        const getData = async () => {
          const result = await fetchData('bc_streaming_package');
          const formattedResult = (result as any[]).map((item: any) => {
            if (item.monthly_price_cents === 0) {
              item.monthly_price_cents = 'FREE';
            }
            if (item.monthly_price_yearly_subscription_in_cents === 0 || item.monthly_price_yearly_subscription_in_cents === null) {
              item.monthly_price_yearly_subscription_in_cents = 'FREE';
            }
            return item;
          });
          setRows(formattedResult as any);
        };
        getData();
      }, []);

      return (
        <div style={{ width: '50%' }}>
          <DataGrid
            columns={bc_streaming_package_columns}
            rows={rows}
            paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[PAGE_SIZE]}
              slots={{
                pagination: CustomPagination,
                
              }}
          />
        </div>
      );
}