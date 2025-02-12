import styled from '@emotion/styled';

import overflowEllipsis from 'sentry/styles/overflowEllipsis';
import space from 'sentry/styles/space';

const Grid = styled('div')`
  font-size: ${p => p.theme.fontSizeSmall};
  display: grid;
  gap: ${space(1)};
  align-items: center;
  grid-template-columns: 30px 2.5fr 4fr 0fr 40px;
  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    grid-template-columns: 40px 2.5fr 3.5fr 105px 40px;
  }
`;

const GridCell = styled('div')`
  ${overflowEllipsis};
`;

export {Grid, GridCell};
