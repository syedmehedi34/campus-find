import Hero from "../../components/Hero";
import QuickAction from "../../components/QuickAction";
import HowItWorks from "../../components/HowItWorks";
import CampusStatistics from "../../components/CampusStatistics";
import SafetyTips from "../../components/SafetyTips";
import usePostData from "../../hooks/usePostData";

const Home = () => {
  const { posts } = usePostData({
    // campusCode: "ruet",
  });
  console.log(posts);

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
