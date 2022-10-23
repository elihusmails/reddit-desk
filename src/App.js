import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useHotkeys } from "react-hotkeys-hook";

// import { Fraction } from "./fractional";
import { StockTicker, StockTickerProvider } from "./StockTicker";
import { ConsoleProvider } from "./Console";
import { RedditColumn, RSSColumn } from "./Columns";
import { ErrorBoundary } from "./ErrorBoundary";
import { Window } from "./Window";
import Logo from "./Logo";

import { MarketCloseTimer } from "./MarketClock";

const ls = window.localStorage;

TimeAgo.addDefaultLocale(en);

// Create formatter (English).
window.timeAgo = new TimeAgo();

const sourceColumns = {
  reddit: (props) => <RedditColumn {...props} />,
  rss: (props) => <RSSColumn {...props} />
};

const LogoFloat = styled.div`
  position: absolute;
  z-index: 99;
  top: 8px;
  left: 8px;
`;

const IFrame = styled.iframe`
  flex: 1 1 0;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
`;

const AddColumnWrapper = styled.div`
  width: 20px;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  user-select: none;
  cursor: pointer;
  transition: background 0.15s linear;

  &:hover {
    background: gray;
  }
`;

const AddColumn = (props) => {
  return <AddColumnWrapper {...props}>+</AddColumnWrapper>;
};

const saveColumns = (cols) => ls.setItem("columns", JSON.stringify(cols));
const loadColumns = () => {
  const cols = ls.getItem("columns");
  if (cols) {
    return JSON.parse(cols);
  }
  return [
    {
      id: uuid(),
      source: "reddit",
      data: { sub: "wallstreetbets", filter: "hot" }
    },
    {
      id: uuid(),
      source: "reddit",
      data: { sub: "wallstreetbets", filter: "rising" }
    },
    {
      id: uuid(),
      source: "reddit",
      data: { sub: "wallstreetbets", filter: "new" }
    },
    {
      id: uuid(),
      source: "reddit",
      data: { sub: "smallstreetbets", filter: "hot" }
    },
    {
      id: uuid(),
      source: "reddit",
      data: { sub: "smallstreetbets", filter: "rising" }
    },
    {
      id: uuid(),
      source: "reddit",
      data: { sub: "smallstreetbets", filter: "new" }
    }
  ];
};

export default function App() {
  const [columns, setColumns] = useState(loadColumns);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState("https://google.com");
  const toggleModal = useCallback(() => setModalOpen((o) => !o), []);

  useHotkeys("ctrl+`", toggleModal, { filterPreventDefault: true });

  const setColumnData = useCallback(
    (id) => (data) => {
      setColumns(
        columns.map((s) =>
          s.id === id ? { ...s, data: { ...s.data, ...data } } : s
        )
      );
    },
    [columns]
  );

  const delColumn = useCallback(
    (id) => () => {
      setColumns(columns.filter((s) => s.id !== id));
    },
    [columns]
  );

  const addColumn = useCallback(() => {
    setColumns(
      columns.concat({
        id: uuid(),
        source: "reddit",
        data: { sub: "wallstreetbets", filter: "rising" }
      })
    );
  }, [columns]);

  // save columns to localStorage on every change
  useEffect(() => saveColumns(columns), [columns]);

  return (
    <ConsoleProvider>
      <StockTickerProvider>
        <PageWrapper>
          <StockTicker />
          <MarketCloseTimer />
          <ColumnWrapper>
            <LogoFloat>
              <Logo size={24} />
            </LogoFloat>
            {columns.map((c) => {
              const Column = sourceColumns[c.source];
              return (
                <ErrorBoundary key={c.id}>
                  <Column
                    key={c.id}
                    {...c.data}
                    setColumnData={setColumnData(c.id)}
                    delColumn={delColumn(c.id)}
                    onNavigate={(url) => {
                      setModalOpen(true);
                      setModalUrl(url);
                    }}
                  />
                </ErrorBoundary>
              );
            })}
            <AddColumn onClick={addColumn} />
            <Window
              title="Browser"
              initWidth={800}
              initHeight="80vh"
              onFocus={() => console.log("Modal is clicked")}
              onClose={() => setModalOpen(false)}
              isOpen={modalOpen}
            >
              <IFrame
                src={modalUrl}
                title="Modal Browser"
                width="100%"
                height="300"
              />
            </Window>
          </ColumnWrapper>
        </PageWrapper>
      </StockTickerProvider>
    </ConsoleProvider>
  );
}
