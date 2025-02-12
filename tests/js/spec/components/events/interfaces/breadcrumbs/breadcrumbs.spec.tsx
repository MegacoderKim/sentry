import {initializeOrg} from 'sentry-test/initializeOrg';
import {mountWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';
import {textWithMarkupMatcher} from 'sentry-test/utils';

import Breadcrumbs from 'sentry/components/events/interfaces/breadcrumbs';
import {BreadcrumbLevelType, BreadcrumbType} from 'sentry/types/breadcrumbs';
import {EntryType} from 'sentry/types/event';

describe('Breadcrumbs', () => {
  let props: React.ComponentProps<typeof Breadcrumbs>;
  const {router} = initializeOrg();

  beforeEach(() => {
    props = {
      route: {},
      router,
      organization: TestStubs.Organization(),
      event: TestStubs.Event({entries: []}),
      type: EntryType.BREADCRUMBS,
      data: {
        values: [
          {
            message: 'sup',
            category: 'default',
            level: BreadcrumbLevelType.WARNING,
            type: BreadcrumbType.INFO,
          },
          {
            message: 'hey',
            category: 'error',
            level: BreadcrumbLevelType.INFO,
            type: BreadcrumbType.INFO,
          },
          {
            message: 'hello',
            category: 'default',
            level: BreadcrumbLevelType.WARNING,
            type: BreadcrumbType.INFO,
          },
          {
            message: 'bye',
            category: 'default',
            level: BreadcrumbLevelType.WARNING,
            type: BreadcrumbType.INFO,
          },
          {
            message: 'ok',
            category: 'error',
            level: BreadcrumbLevelType.WARNING,
            type: BreadcrumbType.INFO,
          },
          {
            message: 'sup',
            category: 'default',
            level: BreadcrumbLevelType.WARNING,
            type: BreadcrumbType.INFO,
          },
          {
            message: 'sup',
            category: 'default',
            level: BreadcrumbLevelType.INFO,
            type: BreadcrumbType.INFO,
          },
        ],
      },
    };
  });

  describe('filterCrumbs', function () {
    it('should filter crumbs based on crumb message', async function () {
      mountWithTheme(<Breadcrumbs {...props} />);

      userEvent.type(screen.getByPlaceholderText('Search breadcrumbs'), 'hi');

      expect(
        await screen.findByText('Sorry, no breadcrumbs match your search query')
      ).toBeInTheDocument();

      userEvent.click(screen.getByLabelText('Clear'));

      userEvent.type(screen.getByPlaceholderText('Search breadcrumbs'), 'up');

      expect(
        screen.queryByText('Sorry, no breadcrumbs match your search query')
      ).not.toBeInTheDocument();

      expect(screen.getAllByText(textWithMarkupMatcher('sup'))).toHaveLength(3);
    });

    it('should filter crumbs based on crumb level', function () {
      mountWithTheme(<Breadcrumbs {...props} />);

      userEvent.type(screen.getByPlaceholderText('Search breadcrumbs'), 'war');

      // breadcrumbs + filter item
      // TODO(Priscila): Filter should not render in the dom if not open
      expect(screen.getAllByText(textWithMarkupMatcher('Warning'))).toHaveLength(6);
    });

    it('should filter crumbs based on crumb category', function () {
      mountWithTheme(<Breadcrumbs {...props} />);

      userEvent.type(screen.getByPlaceholderText('Search breadcrumbs'), 'error');

      expect(screen.getAllByText(textWithMarkupMatcher('error'))).toHaveLength(2);
    });
  });

  describe('render', function () {
    it('should display the correct number of crumbs with no filter', function () {
      props.data.values = props.data.values.slice(0, 4);

      mountWithTheme(<Breadcrumbs {...props} />);

      // data.values + virtual crumb
      expect(screen.getAllByTestId('crumb')).toHaveLength(4);

      expect(screen.getByTestId('last-crumb')).toBeInTheDocument();
    });

    it('should display the correct number of crumbs with a filter', function () {
      props.data.values = props.data.values.slice(0, 4);

      mountWithTheme(<Breadcrumbs {...props} />);

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      userEvent.type(searchInput, 'sup');

      expect(screen.queryByTestId('crumb')).not.toBeInTheDocument();

      expect(screen.getByTestId('last-crumb')).toBeInTheDocument();
    });

    it('should not crash if data contains a toString attribute', function () {
      // Regression test: A "toString" property in data should not falsely be
      // used to coerce breadcrumb data to string. This would cause a TypeError.
      const data = {nested: {toString: 'hello'}};

      props.data.values = [
        {
          message: 'sup',
          category: 'default',
          level: BreadcrumbLevelType.INFO,
          type: BreadcrumbType.INFO,
          data,
        },
      ];

      mountWithTheme(<Breadcrumbs {...props} />);

      // data.values + virtual crumb
      expect(screen.getByTestId('crumb')).toBeInTheDocument();

      expect(screen.getByTestId('last-crumb')).toBeInTheDocument();
    });
  });
});
