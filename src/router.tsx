import { createBrowserRouter } from "react-router-dom";
import Men from "./components/pages/Men";
import Map from "./components/pages/Map";
import FullCalendar from "./components/pages/Calendar";
import ChartJS from "./components/pages/ChartJS";
import Layout from "./components/layout/Layout";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Men /> },
      { path: "/map", element: <Map /> },
      { path: "/fullcalendar", element: <FullCalendar /> },
      { path: "/chartjs", element: <ChartJS /> },
    ],
  },
]);