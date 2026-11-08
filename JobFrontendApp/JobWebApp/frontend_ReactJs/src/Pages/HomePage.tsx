
import Footer from "../Components/Footer/Footer";
import Header from "../Components/Header/Header";
import DreamJob from "../Components/LandingPage/DreamJob";
import JobCategory from "../Components/LandingPage/JobCategory";
import Working from "../Components/LandingPage/Working";

const HomePage=()=>{
    return (
        <div className="min-h-[90vh] bg-mine-shaft-950 font-['poppins']">
            <DreamJob/>
            <JobCategory/>
            <Working/>
        </div>
    )
}
export default HomePage;