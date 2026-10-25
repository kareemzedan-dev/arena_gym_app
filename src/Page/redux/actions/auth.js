import {
  signupAction,
  loginAction,
  membershipAction,
  classAction,
  membershipDaysAction,
  singleMemberAction,
  updateMemberprofileAction,
  userLogoutAction,
  userDeleteAction,
} from "../../../util/action.js";
import { AlertHelper } from "../../App/AlertHelper";
import { Alert } from "react-native";
import { t } from "../../../../locals";
import * as SecureStore from "expo-secure-store";
import authManager from "../../../util/AuthManager";

import {
  LOADING_START_SIGNUP,
  LOADING_END_SIGNUP,
  MEMBERSHIP_DROPDOWN_LIST,
  MEMBERSHIP_CLASS_LIST,
  MEMBERSHIP_DAYS,
  SIGNUP_SUCCESS,
  GET_USER_DETAILS,
  USER_LOGOUT,
  USER_DELETE,
  USER_LOGIN,
} from "../constant/types";

// Global alert callback for custom alerts
let globalShowAlert = null;

export const setGlobalShowAlert = (showAlertFunction) => {
  globalShowAlert = showAlertFunction;
};

const showAlert = async (type, title, message) => {
  console.log(`🚨 Alert: ${type} - ${title}: ${message}`);
  
  // Check if this is an unauthorized error and handle automatically
  const isAuthError = await authManager.checkAndShowAlert(type, title, message);
  if (isAuthError) {
    console.log('🔐 Auth error detected and handled automatically');
    return; // Don't show the normal alert
  }
  
  // Try custom alert first
  if (globalShowAlert && typeof globalShowAlert === 'function') {
    try {
      globalShowAlert(type, title, message);
      return;
    } catch (error) {
      console.warn("Custom alert failed:", error);
    }
  }
  
  // Fallback to AlertHelper
  try {
    AlertHelper.show(type, title, message);
  } catch (error) {
    console.warn("AlertHelper failed, using fallback Alert:", error);
    Alert.alert(title, message);
  }
};

const signupData = (data) => ({
  type: SIGNUP_SUCCESS,
  data,
});

const userLogin = (token, role) => ({
  type: USER_LOGIN,
  payload: { token, role },
});

const userLogout = (data) => ({
  type: USER_LOGOUT,
  data,
});

const userDelete = (data) => ({
  type: USER_DELETE,
  data,
});

const userDetails = (data) => ({
  type: GET_USER_DETAILS,
  data,
});

const setMembershipList = (data) => ({
  type: MEMBERSHIP_DROPDOWN_LIST,
  data,
});

const setMembershipClassList = (data) => ({
  type: MEMBERSHIP_CLASS_LIST,
  data,
});

const setMembershipDays = (data) => ({
  type: MEMBERSHIP_DAYS,
  data,
});

const startLoading = () => ({
  type: LOADING_START_SIGNUP,
});

const endLoading = () => ({
  type: LOADING_END_SIGNUP,
});

export const Deletemember = (data) => (dispatch) => {
  dispatch(userDelete(data));
  return userDeleteAction(data).then((responseJson) => {
    if (responseJson.status == 1) {
      dispatch(endLoading());
      showAlert("success", t("Success"), responseJson.error);
    } else {
      showAlert("warn", t("Warning"), responseJson.error);
    }
  });
};

export const Logoutmember = (data) => (dispatch) => {
  return userLogoutAction(data)
    .then(async (responseJson) => {
      if (responseJson.status == 1) {
        try {
          // Clear all stored data with better error handling
          await Promise.allSettled([
            SecureStore.deleteItemAsync("access_token").catch((error) => {
              console.warn("Failed to delete access_token:", error);
            }),
            SecureStore.deleteItemAsync("role_name").catch((error) => {
              console.warn("Failed to delete role_name:", error);
            }),
            SecureStore.deleteItemAsync("id").catch((error) => {
              console.warn("Failed to delete id:", error);
            }),
            SecureStore.deleteItemAsync("email").catch((error) => {
              console.warn("Failed to delete email:", error);
            }),
          ]);
          dispatch(userLogout(responseJson));
          dispatch(endLoading());
          showAlert("success", t("Success"), t("Logout successful"));
        } catch (error) {
          console.error("Logout cleanup error:", error);
          dispatch(userLogout(responseJson));
          dispatch(endLoading());
        }
      } else {
        dispatch(endLoading());
        showAlert("warn", t("Warning"), responseJson.error);
      }
    })
    .catch(async (error) => {
      console.error("Logout API error:", error);
      // Force logout even if API call fails
      try {
        await Promise.allSettled([
          SecureStore.deleteItemAsync("access_token").catch((error) => {
            console.warn("Failed to delete access_token during forced logout:", error);
          }),
          SecureStore.deleteItemAsync("role_name").catch((error) => {
            console.warn("Failed to delete role_name during forced logout:", error);
          }),
          SecureStore.deleteItemAsync("id").catch((error) => {
            console.warn("Failed to delete id during forced logout:", error);
          }),
          SecureStore.deleteItemAsync("email").catch((error) => {
            console.warn("Failed to delete email during forced logout:", error);
          }),
        ]);
        dispatch(userLogout({}));
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
        // Still dispatch logout even if cleanup fails
        dispatch(userLogout({}));
      }
      dispatch(endLoading());
    });
};

