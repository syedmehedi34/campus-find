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

// 1. Hero Section
// 2. Quick Action Section
// 3. Latest Lost/Found Items
// 5. Search & Filter Section
// 6. How It Works
// 7. Campus Community Statistics
// 8. Success Stories
// 9. Safety Tips
// 10. Final CTA Section
