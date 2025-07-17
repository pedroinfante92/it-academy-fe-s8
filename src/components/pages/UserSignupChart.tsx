import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { supabase } from "../../../supabaseClient";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UserSignupChart = () => {
  const [signupData, setSignupData] = useState<
    { date: string; count: number }[]
  >([]);

  useEffect(() => {
    fetchSignupData();
  }, []);

  const fetchSignupData = async () => {
    const { data, error } = await supabase
      .from("SupaCRUD")
      .select("created_at");

    if (error) {
      console.error("Error fetching signups:", error);
      return;
    }

    const counts: { [month: string]: number } = {};

    data?.forEach((user) => {
      const date = new Date(user.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      counts[monthKey] = (counts[monthKey] || 0) + 1;
    });

    const sortedData = Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    setSignupData(sortedData);
  };

  const chartData = {
    labels: signupData.map((d) => d.date),
    datasets: [
      {
        label: "Signups per Month",
        data: signupData.map((d) => d.count),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "User Signups Over Time" },
    },
    scales: {
      x: {
        type: "category" as const,
        title: {
          display: true,
          text: "Month",
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Number of Signups",
        },
      },
    },
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      {signupData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p className="text-center text-gray-500">
          No signup data available to display chart.
        </p>
      )}
    </div>
  );
};

export default UserSignupChart;
