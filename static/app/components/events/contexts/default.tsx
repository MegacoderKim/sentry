import * as React from 'react';

import ContextBlock from 'sentry/components/events/contexts/contextBlock';
import {Event} from 'sentry/types/event';

type Props = {
  data: Record<string, React.ReactNode | undefined>;
  alias: string;
  event: Event;
};

function getKnownData(data: Props['data']) {
  return Object.entries(data)
    .filter(([k]) => k !== 'type' && k !== 'title')
    .map(([key, value]) => ({
      key,
      subject: key,
      value,
    }));
}

const DefaultContextType = ({data}: Props) => <ContextBlock data={getKnownData(data)} />;

export default DefaultContextType;
