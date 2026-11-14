import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Browsing is public; actions need an account. These helpers keep that rule in one place.
 */

export type Role = "APPLICANT" | "EMPLOYER" | "ADMIN" | undefined;

export const useRole = (): Role => {
    const user = useSelector((state: any) => state.user);
    return user?.accountType;
};

/**
 * Returns `requireLogin(action)`: runs `action` when logged in, otherwise sends the
 * visitor to /login and brings them back to this page afterwards.
 */
export const useRequireLogin = () => {
    const user = useSelector((state: any) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    return (action?: () => void) => {
        if (!user) {
            navigate("/login", { state: { from: location.pathname + location.search } });
            return;
        }
        action?.();
    };
};

/** Header links: job seekers (and visitors) see job links; recruiters see hiring links. */
export const navLinksFor = (role: Role) => {
    const seeker = [
        { name: "Find Jobs", url: "/find-jobs" },
        { name: "Job History", url: "/job-history" },
    ];
    const recruiter = [
        { name: "Find Talent", url: "/find-talent" },
        { name: "Post Job", url: "/post-job/0" },
        { name: "Posted Jobs", url: "/posted-jobs/0" },
    ];
    if (role === "EMPLOYER") return recruiter;
    if (role === "APPLICANT") return seeker;
    if (role === "ADMIN") return [seeker[0], ...recruiter, seeker[1]];
    return [seeker[0]]; // visitor: browse jobs; log in for the rest
};
