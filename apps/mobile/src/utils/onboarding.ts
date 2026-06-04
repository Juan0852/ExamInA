import type { User } from "../stores/auth.store";

export function hasCompletedOnboarding(user: User | null | undefined): boolean {
  return Boolean(user?.preferences?.onboardingCompleted);
}

