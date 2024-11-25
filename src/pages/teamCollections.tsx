import { useEffect, useState } from "react";
import { List, ListSubheader, ListItemButton, ListItemText, Collapse, ListItem } from "@mui/material";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Typography } from "@mui/material";
import { fetchBackendTeamsCollection } from "../components/dataFetching/fetchBackendTeamCollections";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { PageContainer } from "@toolpad/core";

export default function TeamCollections() {
    const navigate = useNavigate()
    const [collections, setCollections] = useState<any>([]);
    const [open, setOpen] = useState<{ [key: number]: boolean }>({});

    const handleNavigate = (teams: string[]) => {
        navigate('/calculate_best_packages/result', {state: {selectedTeams: teams}})
    }

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
            <PageContainer maxWidth={'xl'} style={{backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '15px', paddingBottom: 5}}>
                <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        Team Collections
                    </ListSubheader>
                }>
                {collections.map((collection: any, index: number) => (
                <div key={index}>
                    <ListItem>
                        <ListItemButton onClick={() => handleClick(index)} sx={{ flexGrow: 1 }}>
                            <ListItemText primary={collection.collectionName} />
                            {open[index] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Button
                            onClick={(e) => {
                            e.stopPropagation(); // Prevents the collapse from toggling
                            handleNavigate(collection.teams);
                            }}
                        >
                            View Results
                        </Button>
                    </ListItem>
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
            </PageContainer>
        </Typography>
    );
}