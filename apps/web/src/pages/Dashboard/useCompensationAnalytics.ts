import { useEffect, useState } from "react";

import { getApiErrorMessage } from "../../api/responses";
import { getCompensationAnalytics, type CompensationAnalytics } from "./dashboard.api";

type CompensationAnalyticsState = {
  analytics: CompensationAnalytics | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export function useCompensationAnalytics() {
  const [state, setState] = useState<CompensationAnalyticsState>({
    analytics: null,
    isLoading: true,
    errorMessage: null
  });

  useEffect(() => {
    const abortController = new AbortController();

    setState((current) => ({
      ...current,
      isLoading: true,
      errorMessage: null
    }));

    getCompensationAnalytics(abortController.signal)
      .then((analytics) => {
        setState({
          analytics,
          isLoading: false,
          errorMessage: null
        });
      })
      .catch((error) => {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          analytics: null,
          isLoading: false,
          errorMessage: getApiErrorMessage(
            error,
            "Unable to load dashboard analytics. Please try again."
          )
        });
      });

    return () => abortController.abort();
  }, []);

  return state;
}
