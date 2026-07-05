import { useAuthContext } from "../context/AuthContext";

// Thin re-export so components import from `hooks/` consistently,
// matching the Reading Journal app's structure.
export function useAuth() {
  return useAuthContext();
}
