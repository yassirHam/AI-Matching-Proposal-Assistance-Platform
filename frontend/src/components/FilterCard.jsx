import React from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '@/redux/jobSlice';

const filterOptions = [
  {
    category: 'city',
    label: 'city',
    values: ['Casablanca', 'Marrakech', 'Rabat', 'Tanger', 'Beni Mellal']
  },
  {
    category: 'source',
    label: 'Job Source',
    values: ['LinkedIn', 'Anapec', 'JeRecrute', 'Other']
  }
];

const FilterCard = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.job);

  const handleFilterChange = (category, value) => {
    dispatch(setFilters({ [category]: value }));
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Filter Jobs</h2>

      {filterOptions.map((filter) => (
        <div key={filter.category} className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">{filter.label}</h3>
          <RadioGroup
            value={filters[filter.category]}
            onValueChange={(value) => handleFilterChange(filter.category, value)}
          >
            {filter.values.map((value) => (
              <div key={value} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={value} id={`${filter.category}-${value}`} />
                <Label htmlFor={`${filter.category}-${value}`} className="text-sm">
                  {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
    </div>
  );
};

export default FilterCard;