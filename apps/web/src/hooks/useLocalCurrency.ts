import { useEffect, useState } from "react";

type LocalCurrencyState = {
  amountLocal: number | null;
  isLoading: boolean;
  errorMessage: string | null;
};

const localCurrencyCache = new Map<string, number>();

export function clearLocalCurrencyCache() {
  localCurrencyCache.clear();
}

export function useLocalCurrency(amountUSD: number | null, currency: string | null) {
  const [state, setState] = useState<LocalCurrencyState>({
    amountLocal: null,
    isLoading: false,
    errorMessage: null
  });

  useEffect(() => {
    const normalizedCurrency = currency?.trim().toUpperCase();

    if (amountUSD === null || !normalizedCurrency) {
      setState({
        amountLocal: null,
        isLoading: false,
        errorMessage: null
      });
      return;
    }

    const amount = amountUSD;
    const targetCurrency = normalizedCurrency;
    const cacheKey = `${amount}:${targetCurrency}`;

    const cachedAmount = localCurrencyCache.get(cacheKey);

    if (cachedAmount !== undefined) {
      setState({
        amountLocal: cachedAmount,
        isLoading: false,
        errorMessage: null
      });
      return;
    }

    if (targetCurrency === "USD") {
      localCurrencyCache.set(cacheKey, amount);
      setState({
        amountLocal: amount,
        isLoading: false,
        errorMessage: null
      });
      return;
    }

    const controller = new AbortController();

    async function fetchLocalCurrency() {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
        errorMessage: null
      }));

      try {
        const response = await fetch(
          `https://api.frankfurter.dev/v2/rate/USD/${targetCurrency}`,
          {
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load exchange rate");
        }

        const data = (await response.json()) as {
          rate?: number;
          rates?: Record<string, number>;
        };
        const rate = data.rate ?? data.rates?.[targetCurrency];

        if (typeof rate !== "number") {
          throw new Error("Exchange rate is unavailable");
        }

        localCurrencyCache.set(cacheKey, amount * rate);
        setState({
          amountLocal: amount * rate,
          isLoading: false,
          errorMessage: null
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          amountLocal: null,
          isLoading: false,
          errorMessage:
            error instanceof Error ? error.message : "Unable to load exchange rate"
        });
      }
    }

    void fetchLocalCurrency();

    return () => {
      controller.abort();
    };
  }, [amountUSD, currency]);

  return state;
}
