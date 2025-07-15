    import { Link } from "react-router-dom";


function Navbar () {
    return(
        <nav>
        <Link to="/">Men</Link>
        <Link to="/map">Map</Link>
        <Link to="/fullcalendar">FullCalendar</Link>
        <Link to="/chartjs">ChartJS</Link>
        </nav>
        
    )
}

export default Navbar
