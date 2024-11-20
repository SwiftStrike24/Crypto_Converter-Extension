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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!amount) {
      setConvertedAmount('');
      return;
    }
    
    setIsLoading(true);

    try {
      const coinId = getCoinId(fromCurrency);
      let result: number;

      // If converting from crypto to fiat
      if (CRYPTO_CURRENCIES.includes(fromCurrency)) {
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

        if (!response.data?.[coinId]?.[toCurrency.toLowerCase()]) {
          throw new Error('Invalid response from API');
        }

        const rate = response.data[coinId][toCurrency.toLowerCase()];
        result = Number(amount) * rate;
      } else {
        // If converting from fiat to crypto
        const coinId = getCoinId(toCurrency);
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          {
            params: {
              ids: coinId,
              vs_currencies: fromCurrency.toLowerCase(),
              x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
            },
          }
        );

        if (!response.data?.[coinId]?.[fromCurrency.toLowerCase()]) {
          throw new Error('Invalid response from API');
        }

        const rate = response.data[coinId][fromCurrency.toLowerCase()];
        result = Number(amount) / rate;
      }

      // Adjust decimal places based on whether result is crypto or fiat
      const isResultCrypto = CRYPTO_CURRENCIES.includes(toCurrency);
      setConvertedAmount(result.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: isResultCrypto ? 8 : 2,
      }));
    } catch (error) {
      console.error('Conversion error:', error);
      setConvertedAmount('Error fetching rates');
    } finally {
      setIsLoading(false);
    }
  };

  // Update getCoinId to include all supported coins
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

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
    setConvertedAmount('');
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSubmit();
    }, 500); // Debounce API calls by 500ms

    return () => clearTimeout(debounceTimer);
  }, [amount, fromCurrency, toCurrency]);

  return (
    <Container>
      <Title>Crypto Converter</Title>
      
      <LivePriceFeed cryptocurrency={CRYPTO_CURRENCIES.includes(fromCurrency) ? fromCurrency : toCurrency} />
      
      <InputGroup>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          aria-label="Amount to convert"
        />
        <Select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          aria-label="Convert from currency"
        >
          <optgroup label="Cryptocurrencies">
            {CRYPTO_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </optgroup>
        </Select>
      </InputGroup>

      <SwapButton onClick={handleSwap}>⇅ Swap</SwapButton>

      <InputGroup>
        <Select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          aria-label="Convert to currency"
        >
          <optgroup label="Fiat Currencies">
            {FIAT_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}
                disabled={currency === fromCurrency}
              >
                {currency}
              </option>
            ))}
          </optgroup>
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
