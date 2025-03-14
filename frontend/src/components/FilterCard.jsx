import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'

const filterData = [
    {
        filterType: "Location",
        options: ["Casablanca", "Marrakech", "Rabat", "Tanger", "Beni Mellal"]
    },
    {
        filterType: "Job Source",
        options: ["LinkedIn", "Anapec", "je-recrute", "Other"]
    }
]

const FilterCard = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const dispatch = useDispatch();
    
    const changeHandler = (value) => {
        setSelectedValue(value);
    }

    useEffect(() => {
        dispatch(setSearchedQuery(selectedValue));
    }, [selectedValue, dispatch]);

    return (
        <div className='w-full bg-white p-3 rounded-md'>
            <h1 className='font-bold text-lg'>Filter Jobs</h1>
            <hr className='mt-3' />
            <RadioGroup value={selectedValue} onValueChange={changeHandler}>
                {filterData.map((data, index) => (
                    <div key={`filter-${index}`}>
                        <h1 className='font-bold text-lg mt-4'>{data.filterType}</h1>
                        {data.options.map((item, idx) => {
                            const itemId = `filter-${index}-${idx}`
                            return (
                                <div key={itemId} className='flex items-center space-x-2 my-2'>
                                    <RadioGroupItem value={item} id={itemId} />
                                    <Label htmlFor={itemId} className='cursor-pointer'>
                                        {item}
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </RadioGroup>
        </div>
    )
}

export default FilterCard