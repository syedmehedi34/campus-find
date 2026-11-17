import { RingLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 bg-gray-100/80 z-9999">
      <RingLoader
        color="#2563eb" // Tailwind blue-600
        size={80}
        speedMultiplier={1}
        loading={true}
      />
    </div>
  );
};

export default Loader;
