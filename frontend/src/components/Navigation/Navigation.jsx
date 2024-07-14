import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import './Navigation.css';
import { GiPalmTree } from "react-icons/gi";

const Navigation = ({isLoaded}) => {
    const sessionUser = useSelector(state => state.session.user)

    return (
        <nav>
        <ul>
            <li id="home-nav">
                <NavLink to="/">
                    <div id="site-icon"><GiPalmTree /></div>
                    Vacay Stays
                </NavLink>
            </li>
            {isLoaded && (
                <li>
                    <ProfileButton user={sessionUser} />
                </li>
            )}
        </ul>
        </nav>
    )
};

export default Navigation;
