import { useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../providers/AuthProvider";
import useAxiosPublic from "./useAxiosPublic";

const useUserData = ({
  fetchAll = false,
  userId = null,
  collegeId = null,
} = {}) => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  // 1. Fetch logged-in user
  const loggedInUserQuery = useQuery({
    queryKey: ["users", "me", user?.uid],
    queryFn: async () => {
      const res = await axiosPublic.get(`/users/${user.uid}`);
      return res.data;
    },
    enabled: !!user?.uid,
  });

  // 2. Fetch all users
  const allUsersQuery = useQuery({
    queryKey: ["users", "list", { collegeId: null }],
    queryFn: async () => {
      const res = await axiosPublic.get("/users");
      return res.data;
    },
    enabled: fetchAll,
  });

  // 3. Fetch specific user
  const specificUserQuery = useQuery({
    queryKey: ["users", "detail", userId],
    queryFn: async () => {
      const res = await axiosPublic.get(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // 4. Fetch users by college
  const collegeUsersQuery = useQuery({
    queryKey: ["users", "list", { collegeId }],
    queryFn: async () => {
      const res = await axiosPublic.get("/users", {
        params: { collegeId },
      });
      return res.data;
    },
    enabled: !!collegeId,
  });

  // 5. Update user profile
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      const res = await axiosPublic.patch(`/users/${userId}`, data);
      return res.data;
    },

    // Optimistic Update
    onMutate: async ({ userId, data }) => {
      // Cancel ongoing user queries
      await queryClient.cancelQueries({
        queryKey: ["users"],
      });

      // Save previous cache data
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["users"],
      });

      // Update logged-in user cache
      queryClient.setQueryData(["users", "me", userId], (oldData) =>
        oldData ? { ...oldData, ...data } : oldData,
      );

      // Update specific user cache
      queryClient.setQueryData(["users", "detail", userId], (oldData) =>
        oldData ? { ...oldData, ...data } : oldData,
      );

      // Update all users and college-wise users cache
      const listQueries = queryClient.getQueriesData({
        queryKey: ["users", "list"],
      });

      listQueries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;

        const filterCollegeId = queryKey[2]?.collegeId;

        const updatedUsers = oldData
          .map((item) => (item.userId === userId ? { ...item, ...data } : item))
          .filter(
            (item) => !filterCollegeId || item.collegeId === filterCollegeId,
          );

        queryClient.setQueryData(queryKey, updatedUsers);
      });

      return { previousQueries };
    },

    // Rollback if update fails
    onError: (error, variables, context) => {
      context?.previousQueries?.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    // Refetch latest data from server
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });

  return {
    // Data
    loggedInUser: loggedInUserQuery.data,
    allUsers: allUsersQuery.data || [],
    specificUser: specificUserQuery.data,
    collegeUsers: collegeUsersQuery.data || [],

    // Loading
    loggedInUserLoading: loggedInUserQuery.isLoading,
    allUsersLoading: allUsersQuery.isLoading,
    specificUserLoading: specificUserQuery.isLoading,
    collegeUsersLoading: collegeUsersQuery.isLoading,

    // Errors
    loggedInUserError: loggedInUserQuery.error,
    allUsersError: allUsersQuery.error,
    specificUserError: specificUserQuery.error,
    collegeUsersError: collegeUsersQuery.error,

    // Refetch
    fetchLoggedInUser: loggedInUserQuery.refetch,
    fetchAllUsers: allUsersQuery.refetch,
    fetchUserById: specificUserQuery.refetch,
    fetchUsersByCollege: collegeUsersQuery.refetch,

    // Update
    updateUserProfile: updateUserMutation.mutate,
    updateUserProfileAsync: updateUserMutation.mutateAsync,
    updating: updateUserMutation.isPending,
    updateError: updateUserMutation.error,
  };
};

export default useUserData;

{
  /* 

//* logged in user data
const { loggedInUser, loggedInUserLoading } = useUserData();

//* all users data
const { allUsers, allUsersLoading } = useUserData({
  fetchAll: true,
});

//* specific user data
const { specificUser, specificUserLoading } = useUserData({
  userId: "firebase-user-id",
});

//* college-wise users data
  const [collegeId, setCollegeId] = useState("");

  const { collegeUsers, collegeUsersLoading } = useUserData({
    collegeId,
  });

  //* profile update 
const { loggedInUser, updateUserProfile, updating } = useUserData();

const handleUpdate = () => {
    updateUserProfile({
      userId: loggedInUser.userId,
      data: {
        name: "Mehedi Hasan",
        collegeId: "bru",
      },
    });
  };




*/
}
