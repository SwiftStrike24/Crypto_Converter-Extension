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

interface LivePriceFeedProps {
  cryptocurrency: string;
}

const LivePriceFeed: React.FC<LivePriceFeedProps> = ({ cryptocurrency }) => {
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  const FIAT_CURRENCIES = ['USD', 'CAD', 'EUR', 'PHP'];

  const getCoinId = (currency: string): string => {
    const coinIds: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'USDC': 'usd-coin',
      'BONK': 'bonk',
      'JUP': 'jupiter'
    };
    return coinIds[currency] || currency.toLowerCase();
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const coinId = getCoinId(cryptocurrency);
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: coinId,
            vs_currencies: FIAT_CURRENCIES.map(c => c.toLowerCase()).join(','),
            x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
          },
        });

        if (response.data && response.data[coinId]) {
          setPrices(response.data[coinId]);
        }
      } catch (error) {
        console.error('Error fetching live prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [cryptocurrency]);

  if (isLoading) {
    return <LivePriceContainer>Loading prices...</LivePriceContainer>;
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
                ? prices[currency.toLowerCase()].toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : 'N/A'}
            </span>
          </PriceItem>
        ))}
      </PriceGrid>
    </LivePriceContainer>
  );
};

export default LivePriceFeed;
