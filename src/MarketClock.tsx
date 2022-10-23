import { FC, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  zonedTimeToUtc,
  utcToZonedTime,
  format,
  getTimezoneOffset
} from "date-fns-tz";
import {
  addDays,
  setHours,
  setMinutes,
  addMilliseconds,
  setSeconds,
  compareAsc,
  compareDesc,
  differenceInMilliseconds,
  isWeekend
} from "date-fns";

const ClockWrapper = styled.span``;

const MarketWrapper = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 99;
  background: black;
  color: white;
  font-size: 14px;
`;

const holidays = {
  year: 2021,
  "New Years Day": "2021-01-04",
  "Martin Luther King, Jr. Day": "2021-01-21",
  "Washington's Birthday": "2021-02-18",
  "Good Friday": "2021-04-05",
  "Memorial Day": "2021-06-03",
  "Independence Day": "2021-07-08",
  "Labor Day": "2021-09-09",
  "Thanksgiving Day": "2021-11-28",
  Christmas: "2021-12-27"
};

export const Clock = () => {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <ClockWrapper>{time}</ClockWrapper>;
};

export const MarketOpenTimer = () => {};

function msToTime(duration: number) {
  const milliseconds = Math.abs((duration % 1000) / 100),
    seconds = Math.abs(Math.floor((duration / 1000) % 60)),
    minutes = Math.abs(Math.floor((duration / (1000 * 60)) % 60)),
    hours = Math.abs(Math.floor(duration / (1000 * 60 * 60)));

  return { hours, minutes, seconds, milliseconds };
}

const localizeEST = (d: Date) => zonedTimeToUtc(d, "America/New_York");

interface Time {
  est: Date;
  local: Date;
}

interface MarketHours {
  open: Time;
  close: Time;
}

const marketHours = (now: Date = new Date()): MarketHours => {
  const est = utcToZonedTime(now, "America/New_York");
  const open = setSeconds(setMinutes(setHours(est, 9), 30), 0);
  const close = setSeconds(setMinutes(setHours(est, 16), 0), 0);
  return {
    open: { est: open, local: localizeEST(open) },
    close: { est: close, local: localizeEST(close) }
  };
};

const marketIsOpen = (): boolean => {
  const now = new Date();
  const market = marketHours();
  return (
    compareAsc(now, market.open.local) > 0 &&
    compareDesc(now, market.close.local) > 0
  );
};

const nextOpenHours = (d: Date = new Date()): MarketHours => {
  const tomorrow = addDays(d, 1);
  const market = marketHours();

  const isHoliday = (i: Date) => {
    // TODO: factor in floating holidays
    // console.log(i.getDate());
    return false;
  };

  if (isWeekend(tomorrow) || isHoliday(tomorrow)) {
    return nextOpenHours(addDays(d, 1));
  }

  return marketHours(tomorrow);
};

export const MarketCloseTimer: FC = () => {
  const [time, setTime] = useState(null);
  const market = marketHours();
  const nextMarket = nextOpenHours();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const marketCloseTimer = useMemo(
    () =>
      msToTime(
        differenceInMilliseconds(new Date(), addDays(market.close.local, 0))
      ),
    [time]
  );

  const formatCountdown = (c) => `${c.hours}:${c.minutes}:${c.seconds}`;

  const marketOpenTimer = useMemo(
    () => msToTime(differenceInMilliseconds(nextMarket.open.local, new Date())),
    [time]
  );

  return (
    <MarketWrapper>
      Mark is {marketIsOpen() ? "open" : "closed"}.{" "}
      {marketIsOpen()
        ? `Closing in ${formatCountdown(marketCloseTimer)}`
        : `Opening in ${formatCountdown(marketOpenTimer)}`}
    </MarketWrapper>
  );
};
