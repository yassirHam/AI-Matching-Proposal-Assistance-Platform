import React, { useState } from 'react';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (e) => {
        e.preventDefault();
        if (query.trim()) {
            dispatch(setSearchedQuery(query.trim()));
            navigate("/browse");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            searchJobHandler(e);
        }
    };

    return (
        <section className="text-center py-16 px-4 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
                <span className="inline-block px-4 py-2 rounded-full bg-purple-50 text-purple-700 font-medium text-sm">
                    No. 1 Job Hunt Website in Morocco
                </span>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    Search, Apply & <br className="hidden md:block" />
                    Get Your <span className="text-[#6A38C2]">Dream Job</span>
                </h1>

                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Find the perfect job that matches your skills and career aspirations.
                    Thousands of companies are hiring right now.
                </p>

                <form onSubmit={searchJobHandler} className="w-full max-w-2xl mx-auto">
                    <div className="flex shadow-lg rounded-full overflow-hidden">
                        <input
                            type="text"
                            placeholder="Job title, keywords, or company"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 py-4 px-6 outline-none border-none text-gray-700 placeholder-gray-400 text-base"
                            aria-label="Search jobs"
                        />
                        <Button
                            type="submit"
                            className="rounded-l-none bg-[#6A38C2] hover:bg-[#5a2cad] px-8 h-full flex items-center gap-2 py-4"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5" />
                            <span className="hidden sm:inline">Search</span>
                        </Button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-2 justify-center mt-4">
                    <span className="text-sm text-gray-500">Popular Searches:</span>
                    <button 
                        onClick={() => {
                            setQuery("Developer");
                            dispatch(setSearchedQuery("Developer"));
                            navigate("/browse");
                        }}
                        className="text-sm text-purple-600 hover:underline"
                    >
                        Developer
                    </button>
                    <button 
                        onClick={() => {
                            setQuery("Designer");
                            dispatch(setSearchedQuery("Designer"));
                            navigate("/browse");
                        }}
                        className="text-sm text-purple-600 hover:underline"
                    >
                        Designer
                    </button>
                    <button 
                        onClick={() => {
                            setQuery("Marketing");
                            dispatch(setSearchedQuery("Marketing"));
                            navigate("/browse");
                        }}
                        className="text-sm text-purple-600 hover:underline"
                    >
                        Marketing
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;