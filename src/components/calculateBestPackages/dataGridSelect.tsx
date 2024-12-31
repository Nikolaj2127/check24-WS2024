import { DataGrid, GridColDef, GridRowId, gridClasses } from "@mui/x-data-grid"
import CustomToolbar from "../dataTable/customToolbar"

interface DataGridSelectProps {
    isFiltered: boolean;
    filteredItems: any[];
    rows: any[];
    columns: GridColDef[];
    checkboxSelection: boolean
    handleSelectionChange?: (selectionModel: readonly GridRowId[]) => void;
  }

// Component to render a DataGrid with optional filtering and selection
export const DataGridSelect: React.FC<DataGridSelectProps> = ({
  isFiltered,
  filteredItems,
  rows,
  columns,
  checkboxSelection,
  handleSelectionChange
}) => {
  // Render the MUI DataGrid with either filtered or full rows
  return (
    <div>
      <DataGrid
        sx={{
          height: "669px",
          width: 320,
          border: 0,
          backgroundColor: 'var(--items)',
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          borderRadius: "15px",
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "var(--primary)",
          },
          "& .MuiDataGrid-columnSeparator": {
                color: "#FFFFFF",
            },
          "& .MuiDataGrid-cell": {
            borderColor: "var(--primary)"
          },
          "& .MuiDataGrid-footerContainer": {
            borderColor: "var(--primary)"
          },
          "& .header-right": {
            [`& .${gridClasses.columnSeparator}`]: {
              display: "none",
            },
          },
        }}
        rows={isFiltered ? filteredItems : rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        autosizeOnMount
        disableColumnResize={true}
        pageSizeOptions={[10]}
        checkboxSelection={checkboxSelection}
        keepNonExistentRowsSelected
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        slots={{ toolbar: CustomToolbar }}
        onRowSelectionModelChange={handleSelectionChange}
      />
    </div>
  );
};