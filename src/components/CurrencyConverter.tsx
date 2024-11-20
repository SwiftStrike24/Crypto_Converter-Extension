import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

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

  const API_KEY = 'CG-P9tKCtSKSsQpFA2A654dTQ65';

  const convertCurrency = async () => {
    if (!amount || isNaN(Number(amount))) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: CRYPTO_CURRENCIES.map(c => c.toLowerCase()).join(','),
            vs_currencies: FIAT_CURRENCIES.map(c => c.toLowerCase()).join(','),
            x_cg_demo_api_key: API_KEY,
          },
        }
      );

      const rates = response.data;
      let result = 0;

      if (CRYPTO_CURRENCIES.includes(fromCurrency) && FIAT_CURRENCIES.includes(toCurrency)) {
        // Crypto to Fiat
        const rate = rates[fromCurrency.toLowerCase()][toCurrency.toLowerCase()];
        result = Number(amount) * rate;
      } else if (FIAT_CURRENCIES.includes(fromCurrency) && CRYPTO_CURRENCIES.includes(toCurrency)) {
        // Fiat to Crypto
        const rate = rates[toCurrency.toLowerCase()][fromCurrency.toLowerCase()];
        result = Number(amount) / rate;
      } else {
        throw new Error('Invalid currency conversion pair');
      }

      setConvertedAmount(result.toFixed(8));
    } catch (error) {
      console.error('Conversion error:', error);
      setConvertedAmount('Error fetching rates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
    setConvertedAmount('');
  };

  useEffect(() => {
    if (amount) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  return (
    <Container>
      <Title>Crypto Converter</Title>
      
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
