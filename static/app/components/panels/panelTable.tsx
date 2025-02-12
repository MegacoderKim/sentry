import * as React from 'react';
import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';

import EmptyStateWarning from 'sentry/components/emptyStateWarning';
import LoadingIndicator from 'sentry/components/loadingIndicator';
import {t} from 'sentry/locale';
import space from 'sentry/styles/space';

import Panel from './panel';

type Props = {
  /**
   * Headers of the table.
   */
  headers: React.ReactNode[];

  /**
   * The body of the table. Make sure the number of children elements are
   * multiples of the length of headers.
   */
  children?: React.ReactNode | (() => React.ReactNode);

  /**
   * If this is true, then display a loading indicator
   */
  isLoading?: boolean;

  /**
   * Displays an `<EmptyStateWarning>` if true
   */
  isEmpty?: boolean;

  /**
   * Message to use for `<EmptyStateWarning>`
   */
  emptyMessage?: React.ReactNode;
  /**
   * Action to display when isEmpty is true
   */
  emptyAction?: React.ReactNode;

  /**
   * Renders without predefined padding on the header and body cells
   */
  disablePadding?: boolean;

  className?: string;

  /**
   * A custom loading indicator.
   */
  loader?: React.ReactNode;
};

/**
 * Bare bones table generates a CSS grid template based on the content.
 *
 * The number of children elements should be a multiple of `this.props.columns` to have
 * it look ok.
 *
 *
 * Potential customizations:
 * - [ ] Add borders for columns to make them more like cells
 * - [ ] Add prop to disable borders for rows
 * - [ ] We may need to wrap `children` with our own component (similar to what we're doing
 *       with `headers`. Then we can get rid of that gross `> *` selector
 * - [ ] Allow customization of wrappers (Header and body cells if added)
 */
const PanelTable = ({
  headers,
  children,
  isLoading,
  isEmpty,
  disablePadding,
  className,
  emptyMessage = t('There are no items to display'),
  emptyAction,
  loader,
  ...props
}: Props) => {
  const shouldShowLoading = isLoading === true;
  const shouldShowEmptyMessage = !shouldShowLoading && isEmpty;
  const shouldShowContent = !shouldShowLoading && !shouldShowEmptyMessage;

  return (
    <Wrapper
      columns={headers.length}
      disablePadding={disablePadding}
      className={className}
      hasRows={shouldShowContent}
      {...props}
    >
      {headers.map((header, i) => (
        <PanelTableHeader key={i}>{header}</PanelTableHeader>
      ))}

      {shouldShowLoading && (
        <LoadingWrapper>{loader || <LoadingIndicator />}</LoadingWrapper>
      )}

      {shouldShowEmptyMessage && (
        <TableEmptyStateWarning>
          <p>{emptyMessage}</p>
          {emptyAction}
        </TableEmptyStateWarning>
      )}

      {shouldShowContent && getContent(children)}
    </Wrapper>
  );
};

function getContent(children: Props['children']) {
  if (typeof children === 'function') {
    return children();
  }

  return children;
}

type WrapperProps = {
  /**
   * The number of columns the table will have, this is derived from the headers list
   */
  columns: number;
  hasRows: boolean;
  disablePadding: Props['disablePadding'];
};

const LoadingWrapper = styled('div')``;

const TableEmptyStateWarning = styled(EmptyStateWarning)``;

const Wrapper = styled(Panel, {
  shouldForwardProp: p => typeof p === 'string' && isPropValid(p) && p !== 'columns',
})<WrapperProps>`
  display: grid;
  grid-template-columns: repeat(${p => p.columns}, auto);

  > * {
    ${p => (p.disablePadding ? '' : `padding: ${space(2)};`)}

    &:nth-last-child(n + ${p => (p.hasRows ? p.columns + 1 : 0)}) {
      border-bottom: 1px solid ${p => p.theme.border};
    }
  }

  > ${/* sc-selector */ TableEmptyStateWarning}, > ${/* sc-selector */ LoadingWrapper} {
    border: none;
    grid-column: auto / span ${p => p.columns};
  }

  /* safari needs an overflow value or the contents will spill out */
  overflow: auto;
`;

export const PanelTableHeader = styled('div')`
  color: ${p => p.theme.subText};
  font-size: ${p => p.theme.fontSizeSmall};
  font-weight: 600;
  text-transform: uppercase;
  border-radius: ${p => p.theme.borderRadius} ${p => p.theme.borderRadius} 0 0;
  background: ${p => p.theme.backgroundSecondary};
  line-height: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 45px;
`;

export default PanelTable;
