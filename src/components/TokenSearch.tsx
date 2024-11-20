import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const SearchContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.background};
  padding: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const SearchInput = styled.input`
  background: ${props => props.theme.inputBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  color: ${props => props.theme.text};
  padding: 12px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 15px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const ResultsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const TokenItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.selected ? props.theme.primary + '20' : 'transparent'};
  margin-bottom: 8px;

  &:hover {
    background: ${props => props.theme.primary + '10'};
  }
`;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 12px;
`;

const TokenInfo = styled.div`
  flex: 1;
`;

const TokenSymbol = styled.div`
  color: ${props => props.theme.text};
  font-weight: 600;
`;

const TokenName = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
`;

const AddButton = styled.button`
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryLight};
  }
`;

const ExistingTokensSection = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.border};
  padding-bottom: 15px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 10px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.error};
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

interface TokenSearchProps {
  onClose: () => void;
  onAddTokens: (tokens: Token[]) => void;
  existingTokens: string[];
  customTokens: Token[];
  onDeleteToken: (tokenId: string) => void;
}

const TokenSearch: React.FC<TokenSearchProps> = ({ 
  onClose, 
  onAddTokens, 
  existingTokens,
  customTokens,
  onDeleteToken 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchTokens = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/search',
          {
            params: {
              query: searchQuery,
              x_cg_demo_api_key: import.meta.env.VITE_COINGECKO_API_KEY,
            }
          }
        );

        const tokens = response.data.coins
          .filter((coin: any) => !existingTokens.includes(coin.symbol.toUpperCase()))
          .map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            image: coin.thumb,
          }));

        setSearchResults(tokens);
      } catch (error) {
        console.error('Error searching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchTokens, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, existingTokens]);

  const handleTokenClick = (token: Token) => {
    setSelectedTokens(prev => {
      const isSelected = prev.some(t => t.id === token.id);
      if (isSelected) {
        return prev.filter(t => t.id !== token.id);
      } else {
        return [...prev, token];
      }
    });
  };

  const handleAddTokens = () => {
    onAddTokens(selectedTokens);
    onClose();
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <BackButton onClick={onClose}>←</BackButton>
        <SearchInput
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for tokens..."
          autoFocus
        />
      </SearchHeader>

      {customTokens.length > 0 && (
        <ExistingTokensSection>
          <SectionTitle>Your Custom Tokens</SectionTitle>
          {customTokens.map((token) => (
            <TokenItem key={token.id} selected={false}>
              <TokenIcon src={token.image} alt={token.name} />
              <TokenInfo>
                <TokenSymbol>{token.symbol}</TokenSymbol>
                <TokenName>{token.name}</TokenName>
              </TokenInfo>
              <DeleteButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteToken(token.id);
                }}
              >
                🗑️
              </DeleteButton>
            </TokenItem>
          ))}
        </ExistingTokensSection>
      )}

      <ResultsList>
        {isLoading ? (
          <div>Searching...</div>
        ) : searchResults.length > 0 ? (
          <>
            <SectionTitle>Search Results</SectionTitle>
            {searchResults.map(token => (
              <TokenItem
                key={token.id}
                selected={selectedTokens.some(t => t.id === token.id)}
                onClick={() => handleTokenClick(token)}
              >
                <TokenIcon src={token.image} alt={token.name} />
                <TokenInfo>
                  <TokenSymbol>{token.symbol}</TokenSymbol>
                  <TokenName>{token.name}</TokenName>
                </TokenInfo>
              </TokenItem>
            ))}
          </>
        ) : searchQuery && (
          <div>No results found</div>
        )}
      </ResultsList>

      <AddButton
        onClick={handleAddTokens}
        disabled={selectedTokens.length === 0}
      >
        Add {selectedTokens.length} Token{selectedTokens.length !== 1 ? 's' : ''}
      </AddButton>
    </SearchContainer>
  );
};

export default TokenSearch;
