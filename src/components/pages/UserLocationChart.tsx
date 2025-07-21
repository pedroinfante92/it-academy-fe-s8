import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { supabase } from "../../../supabaseClient";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserLocationChart = () => {
  const [locationCounts, setLocationCounts] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    const { data, error } = await supabase.from("SupaCRUD").select("location");

    if (error) {
      console.error("Error fetching location data:", error);
      return;
    }

    const counts: { [key: string]: number } = {};

    data?.forEach((user) => {
      const loc = user.location?.trim().toLowerCase() || "unknown";
      counts[loc] = (counts[loc] || 0) + 1;
    });

    setLocationCounts(counts);
  };

  const chartData = {
    labels: Object.keys(locationCounts),
    datasets: [
      {
        label: "Number of Users", // More descriptive label
        data: Object.values(locationCounts),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
      title: { display: true, text: "User Distribution by Location" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      {Object.keys(locationCounts).length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p className="text-center text-gray-500">
          No location data available to display chart.
        </p>
      )}
    </div>
  );
};

export default UserLocationChart;