export const fetchUserdetails = (data) => (dispatch) => {
  dispatch(startLoading());
  return singleMemberAction(data)
    .then(async (responseJson) => {
      // Check for auth errors first
      await authManager.handleApiResponse(responseJson);
      
      if (responseJson.status == 1 && responseJson.result) {
        // Fix image URL to use correct host
        if (responseJson.result.member_image) {
          responseJson.result.member_image = responseJson.result.member_image.replace(
            'http://localhost',
            'http://192.168.1.2'
          );
        }
        dispatch(userDetails(responseJson));
        dispatch(endLoading());
      } else {
        dispatch(endLoading());
        await showAlert("warn", t("Warning"), responseJson.error || "Failed to load user data");
      }
    })
    .catch(async (error) => {
      console.error("Error fetching user details:", error);
      dispatch(endLoading());
      
      // Check if it's an auth-related error
      await authManager.handleFetchError(error);
      await showAlert("error", t("Error"), "Network error occurred");
    });
};

export const updateUserdetails = (data) => (dispatch) => {
  return updateMemberprofileAction(data).then((responseJson) => {
    if (responseJson.status == 1) {
      showAlert("success", t("Success"), responseJson.error);
      dispatch(fetchUserdetails(data));
    } else {
      dispatch(endLoading());
      showAlert("warn", t("Warning"), responseJson.error);
    }
  });
};

export const fetchMembershipList = () => (dispatch) => {
  return membershipAction().then((responseJson) => {
    if (responseJson.status == 1) {
      dispatch(setMembershipList(responseJson));
    } else {
      dispatch(endLoading());
      showAlert("warn", t("Warning"), responseJson.error);
    }
  });
};

export const fetchMembershipClassList = (data) => (dispatch) => {
  return classAction(data).then((responseJson) => {
    if (responseJson.status == 1) {
      dispatch(setMembershipClassList(responseJson));
      dispatch(fetchMembershipDays(data));
    } else {
      dispatch(setMembershipClassList(responseJson));
      dispatch(endLoading());
    }
  });
};

export const fetchMembershipDays = (data) => (dispatch) => {
  return membershipDaysAction(data).then((responseJson) => {
    if (responseJson.status == 1) {
      dispatch(setMembershipDays(responseJson.result[0]));
    } else {
      dispatch(endLoading());
      showAlert("warn", t("Warning"), responseJson.error);
    }
  });
};

export const signUp = (data, navigate) => (dispatch) => {
  signupAction(data).then((responseJson) => {
    if (responseJson.status == 1) {
      SecureStore.setItemAsync("email", data.email);
      dispatch(signupData(responseJson));
      if (navigate && typeof navigate === "function") {
        navigate("LoginPage");
      }
      showAlert("success", t("Success"), responseJson.error);
    } else {
      dispatch(endLoading());
      showAlert("warn", t("Warning"), responseJson.error);
    }
  });
};

export const login = (data, navigate) => (dispatch) => {
  console.log("🔐 Login action called with data:", data);
  
  return loginAction(data)
    .then(async (responseJson) => {
      console.log("📡 Login API response:", responseJson);
      
      if (responseJson.status == 1) {
        console.log("✅ Login successful, saving auth data");
        try {
          // Use Promise.allSettled for better error handling
          const saveResults = await Promise.allSettled([
            SecureStore.setItemAsync("access_token", responseJson.result.access_token),
            SecureStore.setItemAsync("role_name", responseJson.result.role_name),
            SecureStore.setItemAsync("id", JSON.stringify(responseJson.result.id))
          ]);
          
          // Check if any saves failed
          const failedSaves = saveResults.filter(result => result.status === 'rejected');
          if (failedSaves.length > 0) {
            console.error("❌ Some SecureStore saves failed:", failedSaves);
            dispatch(endLoading());
            showAlert("error", t("Error"), "Failed to save login data securely");
            return;
          }
          
          console.log("💾 Auth data saved to SecureStore");
          
          dispatch(userLogin(responseJson.result.access_token, responseJson.result.role_name));
          
          // Add delay to prevent race condition
          setTimeout(async () => {
            try {
              const userData = {
                member_id: responseJson.result.id,
                access_token: responseJson.result.access_token,
              };
              
              console.log("👤 Fetching user details with:", userData);
              await dispatch(fetchUserdetails(userData));
              
              dispatch(endLoading());
              showAlert("success", t("Success"), t("Login successful"));
            } catch (fetchError) {
              console.error("❌ User details fetch error:", fetchError);
              dispatch(endLoading());
              // Don't show error for user details fetch failure, user is still logged in
              showAlert("success", t("Success"), t("Login successful"));
            }
          }, 300); // Delay to ensure auth state is properly updated
          
        } catch (error) {
          console.error("❌ SecureStore error:", error);
          dispatch(endLoading());
          showAlert("error", t("Error"), "Failed to save login data");
        }
      } else {
        console.log("❌ Login failed:", responseJson.error);
        dispatch(endLoading());
        
        // Show more specific error messages based on error code
        let errorTitle = "Login Failed";
        let errorMessage = responseJson.error || "Login failed";
        
        if (responseJson.error_code === 401) {
          errorTitle = "Invalid Credentials";
          if (responseJson.error && responseJson.error.includes("cannot log in")) {
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          } else {
            errorMessage = "Authentication failed. Please verify your email and password.";
          }
        } else if (responseJson.error_code === 403) {
          errorTitle = "Access Denied";
          errorMessage = "Your account doesn't have permission to access this application.";
        } else if (responseJson.error_code === 404) {
          errorTitle = "Account Not Found";
          errorMessage = "No account found with these credentials.";
        }
        
        showAlert("error", errorTitle, errorMessage);
      }
    })
    .catch((error) => {
      console.error("🚨 Login error:", error);
      dispatch(endLoading());
      showAlert("error", "Connection Error", "Unable to connect to server. Please check your internet connection and try again.");
    });
};

export const loadingStart = () => (dispatch) => {
  dispatch(startLoading());
};