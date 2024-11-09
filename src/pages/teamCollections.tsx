import { useEffect, useState } from "react";
import { List, ListSubheader, ListItemButton, ListItemText, Collapse } from "@mui/material";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Typography } from "@mui/material";
import { fetchBackendTeamsCollection } from "../components/fetchBackendTeamCollections";

export default function TeamCollections() {
    const [collections, setCollections] = useState<any>([]);
    const [open, setOpen] = useState<{ [key: number]: boolean }>({});

    const handleClick = (index: number) => {
        setOpen(prevOpen => ({ ...prevOpen, [index]: !prevOpen[index] }));
    };

    useEffect(() => {
        const fetchData = async () => {
            const collections = await fetchBackendTeamsCollection();
            setCollections(collections);
            console.log(collections);
        };

        fetchData();
    }, []);

    return (
        <Typography component="div">
            <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    Team Collections
                </ListSubheader>
            }
        >
            {collections.map((collection: any, index: number) => (
                <div key={index}>
                    <ListItemButton onClick={() => handleClick(index)}>
                        <ListItemText primary={collection.collectionName} />
                        {open[index] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open[index]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {collection.teams.map((team: string, teamIndex: number) => (
                                <ListItemButton key={teamIndex} sx={{ pl: 4 }}>
                                    <ListItemText primary={team} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>
                </div>
            ))}
        </List>
        </Typography>
    );
}