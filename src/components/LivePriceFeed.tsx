import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const LivePriceContainer = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const PriceTitle = styled.h2`
  font-size: 16px;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 10px;
`;

const PriceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const PriceItem = styled.div`
  font-size: 14px;
  color: ${props => props.theme.text};
  display: flex;
  justify-content: space-between;
  padding: 5px;
  border-bottom: 1px solid ${props => props.theme.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.error};
  font-size: 14px;
  text-align: center;
  padding: 10px;
`;

interface LivePriceFeedProps {
  cryptocurrency: string;
  customTokens?: Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
  }>;
}

type TokenMap = {
  [key: string]: string;
};

const DEFAULT_TOKENS: TokenMap = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'BONK': 'bonk',
  'JUP': 'jupiter-exchange-solana'
} as const;

const FIAT_CURRENCIES = ['USD', 'CAD', 'EUR', 'PHP'];

const formatPrice = (price: number): string => {
  if (price === 0) return '0';
  if (price < 0.00001) return price.toExponential(2);
  if (price < 0.0001) return price.toFixed(8);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const LivePriceFeed: React.FC<LivePriceFeedProps> = ({ cryptocurrency, customTokens = [] }) => {
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCoinId = (currency: string): string | null => {
    // First check custom tokens
    const customToken = customTokens.find(token => token.symbol === currency);
    if (customToken) {
      return customToken.id;
    }
    // Then check default tokens
    return DEFAULT_TOKENS[currency] || null;
  };

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const coinId = getCoinId(cryptocurrency);
        if (!coinId) {
          setError('Token not found');
          setIsLoading(false);
          return;
        }

        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: coinId,
            vs_currencies: FIAT_CURRENCIES.map(c => c.toLowerCase()).join(','),
            x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
          },
        });

        if (!response.data || !response.data[coinId]) {
          setError('Price data not available');
          setPrices({});
        } else {
          setPrices(response.data[coinId]);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching live prices:', error);
        setError('Failed to fetch prices');
        setPrices({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [cryptocurrency, customTokens]);

  if (isLoading) {
    return <LivePriceContainer>Loading prices...</LivePriceContainer>;
  }

  if (error) {
    return (
      <LivePriceContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </LivePriceContainer>
    );
  }

  return (
    <LivePriceContainer>
      <PriceTitle>Live {cryptocurrency} Prices</PriceTitle>
      <PriceGrid>
        {FIAT_CURRENCIES.map((currency) => (
          <PriceItem key={currency}>
            <span>{currency}</span>
            <span>
              {prices[currency.toLowerCase()]
                ? formatPrice(prices[currency.toLowerCase()])
                : 'N/A'}
            </span>
          </PriceItem>
        ))}
      </PriceGrid>
    </LivePriceContainer>
  );
};

export default LivePriceFeed;
