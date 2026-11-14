import { IconMail, IconPhone } from "@tabler/icons-react";
import Logo from "../Brand/Logo";
import { footerLinks } from "../../Data/Data";
import { Link, useLocation } from "react-router-dom";
import { Divider } from "@mantine/core";

const Footer = () => {
    const location=useLocation();
    return location.pathname!='/signup' && location.pathname!='/login'?<div className="flex flex-col gap-2"><div className="pt-20 pb-5 bg-mine-shaft-950 p-4  flex gap-8 justify-around flex-wrap">
        <div data-aos="fade-up"  data-aos-offset="0"  className="w-1/4 min-w-[17rem] xs-mx:w-full xs-mx:min-w-0 flex flex-col gap-4">
            <Logo size="sm" />
            <div className="text-sm text-mine-shaft-300">Find jobs and hire talent in one place: profiles, applications and interviews. Part of <a href="https://www.onekampus.com" target="_blank" rel="noopener noreferrer" className="text-bright-sun-400 hover:underline">oneKampus</a>.</div>
            <div className="flex flex-col gap-1 text-sm text-mine-shaft-300 [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a:hover]:text-bright-sun-400">
                <a href="mailto:ritiksharma555598@gmail.com"><IconMail className="h-4 w-4 shrink-0" stroke={1.5} /><span className="break-all">ritiksharma555598@gmail.com</span></a>
                <a href="tel:+918125625828"><IconPhone className="h-4 w-4 shrink-0" stroke={1.5} />+91 81256 25828</a>
            </div>
        </div>
        {
            footerLinks.map((item, index) => <div  data-aos-offset="0"  data-aos="fade-up" key={index}>
                <div className="text-lg font-semibold mb-4 text-bright-sun-400">{item.title}</div>
                {
                    item.links.map((link, index) => <Link to={link.url} key={index} className="block text-mine-shaft-300 text-sm hover:text-bright-sun-400 cursor-pointer mb-1 hover:translate-x-2 transition duration-300 ease-in-out">{link.name}</Link>)
                }
            </div>)
        }
    </div>
    <Divider/>
    <div data-aos="flip-left"  data-aos-offset="0" className="font-medium text-center p-5">
        © {new Date().getFullYear()} oneKampus Jobs. All rights reserved.
    </div>
    </div>:<></>
}
export default Footer;