import * as React from 'react';
import classnames from 'classnames';

type Props = {
  underlined?: boolean;
  className?: string;
};

type NavProps = Omit<React.HTMLProps<HTMLUListElement>, keyof Props> & Props;

function NavTabs({underlined, className, ...tabProps}: NavProps) {
  const mergedClassName = classnames('nav nav-tabs', className, {
    'border-bottom': underlined,
  });

  return <ul className={mergedClassName} {...tabProps} />;
}

export default NavTabs;
