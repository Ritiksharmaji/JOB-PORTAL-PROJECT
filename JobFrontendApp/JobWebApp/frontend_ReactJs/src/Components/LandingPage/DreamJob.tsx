import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateFilter } from "../../Slices/FilterSlice";
import { useNavigate } from "react-router-dom";

const DreamJob = () => {
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const [jobTitle, setJobTitle]=useState("");
    const [type, setType]=useState("");
    const handleClick=()=>{
        dispatch(updateFilter({"Job Title":jobTitle?[jobTitle]:null, "Job Type":type?[type]:null, "page":1}))
        navigate("/find-jobs")
    }
    return (
        <div className="flex sm-mx:flex-col-reverse  items-center px-16 bs-mx:px-10 md-mx:px-5">
            <div data-aos="zoom-out-right" className="flex flex-col w-[45%] sm-mx:w-full gap-3">
                <div className="text-6xl bs-mx:text-5xl md-mx:text-4xl sm-mx:text-3xl font-bold leading-tight text-mine-shaft-100 [&>span]:text-bright-sun-400">Find your <span >dream</span> <span>job</span> with us</div>
                <div className="text-lg md-mx:text-base sm-mx:text-sm text-mine-shaft-200">Search open roles, build your profile and apply — all in one place.</div>
                <div className="flex gap-3 mt-5 items-center">
                    <TextInput value={jobTitle} onChange={(e)=>setJobTitle(e.currentTarget.value)} className="bg-mine-shaft-900 rounded-lg p-1 px-2 text-mine-shaft-100 [&_input]:!text-mine-shaft-100" variant="unstyled" label="Job Title" placeholder="Software Engineer" />
                    <TextInput value={type} onChange={(e)=>setType(e.currentTarget.value)} className="bg-mine-shaft-900 rounded-lg p-1 px-2 text-mine-shaft-100 [&_input]:!text-mine-shaft-100" variant="unstyled" label="Job Type" placeholder="Fulltime" />
                    <div className="flex items-center justify-center h-full w-20 bg-bright-sun-400 text-mine-shaft-100 rounded-lg p-2 hover:bg-bright-sun-500 cursor-pointer">
                        <IconSearch onClick={handleClick} className="h-[85%] w-[85%]" />
                    </div>
                </div>
            </div>
            <div data-aos="zoom-out-left"  className="w-[55%] sm-mx:w-full flex items-center justify-center">
                <div className="w-[30rem] relative">
                    <img src="/Boy.png" alt="boy" />
                </div>
            </div>
        </div>
    );
}
export default DreamJob;