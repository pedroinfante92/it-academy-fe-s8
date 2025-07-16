import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { supabase } from "../../../supabaseClient";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const UserByEmailDomainChart = () => {
  const [domainCounts, setDomainCounts] = useState<{
    [domain: string]: number;
  }>({});

  useEffect(() => {
    fetchEmailDomains();
  }, []);

  const fetchEmailDomains = async () => {
    const { data, error } = await supabase.from("SupaCRUD").select("email");

    if (error) {
      console.error("Error fetching emails:", error);
      return;
    }

    const counts: { [domain: string]: number } = {};
    data?.forEach((user) => {
      const domain = user.email?.split("@")[1]?.toLowerCase();
      if (domain) {
        counts[domain] = (counts[domain] || 0) + 1;
      }
    });

    setDomainCounts(counts);
  };

  const backgroundColors = [
    "#FF6384", // Red
    "#36A2EB", // Blue
    "#FFCE56", // Yellow
    "#4BC0C0", // Green
    "#9966FF", // Purple
    "#FF9F40", // Orange
    "#5A5A5A", // Gray
  ];

  const chartData = {
    labels: Object.keys(domainCounts),
    datasets: [
      {
        label: "Users",
        data: Object.values(domainCounts),
        backgroundColor: backgroundColors.slice(
          0,
          Object.keys(domainCounts).length
        ), // Use enough colors from the array
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Users by Email Domain",
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ${value} users`; // Simpler tooltip
          },
        },
      },
    },
    cutout: "60%",
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10" style={{ height: "400px" }}>
      {Object.keys(domainCounts).length > 0 ? (
        <Doughnut data={chartData} options={options} />
      ) : (
        <p className="text-center text-gray-500">
          No email data available to display chart.
        </p>
      )}
    </div>
  );
};

export default UserByEmailDomainChart;
