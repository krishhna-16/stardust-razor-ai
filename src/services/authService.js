// Mock Authentication Service for STARDUST AI Builder Platform
// Decoupled from UI components for easy Supabase integration later

const STORAGE_KEYS = {
  USER: "stardust_recovered_session",
  REMEMBER: "stardust_remember_me",
};

/**
 * Validates email format using regex
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Simulates user login
 */
export const login = (email, password, rememberMe = false) => {
  return new Promise((resolve, reject) => {
    // Mimic API network latency
    setTimeout(() => {
      if (!email || !password) {
        return reject(new Error("Please enter both email and password"));
      }

      if (!validateEmail(email)) {
        return reject(new Error("Please enter a valid email"));
      }

      // Demo validation rules: accepts any formatted email, checks password length >= 6
      if (password.length < 6) {
        return reject(new Error("Invalid email or password"));
      }

      const mockUser = {
        email: email.toLowerCase(),
        name: email.split("@")[0].toUpperCase(),
        company: "STARDUST Client",
      };

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
        localStorage.setItem(STORAGE_KEYS.REMEMBER, "true");
      } else {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      }

      resolve(mockUser);
    }, 800);
  });
};

/**
 * Simulates user registration
 */
export const register = (fullName, companyName, email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!fullName || !companyName || !email || !password) {
        return reject(new Error("All fields are required"));
      }

      if (!validateEmail(email)) {
        return reject(new Error("Please enter a valid email"));
      }

      if (password.length < 8) {
        return reject(new Error("Password must be at least 8 characters"));
      }

      const mockUser = {
        email: email.toLowerCase(),
        name: fullName,
        company: companyName,
      };

      // Auto-save user registration in session storage
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      resolve(mockUser);
    }, 1000);
  });
};

/**
 * Checks for stored session
 */
export const getCurrentUser = () => {
  const remember = localStorage.getItem(STORAGE_KEYS.REMEMBER);
  if (remember === "true") {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }
  const sessionStr = sessionStorage.getItem(STORAGE_KEYS.USER);
  return sessionStr ? JSON.parse(sessionStr) : null;
};

/**
 * Logs out and clears storage tokens
 */
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  sessionStorage.removeItem(STORAGE_KEYS.USER);
};
