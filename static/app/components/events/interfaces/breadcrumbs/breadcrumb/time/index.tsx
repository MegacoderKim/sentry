import {memo} from 'react';
import styled from '@emotion/styled';

import Highlight from 'sentry/components/highlight';
import Tooltip from 'sentry/components/tooltip';
import {defined} from 'sentry/utils';
import getDynamicText from 'sentry/utils/getDynamicText';

import {getFormattedTimestamp} from './utils';

type Props = {
  searchTerm: string;
  timestamp?: string;
  relativeTime?: string;
  displayRelativeTime?: boolean;
};

const Time = memo(function Time({
  timestamp,
  relativeTime,
  displayRelativeTime,
  searchTerm,
}: Props) {
  if (!(defined(timestamp) && defined(relativeTime))) {
    return <div />;
  }

  const {date, time, displayTime} = getFormattedTimestamp(
    timestamp,
    relativeTime,
    displayRelativeTime
  );

  return (
    <Wrapper>
      <Tooltip
        title={
          <div>
            <div>{date}</div>
            {time !== '\u2014' && <div>{time}</div>}
          </div>
        }
        containerDisplayMode="inline-flex"
        disableForVisualTest
      >
        {getDynamicText({
          value: <Highlight text={searchTerm}>{displayTime}</Highlight>,
          fixed: '00:00:00',
        })}
      </Tooltip>
    </Wrapper>
  );
});

export default Time;

const Wrapper = styled('div')`
  font-size: ${p => p.theme.fontSizeSmall};
  color: ${p => p.theme.textColor};
`;
