import * as React from 'react';
import DataTable from '../components/DataTable'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { calcPackages } from '../components/calcPackages';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Homepage () {
  const [value, setValue] = React.useState(0)
  const packages = calcPackages()

  React.useEffect(() => {
    const fetchPackages = async () => {
      const result = await calcPackages()
    }
  }, [])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

    return (
        <div >
          <h2>Check24 Coding Challenge</h2>
          <div style={{ paddingLeft: '20%', paddingRight: '20%', paddingTop: '2%' }}>
            <Box sx={{ width: '100%' }}>
              <Box>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>
                  <Tab label="Games" {...a11yProps(0)} />
                  <Tab label="Streaming Packages" {...a11yProps(1)} />
                  <Tab label="Item Three" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                <DataTable filename='bc_game'/>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <DataTable filename='bc_streaming_package'/>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                Item Three
              </CustomTabPanel>
            </Box>
          </div>
        </div>
      )
}
