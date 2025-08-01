import UserLocationChart from "./UserLocationChart";
import UserSignupChart from "./UserSignupChart";
import UserByEmailDomainChart from "./UserByEmailDomainChart";
import "chartjs-adapter-date-fns";

function ChartJS() {
  return (
    <div className="flex flex-wrap">
      <UserLocationChart />
      <UserSignupChart />
      <UserByEmailDomainChart />
    </div>
  );
}

export default ChartJS;
