import * as React from 'react';
import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';

export default function MyDateRangePicker() {
    const [value, setValue] = useState<DateRange<Dayjs>>()

    useEffect(() => {
        console.log(value)
    }, [value])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateRangePicker
        value={value}
        onChange={(newValue) => setValue(newValue)}
        />
    </LocalizationProvider>
  );
}