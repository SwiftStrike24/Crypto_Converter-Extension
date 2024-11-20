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

const CRYPTO_CURRENCIES = ['BTC', 'ETH', 'SOL', 'USDC', 'BONK', 'JUP'];
const FIAT_CURRENCIES = ['USD', 'CAD', 'EUR', 'PHP'];

const ResultContainer = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.inputBackground};
  }

  &:active {
    opacity: 0.8;
  }
`;

const ResultText = styled.div`
  font-size: 18px;
  color: ${props => props.theme.text};
`;

const CopyIndicator = styled.div`
  font-size: 12px;
  color: ${props => props.theme.primaryLight};
  margin-top: 4px;
`;

const CurrencyConverter: React.FC = () => {
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [cryptoCurrency, setCryptoCurrency] = useState<string>('BTC');
  const [fiatCurrency, setFiatCurrency] = useState<string>('USD');
  const [showCopyIndicator, setShowCopyIndicator] = useState(false);
  const [lastEditedField, setLastEditedField] = useState<'crypto' | 'fiat'>('crypto');

  const handleCryptoChange = async (value: string) => {
    setLastEditedField('crypto');
    setCryptoAmount(value);
    if (!value) {
      setFiatAmount('');
      return;
    }
    
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: getCoinId(cryptoCurrency),
          vs_currencies: fiatCurrency.toLowerCase(),
          x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
        },
      });

      const rate = response.data[getCoinId(cryptoCurrency)][fiatCurrency.toLowerCase()];
      const result = Number(value) * rate;
      const formattedResult = result.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFiatAmount(formattedResult.replace(/,/g, ''));
    } catch (error) {
      console.error('Conversion error:', error);
      setFiatAmount('Error');
    }
  };

  const handleFiatChange = async (value: string) => {
    setLastEditedField('fiat');
    setFiatAmount(value);
    if (!value) {
      setCryptoAmount('');
      return;
    }

    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: getCoinId(cryptoCurrency),
          vs_currencies: fiatCurrency.toLowerCase(),
          x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
        },
      });

      const rate = response.data[getCoinId(cryptoCurrency)][fiatCurrency.toLowerCase()];
      const result = Number(value) / rate;
      const formattedResult = result.toLocaleString(undefined, {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8,
      });
      setCryptoAmount(formattedResult.replace(/,/g, ''));
    } catch (error) {
      console.error('Conversion error:', error);
      setCryptoAmount('Error');
    }
  };

  const handleCopyClick = async () => {
    if (!cryptoAmount || !fiatAmount) return;
    
    const textToCopy = lastEditedField === 'crypto' ? fiatAmount : cryptoAmount;
    await navigator.clipboard.writeText(textToCopy);
    
    setShowCopyIndicator(true);
    setTimeout(() => setShowCopyIndicator(false), 2000);
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

  useEffect(() => {
    if (cryptoAmount) {
      const debounceTimer = setTimeout(() => {
        handleCryptoChange(cryptoAmount);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [cryptoCurrency, fiatCurrency]);

  useEffect(() => {
    if (fiatAmount) {
      const debounceTimer = setTimeout(() => {
        handleFiatChange(fiatAmount);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [cryptoCurrency, fiatCurrency]);

  return (
    <Container>
      <Title>Crypto Converter</Title>
      
      <LivePriceFeed cryptocurrency={cryptoCurrency} />
      
      <InputGroup>
        <Input
          type="number"
          value={cryptoAmount}
          onChange={(e) => handleCryptoChange(e.target.value)}
          placeholder="Enter crypto amount"
          aria-label="Crypto amount"
          step="any"
        />
        <Select
          value={cryptoCurrency}
          onChange={(e) => setCryptoCurrency(e.target.value)}
          aria-label="Select cryptocurrency"
          title="Select cryptocurrency"
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

      <InputGroup>
        <Input
          type="number"
          value={fiatAmount}
          onChange={(e) => handleFiatChange(e.target.value)}
          placeholder="Enter fiat amount"
          aria-label="Fiat amount"
          step="any"
        />
        <Select
          value={fiatCurrency}
          onChange={(e) => setFiatCurrency(e.target.value)}
          aria-label="Select fiat currency"
          title="Select fiat currency"
        >
          <optgroup label="Fiat Currencies">
            {FIAT_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </optgroup>
        </Select>
      </InputGroup>

      {(cryptoAmount && fiatAmount) && (
        <ResultContainer onClick={handleCopyClick}>
          <ResultText>
            {cryptoAmount} {cryptoCurrency} = {fiatAmount} {fiatCurrency}
          </ResultText>
          <CopyIndicator>
            {showCopyIndicator ? 'Copied!' : `Click to copy ${lastEditedField === 'crypto' ? fiatCurrency : cryptoCurrency} value`}
          </CopyIndicator>
        </ResultContainer>
      )}
    </Container>
  );
};

export default CurrencyConverter;
