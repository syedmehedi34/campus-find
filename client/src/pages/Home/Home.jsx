/* eslint-disable no-unused-vars */
import useUserData from "../../hooks/useUserData";
import Hero from "../../components/Hero";

const Home = () => {
  const { loggedInUser } = useUserData();

  //   console.log(loggedInUser);

  return (
    <div>
      <Hero />
    </div>
  );
};

export default Home;
