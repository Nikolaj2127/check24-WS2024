import React from 'react';
import { FixedSizeList } from 'react-window';
import { ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';

interface ShowSelectedItemsProps {
    itemIds: GridRowId[];
    rows: any[]
    type: string
}

const ShowSelectedItems: React.FC<ShowSelectedItemsProps> = ({ itemIds, rows, type }) => {
    // Determine which property to show based on "type" (teams or comps)
    const getDisplayName = (row: any) => type === 'teams' ? row?.teamName : row?.competition;

    return (
        <div>
            { type === 'teams' ? (
              <Typography variant="h6" component="div" sx={{ padding: "16px" }}>
                Selected Teams:
              </Typography>
            ) : (
              <Typography variant="h6" component="div" sx={{ padding: "16px" }}>
                Selected Competitions:
              </Typography>
            )}
            <FixedSizeList
                height={500}
                width={320}
                itemSize={46}
                itemCount={itemIds.length}
                overscanCount={5}
              >
                {({ index, style }) => {
                  const id = itemIds[index];
                  const row = rows.find((r) => r.id === id);
                  const displayName = getDisplayName(row) || "Unknown";
                  return (
                    <ListItem
                      style={style}
                      key={id}
                      component="div"
                      disablePadding
                    >
                      <ListItemButton>
                        <ListItemText primary={displayName} />
                      </ListItemButton>
                    </ListItem>
                  );
                }}
              </FixedSizeList>
        </div>
    );
};

export default ShowSelectedItems;