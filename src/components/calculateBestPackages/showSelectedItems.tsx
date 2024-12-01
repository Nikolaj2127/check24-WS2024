import React from 'react';
import { FixedSizeList } from 'react-window';
import { ListItem, ListItemButton, ListItemText } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';

interface ShowSelectedItemsProps {
    itemIds: GridRowId[];
    rows: any[]
    type: string
}

const ShowSelectedItems: React.FC<ShowSelectedItemsProps> = ({ itemIds, rows, type }) => {
    return (
        <div>
            <FixedSizeList
                height={600}
                width={300}
                itemSize={46}
                itemCount={itemIds.length}
                overscanCount={5}
              >
                { type === 'teams' ? (
                ({ index, style }: { index: number; style: React.CSSProperties }) => {
                  const id = itemIds[index];
                  const row = rows.find((row) => row.id === id);
                  const teamName = row ? row.teamName : "Unknown";
                  return (
                    <ListItem
                      style={style}
                      key={id}
                      component="div"
                      disablePadding
                    >
                      <ListItemButton>
                        <ListItemText primary={teamName} />
                      </ListItemButton>
                    </ListItem>
                  );
                }
                ) : (
                ({ index, style }: { index: number; style: React.CSSProperties }) => {
                  const id = itemIds[index];
                  const row = rows.find((row) => row.id === id);
                  const compName = row ? row.competition : "Unknown";
                  return (
                    <ListItem
                      style={style}
                      key={id}
                      component="div"
                      disablePadding
                    >
                      <ListItemButton>
                        <ListItemText primary={compName} />
                      </ListItemButton>
                    </ListItem>
                  );
                }
                )}
              </FixedSizeList>
        </div>
    );
};

export default ShowSelectedItems;