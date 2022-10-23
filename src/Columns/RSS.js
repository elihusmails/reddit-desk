import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import Parser from "rss-parser";
import { DebounceInput } from "react-debounce-input";
import ReactTooltip from "react-tooltip";

import VideoIcon from "../VideoIcon";
import ImageIcon from "../ImageIcon";

const fade = keyframes`
  0% {
    opacity: 100%;
  }
  100% {
    opacity: 0%;
  }
`;

const shrinkWidth = keyframes`
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
`;

const FlashOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${(props) => props.color};
  animation: ${fade} ${(props) => props.speed}ms linear 1;
  animation-fill-mode: forwards;
`;

const RelativeWrapper = styled.div`
  position: relative;
`;

const Padding = styled.div`
  padding: 24px 8px;
`;

const Header = styled.div`
  position: relative;
  background: #2a334d;
  padding: 12px 8px;
  color: white;
  font-size: 12px;
  text-align: center;
  width: 100%;
`;

const EditPanel = styled.div`
  margin-top: 16px;
  width: 100%;
`;

const TimeoutBar = styled.div`
  background: white;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  opacity: 0.25;
  animation: ${shrinkWidth} ${(props) => props.timeout}ms ease 1;
  animation-fill-mode: forwards;
`;

const HeaderInput = styled(DebounceInput)`
  background: transparent;
  border: none;
  font-size: 12px;
  color: #fff;
  height: 14px;
  width: ${(props) => props.width || "100"}px;
  border-bottom: 1px solid #fff;
`;

const Pillar = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #0b0f1c;
  color: white;
  flex: 1 1 0;
  overflow: hidden;
`;

const ScrollView = styled.div`
  position: relative;
  flex: 1 1 0;
  overflow-y: auto;
`;

const Link = styled.a`
  text-decoration: none;
  color: inherit;
  cursor: pointer;
`;

const Thumbnail = styled.img`
  max-width: 500px;
  max-height: 350px;
`;

const TooltipSelfText = styled.div`
  max-width: 500px;
  max-height: 350px;
  overflow-y: scroll;
  text-align: left;

  a {
    color: #12b4ff;
  }
`;

const SubmissionWrapper = styled.div`
  position: relative;

  &:nth-child(odd) {
    background: #0c1a3e;
  }
`;

const SubmissionIcon = styled.span`
  fill: #ffb500;
  margin-right: 6px;
`;

const Title = styled.h3`
  font-size: 16px;
  color: #12b4ff;
`;

const Score = styled.span`
  font-size: 18px;
  color: #10d4ab;
  margin-right: 12px;
`;

const Ratio = styled.span`
  font-size: 18px;
  color: #9210d4;
  margin-right: 12px;
`;

const Time = styled.span`
  font-size: 18px;
  color: #5079d6;
  margin-right: 12px;
`;

const Flair = styled.span`
  background: #2f3a55;
  padding: 4px 6px;
  border-radius: 5px;
  /* white-space: nowrap; */
  margin-right: 6px;

  &:last-child {
    margin: 0;
  }
`;

const formatNumber = (num) =>
  num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

const contentTypeIcon = {
  image: <ImageIcon />,
  "hosted:video": <VideoIcon />
};

const Submission = ({ title, permalink, time, onNavigate }) => {
  // const [overlay, setOverlay] = useState(null);
  // const flashSpeed = 500;

  // useEffect(() => {
  //   if (scoreRef.current !== score) {
  //     setOverlay(
  //       <FlashOverlay
  //         speed={flashSpeed}
  //         color={scoreRef.current < score ? "#10d4ab" : "#ED2F60"}
  //       />
  //     );
  //   }

  //   setTimeout(() => setOverlay(null), flashSpeed);
  // }, [score]);

  return (
    <SubmissionWrapper>
      {/* {overlay} */}
      <Padding>
        <Title>
          <Link onClick={() => onNavigate(permalink)}>{title}</Link>
        </Title>
        <Time>{window.timeAgo.format(new Date(time).getTime())}</Time>
      </Padding>
    </SubmissionWrapper>
  );
};

const randomJitter = (range) => {
  const min = Math.ceil(0);
  const max = Math.floor(range);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

let parser = new Parser();

const parseFields = (entry, fields) => {
  const newFields = {};

  for (const [key, value] of Object.entries(fields)) {
    newFields[key] = entry[value];
  }

  return {
    ...entry,
    ...newFields
  };
};

export const RSSColumn = ({
  source,
  name,
  fields,
  setColumnData,
  delColumn,
  onNavigate
}) => {
  const [loading, setLoading] = useState(true);
  const [Children, setChildren] = useState(<span>Loading...</span>);
  const [editing, setEditing] = useState(false);
  const reloadInterval = useRef(0);
  const interval = useRef();

  const toggleEditing = useCallback(
    () => setEditing((editing) => !editing),
    []
  );

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        reloadInterval.current = 60000;
        let feed = await parser.parseURL(source);
        console.log(feed.title, feed.items);

        setChildren(
          feed.items.map((s) => (
            <Submission
              key={s.link}
              title={s.title}
              permalink={s.link}
              time={s.pubDate}
              {...parseFields(s, fields)}
              onNavigate={onNavigate}
            />
          ))
        );
        setLoading(false);

        if (!interval.current) {
          interval.current = setInterval(fetchPosts, reloadInterval.current);
        }
      } catch (err) {
        // throw new Error("ERROR GO BRRRRRRRRRRRR");
      }
    }

    // if (reddit !== null) {
    //   fetchPosts();
    // }

    fetchPosts().catch((err) => {
      throw err;
    });

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [source, onNavigate, fields]);
  return (
    <Pillar>
      <RelativeWrapper speed={reloadInterval.current}>
        <Header>
          Viewing <b>RSS</b> from <b>{name}</b>
          <Link onClick={toggleEditing}>[edit]</Link>
          {/* {editing ? (
            <EditPanel>
              <HeaderInput
                width="100%"
                minLength={3}
                debounceTimeout={300}
                value={sub}
                onChange={(e) => setColumnData({ sub: e.target.value })}
              />
              <HeaderInput
                width="100%"
                minLength={3}
                debounceTimeout={300}
                value={filter}
                onChange={(e) => setColumnData({ filter: e.target.value })}
              />
              <Link onClick={delColumn}>[delete column]</Link>
            </EditPanel>
          ) : null} */}
        </Header>
        {!loading && <TimeoutBar timeout={reloadInterval.current} />}
      </RelativeWrapper>
      <ScrollView>{Children}</ScrollView>
    </Pillar>
  );
};
