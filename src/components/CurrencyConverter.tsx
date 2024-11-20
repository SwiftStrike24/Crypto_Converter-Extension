import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import LivePriceFeed from './LivePriceFeed';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  color: ${props => props.theme.primary};
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  background: ${props => props.theme.inputBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  color: ${props => props.theme.text};
  padding: 12px;
  font-size: 16px;
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const Select = styled.select`
  background: ${props => props.theme.inputBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  color: ${props => props.theme.text};
  padding: 12px;
  font-size: 16px;
  width: 100%;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const SwapButton = styled.button`
  background: ${props => props.theme.primary};
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
  &:hover {
    background: ${props => props.theme.primaryLight};
  }
`;

const Result = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  font-size: 18px;
  margin-top: 10px;
`;

const CRYPTO_CURRENCIES = ['BTC', 'ETH', 'SOL', 'USDC', 'BONK', 'JUP'];
const FIAT_CURRENCIES = ['USD', 'CAD', 'EUR', 'PHP'];

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('BTC');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the correct coin ID for the API
      const coinId = getCoinId(fromCurrency);
      
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: coinId,
            vs_currencies: toCurrency.toLowerCase(),
            x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
          },
        }
      );

      const data = response.data;
      if (!data || !data[coinId]) {
        throw new Error('Invalid response from API');
      }

      const rate = data[coinId][toCurrency.toLowerCase()];
      if (!rate) {
        throw new Error('Rate not available for this pair');
      }

      const result = Number(amount) * rate;
      setConvertedAmount(result.toFixed(2));
    } catch (error) {
      console.error('Conversion error:', error);
      setConvertedAmount('Error fetching rates');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get correct coin IDs for CoinGecko API
  const getCoinId = (currency: string): string => {
    const coinIds: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'XRP': 'ripple'
    };
    return coinIds[currency] || currency.toLowerCase();
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
    setConvertedAmount('');
  };

  useEffect(() => {
    if (amount) {
      handleSubmit({} as React.FormEvent);
    }
  }, [amount, fromCurrency, toCurrency]);

  return (
    <Container>
      <Title>Crypto Converter</Title>
      
      <LivePriceFeed cryptocurrency={fromCurrency} />
      
      <InputGroup>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <Select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
        >
          {CRYPTO_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
      </InputGroup>

      <SwapButton onClick={handleSwap}>⇅ Swap</SwapButton>

      <InputGroup>
        <Select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
        >
          {FIAT_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
      </InputGroup>

      {convertedAmount && (
        <Result>
          {isLoading ? 'Converting...' : `${convertedAmount} ${toCurrency}`}
        </Result>
      )}
    </Container>
  );
};

export default CurrencyConverter;
