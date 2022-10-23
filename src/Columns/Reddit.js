import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import snoowrap from "snoowrap";
import { DebounceInput } from "react-debounce-input";
import ReactTooltip from "react-tooltip";

import { useStockTicker } from "../StockTicker";
import VideoIcon from "../VideoIcon";
import ImageIcon from "../ImageIcon";

const refreshMultiplier = 2;

const tickerBlacklist = ["STONK"];

const parseTickers = (str) => {
  const matches = Array.from(str.matchAll(/(?<=\$)[A-Za-z]*/g), (s) => [
    s[0],
    s.input
  ])
    .filter((s) => Boolean(s[0]))
    .filter((s) => !tickerBlacklist.includes(s[0]));
  return matches;
};

const fade = keyframes`
  0% {
    opacity: 50%;
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

const Submission = ({
  title,
  score,
  ratio,
  image,
  permalink,
  flair = [],
  time,
  id,
  contentType,
  selftextHtml,
  onNavigate
}) => {
  const parsedSymbols = useRef(false);
  const scoreRef = useRef(score);
  const [overlay, setOverlay] = useState(null);
  const flashSpeed = 500;
  const { addSymbol } = useStockTicker();
  const upvoteRatio = useMemo(() => {
    // console.log(score, ratio);
    // const totalUpvotes = Math.floor((score * 100) / (ratio * 100));
    // const totalDownvotes = Math.floor(totalUpvotes * (1 - ratio));
    // const f = new Fraction(totalUpvotes, totalDownvotes);
    // return `${f.numerator}:${f.denominator} ${totalUpvotes} ${totalDownvotes}`;
    return `${Math.floor(ratio * 100)}%`;
  }, [ratio]);

  useEffect(() => {
    if (scoreRef.current !== score) {
      setOverlay(
        <FlashOverlay
          speed={flashSpeed}
          color={scoreRef.current < score ? "#10d4ab" : "#ED2F60"}
        />
      );
    }

    setTimeout(() => setOverlay(null), flashSpeed);
  }, [score]);

  useEffect(() => {
    if (parsedSymbols.current === false) {
      const tickers = parseTickers(title);
      tickers.map((t) => addSymbol(t[0]));
      parsedSymbols.current = true;
    }
  }, [title, addSymbol]);

  return (
    <SubmissionWrapper>
      {overlay}
      <Padding>
        <Title>
          <Link
            onClick={() => onNavigate(`https://old.reddit.com${permalink}`)}
            data-tip
            data-for={id}
          >
            {title}
          </Link>
        </Title>
        <SubmissionIcon>{contentTypeIcon[contentType]}</SubmissionIcon>{" "}
        <Time>{window.timeAgo.format(time * 1000)}</Time>
        <Score>{formatNumber(score)}</Score>
        <Ratio>{upvoteRatio}</Ratio>
        {flair.map((f) => (
          <Flair>{f.t}</Flair>
        ))}
        {/* <br />
        <Link onClick={onSave}>{saved ? "unsave" : "save"}</Link> */}
        {image || selftextHtml ? (
          <ReactTooltip
            id={id}
            aria-haspopup="true"
            effect="solid"
            delayHide={100}
            delayShow={50}
            delayUpdate={500}
            backgroundColor="#000"
          >
            {image && (
              <Thumbnail
                src={
                  image.resolutions[Math.min(image.resolutions.length - 1, 3)]
                    .url
                }
              />
            )}
            {selftextHtml && (
              <TooltipSelfText
                dangerouslySetInnerHTML={{ __html: selftextHtml }}
              />
            )}
          </ReactTooltip>
        ) : null}
      </Padding>
    </SubmissionWrapper>
  );
};

const randomJitter = (range) => {
  const min = Math.ceil(0);
  const max = Math.floor(range);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const RedditColumn = ({
  sub,
  filter,
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

  const reddit = useMemo(() => {
    return new snoowrap({
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
      clientId: "mh7mdzhTLvpoIg",
      clientSecret: "ZuTSTUhT_C3PXsrPdfvr34BNQ8sleQ",
      refreshToken: "252295257841-Mg2bOoJJGnJwnMWzcifaiVXLSnhAiA"
    });
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      // console.log("Fetching posts", sub, filter);
      setLoading(true);
      let submissions;
      switch (filter) {
        case "hot":
          submissions = await reddit.getSubreddit(sub).getHot();
          reloadInterval.current = 60000 * 5 * refreshMultiplier;
          break;
        case "rising":
          submissions = await reddit.getSubreddit(sub).getRising();
          reloadInterval.current = 60000 * refreshMultiplier;
          break;
        case "new":
          submissions = await reddit.getSubreddit(sub).getNew();
          reloadInterval.current =
            5000 * refreshMultiplier + randomJitter(2000);
          break;
        default:
          break;
      }

      // submissions.forEach((s) => console.log(JSON.stringify(s, null, 2)));

      setChildren(
        submissions.map((s) => (
          <Submission
            key={s.id}
            title={s.title}
            score={s.score}
            ratio={s.upvote_ratio}
            thumbnail={s.thumbnail}
            image={s.thumbnail !== "self" && s.preview && s.preview.images[0]}
            permalink={s.permalink}
            url={s.url}
            flair={s.link_flair_richtext}
            time={s.created_utc}
            contentType={s.post_hint}
            id={s.id}
            selftextHtml={s.selftext_html}
            saved={s.saved}
            onSave={() => {
              if (s.saved) s.unsave();
              else s.save();
              fetchPosts();
            }}
            onNavigate={onNavigate}
          />
        ))
      );
      setLoading(false);

      if (!interval.current) {
        interval.current = setInterval(fetchPosts, reloadInterval.current);
      }
    }

    if (reddit !== null) {
      fetchPosts();
    }

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [reddit, sub, filter, onNavigate]);
  return (
    <Pillar>
      <RelativeWrapper speed={reloadInterval.current}>
        <Header>
          Viewing <b>{sub}</b> by <b>{filter}</b>
          <Link onClick={toggleEditing}>[edit]</Link>
          {editing ? (
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
          ) : null}
        </Header>
        {!loading && <TimeoutBar timeout={reloadInterval.current} />}
      </RelativeWrapper>
      <ScrollView>{Children}</ScrollView>
    </Pillar>
  );
};
