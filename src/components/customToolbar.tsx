import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

export default function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  };