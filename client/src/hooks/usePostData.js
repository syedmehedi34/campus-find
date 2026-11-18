import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const usePostData = ({
  campusCode,
  email,
  type = "all",
  category,
  search,
  moderationStatus = "all",
  postStatus = "all",
  page = 1,
  limit = 12,
} = {}) => {
  const axiosPublic = useAxiosPublic();

  const { data, ...queryInfo } = useQuery({
    queryKey: [
      "posts",
      {
        campusCode,
        email,
        type,
        category,
        search,
        moderationStatus,
        postStatus,
        page,
        limit,
      },
    ],

    queryFn: async () => {
      const params = {
        type,
        moderationStatus,
        postStatus,
        page,
        limit,
      };

      if (campusCode) params.campusCode = campusCode;
      if (email) params.email = email;
      if (category) params.category = category;
      if (search?.trim()) params.search = search.trim();

      const { data } = await axiosPublic.get("/admin/items", {
        params,
      });

      return data;
    },

    staleTime: 1000 * 30, // 30 seconds

    refetchInterval: 1000 * 30, // Refetch every 30 seconds

    refetchOnWindowFocus: true,

    refetchOnReconnect: true,
  });

  return {
    posts: data?.items || [],
    totalItems: data?.totalItems || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    stats: data?.stats || {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },

    ...queryInfo,
  };
};

export default usePostData;

{
  /*
 //* fetch all 
const {
  posts,
  totalItems,
  isLoading,
  isError,
  refetch,
} = usePostData();

//* fixed campus
const { posts, isLoading } = usePostData({
  campusCode: "RUET",
});

//* fixed mail 
const { posts, isLoading } = usePostData({
  email: "mehedi@gmail.com",
});

// full data with pagination and filter 
const { posts, totalPages } = usePostData({
  campusCode: "RUET",
  type: "lost",
  category: "electronics",
  search: "iPhone",
  moderationStatus: "approved",
  page: 1,
  limit: 12,
});




    */
}
