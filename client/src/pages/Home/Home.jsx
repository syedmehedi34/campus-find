/* eslint-disable no-unused-vars */
import Hero from "../../components/Hero";
import QuickAction from "../../components/QuickAction";
import HowItWorks from "../../components/HowItWorks";
import CampusStatistics from "../../components/CampusStatistics";
import SafetyTips from "../../components/SafetyTips";
// import useUserData from "../../hooks/useUserData";
// import usePostData from "../../hooks/usePostData";
// import useCampuses from "../../hooks/useCampuses";

const Home = () => {
  //
  return (
    <div>
      <Hero />
      <QuickAction />
      <HowItWorks />
      <CampusStatistics />
      <SafetyTips />
    </div>
  );
};

export default Home;
