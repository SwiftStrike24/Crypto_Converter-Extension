import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import LivePriceFeed from './LivePriceFeed';
import TokenSearch from './TokenSearch';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
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

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const AddTokenButton = styled.button`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.primary};
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  z-index: 1;

  &:hover {
    color: ${props => props.theme.primaryLight};
  }
`;

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

interface CustomToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

const DEFAULT_TOKENS: CustomToken[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: '' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', image: '' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', image: '' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', image: '' },
  { id: 'bonk', symbol: 'BONK', name: 'Bonk', image: '' },
  { id: 'jupiter-exchange-solana', symbol: 'JUP', name: 'Jupiter', image: '' },
];

const FIAT_CURRENCIES = ['USD', 'CAD', 'EUR', 'PHP'];

const CurrencyConverter: React.FC = () => {
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [cryptoCurrency, setCryptoCurrency] = useState<string>('BTC');
  const [fiatCurrency, setFiatCurrency] = useState<string>('USD');
  const [showCopyIndicator, setShowCopyIndicator] = useState(false);
  const [showTokenSearch, setShowTokenSearch] = useState(false);
  const [customTokens, setCustomTokens] = useState<CustomToken[]>(() => {
    const saved = localStorage.getItem('customTokens');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastEditedField, setLastEditedField] = useState<'crypto' | 'fiat'>('crypto');

  const allTokens = [...DEFAULT_TOKENS, ...customTokens];

  useEffect(() => {
    localStorage.setItem('customTokens', JSON.stringify(customTokens));
  }, [customTokens]);

  const handleAddTokens = (newTokens: CustomToken[]) => {
    setCustomTokens(prev => {
      const updatedTokens = [...prev];
      newTokens.forEach(token => {
        if (!updatedTokens.some(t => t.id === token.id)) {
          updatedTokens.push(token);
        }
      });
      return updatedTokens;
    });
  };

  const handleCryptoChange = async (value: string) => {
    setLastEditedField('crypto');
    setCryptoAmount(value);
    if (!value) {
      setFiatAmount('');
      return;
    }
    
    try {
      const coinId = getCoinId(cryptoCurrency);
      if (!coinId) {
        setFiatAmount('Invalid token');
        return;
      }

      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: coinId,
          vs_currencies: fiatCurrency.toLowerCase(),
          x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
        },
      });

      if (!response.data[coinId] || !response.data[coinId][fiatCurrency.toLowerCase()]) {
        setFiatAmount('Price not available');
        return;
      }

      const rate = response.data[coinId][fiatCurrency.toLowerCase()];
      const result = Number(value) * rate;
      setFiatAmount(formatFiatAmount(result));
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
      const coinId = getCoinId(cryptoCurrency);
      if (!coinId) {
        setCryptoAmount('Invalid token');
        return;
      }

      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: coinId,
          vs_currencies: fiatCurrency.toLowerCase(),
          x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
        },
      });

      if (!response.data[coinId] || !response.data[coinId][fiatCurrency.toLowerCase()]) {
        setCryptoAmount('Price not available');
        return;
      }

      const rate = response.data[coinId][fiatCurrency.toLowerCase()];
      const result = Number(value) / rate;
      setCryptoAmount(formatCryptoAmount(result));
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

  const getCoinId = (currency: string): string => {
    const token = allTokens.find(t => t.symbol === currency);
    return token ? token.id : currency.toLowerCase();
  };

  const formatFiatAmount = (amount: number): string => {
    if (amount === 0) return '0';
    if (amount < 0.00001) return amount.toExponential(2);
    if (amount < 0.0001) return amount.toFixed(8);
    if (amount < 0.01) return amount.toFixed(6);
    if (amount < 1) return amount.toFixed(4);
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).replace(/,/g, '');
  };

  const formatCryptoAmount = (amount: number): string => {
    if (amount === 0) return '0';
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    }).replace(/,/g, '');
  };

  useEffect(() => {
    if (cryptoAmount && cryptoAmount !== 'Error' && cryptoAmount !== 'Invalid token' && cryptoAmount !== 'Price not available') {
      const debounceTimer = setTimeout(() => {
        handleCryptoChange(cryptoAmount);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [cryptoCurrency, fiatCurrency]);

  useEffect(() => {
    if (fiatAmount && fiatAmount !== 'Error' && fiatAmount !== 'Invalid token' && fiatAmount !== 'Price not available') {
      const debounceTimer = setTimeout(() => {
        handleFiatChange(fiatAmount);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [cryptoCurrency, fiatCurrency]);

  const handleDeleteToken = (tokenId: string) => {
    setCustomTokens(prev => prev.filter(token => token.id !== tokenId));
  };

  return (
    <Container>
      <Title>Crypto Converter</Title>
      
      <LivePriceFeed 
        cryptocurrency={cryptoCurrency} 
        customTokens={customTokens}
      />
      
      <InputGroup>
        <Input
          type="number"
          value={cryptoAmount}
          onChange={(e) => handleCryptoChange(e.target.value)}
          placeholder="Enter crypto amount"
          aria-label="Crypto amount"
          step="any"
        />
        <SelectWrapper>
          <Select
            value={cryptoCurrency}
            onChange={(e) => {
              setCryptoCurrency(e.target.value);
              setCryptoAmount('');
              setFiatAmount('');
            }}
            aria-label="Select cryptocurrency"
          >
            <optgroup label="Default Tokens">
              {DEFAULT_TOKENS.map((token) => (
                <option key={token.id} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </optgroup>
            {customTokens.length > 0 && (
              <optgroup label="Custom Tokens">
                {customTokens.map((token) => (
                  <option key={token.id} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
          <AddTokenButton onClick={() => setShowTokenSearch(true)}>+</AddTokenButton>
        </SelectWrapper>
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
          onChange={(e) => {
            setFiatCurrency(e.target.value);
            setCryptoAmount('');
            setFiatAmount('');
          }}
          aria-label="Select fiat currency"
        >
          {FIAT_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
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

      {showTokenSearch && (
        <TokenSearch
          onClose={() => setShowTokenSearch(false)}
          onAddTokens={handleAddTokens}
          existingTokens={allTokens.map(t => t.symbol)}
          customTokens={customTokens}
          onDeleteToken={handleDeleteToken}
        />
      )}
    </Container>
  );
};

export default CurrencyConverter;
