import axiosInstance from "./axios";

export const getAllProducts = async (cache: boolean) => {
  const response = await axiosInstance.get('/product', {
    headers: {
      "cache-control": cache ? "no-cache" : "cache",
    },
  }); // adjust endpoint if different
  return response.data;
};
