import useUserData from "../../hooks/useUserData";

const Home = () => {
  const { loggedInUser } = useUserData();
  console.log(loggedInUser);

  return (
    <div>
      <h1>hello</h1>
    </div>
  );
};

export default Home;
