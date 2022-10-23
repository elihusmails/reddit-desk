import { createContext, useCallback, useContext, useState } from "react";
import styled from "styled-components";
import Marquee, { Motion, randomIntFromInterval } from "react-marquee-slider";
import { useConsole } from "../Console";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 25px;
  font-size: 14px;
  color: white;
`;

const Item = styled.span`
  display: inline-block;
  margin-top: 4px;
  margin-right: 100px;
`;

const Price = styled.span`
  color: ${(props) => (props.direction === "up" ? "#10d4ab" : "#d41010")};
`;

const items = ["foo", "bar", "baz"];

export const StockTickerContext = createContext({
  addSymbol: () => null,
  symbols: []
});

const finnhub = (path) =>
  `https://finnhub.io/api/v1${path}&token=c0re76n48v6s1d39f0bg`;

const percentageChanged = (a, b) => {
  const decreaseValue = a - b;
  return ((decreaseValue / a) * 100).toFixed(2);
};

export const StockTickerProvider = ({ children }) => {
  const [symbols, setSymbols] = useState([]);
  const { consolePush } = useConsole();
  const addSymbol = useCallback(async (symbol) => {
    symbol = symbol.toUpperCase();
    if (!symbols.find((s) => s.symbol === symbol)) {
      const response = await fetch(finnhub(`/quote?symbol=${symbol}`));
      const quote = await response.json();

      consolePush(quote);

      setSymbols((symbols) =>
        symbols.find((s) => s.symbol === symbol)
          ? symbols
          : [...symbols, { symbol, quote }]
      );
    }
  }, []);
  console.log(symbols);
  return (
    <StockTickerContext.Provider value={{ addSymbol, symbols }}>
      {children}
    </StockTickerContext.Provider>
  );
};

export const useStockTicker = () => {
  const context = useContext(StockTickerContext);
  return context;
};

export const StockTicker = () => {
  const { symbols } = useStockTicker();
  return (
    <Wrapper>
      <Marquee velocity={15}>
        {[...symbols].map((item) => (
          <Item key={item.symbol}>
            {item.symbol}{" "}
            <Price direction={item.quote.c > item.quote.o ? "up" : "down"}>
              {-percentageChanged(item.quote.o, item.quote.c)}% [${item.quote.c}
              ]
            </Price>
          </Item>
        ))}
      </Marquee>
    </Wrapper>
  );
};
