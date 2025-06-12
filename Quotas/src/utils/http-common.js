import axios from "axios";
const domain = window.location.origin;
var baseURLApi;
if (domain.includes("public.myrentall.eu")) {
  // baseURLApi = process.env.VUE_APP_API_PUBLIC_BASE_URL;
  baseURLApi = "http://localhost:250/"
} else {
  // baseURLApi = process.env.VUE_APP_API_BASE_URL;
  baseURLApi = "http://localhost:250/";
}
const HTTP = axios.create({
  baseURL: baseURLApi,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});
HTTP.interceptors.response.use(
  (response) => {
    if (response.headers["refresh-token"]) {
      localStorage.setItem("sessionToken", response.headers["refresh-token"]);
    }
    return response;
  },
  (error) => {
    if (error.response.data.code === 401 || error.response.status === 401) {
      localStorage.removeItem("sessionToken");
    }
    return Promise.reject(error);
  }
);
export default HTTP;
