import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useCampuses = () => {
  const axiosPublic = useAxiosPublic();

  const {
    data: campuses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["campuses"],
    queryFn: async () => {
      const res = await axiosPublic.get("/campuses");
      return res.data.campuses;
    },
  });

  return {
    campuses,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useCampuses;

// const { campuses, isLoading, isError, refetch } = useCampuses();
