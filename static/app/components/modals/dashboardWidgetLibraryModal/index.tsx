import * as React from 'react';
import {useState} from 'react';
import {css} from '@emotion/react';

import {ModalRenderProps} from 'sentry/actionCreators/modal';
import Tooltip from 'sentry/components/tooltip';
import {t, tct} from 'sentry/locale';
import {Organization} from 'sentry/types';
import trackAdvancedAnalyticsEvent from 'sentry/utils/analytics/trackAdvancedAnalyticsEvent';
import {DashboardDetails, MAX_WIDGETS, Widget} from 'sentry/views/dashboardsV2/types';
import {WidgetTemplate} from 'sentry/views/dashboardsV2/widgetLibrary/data';

import Button from '../../button';
import ButtonBar from '../../buttonBar';

import DashboardWidgetLibraryTab from './libraryTab';
import {TAB, TabsButtonBar} from './tabsButtonBar';

export type DashboardWidgetLibraryModalOptions = {
  organization: Organization;
  dashboard: DashboardDetails;
  initialSelectedWidgets?: WidgetTemplate[];
  customWidget?: Widget;
  onAddWidget: (widgets: Widget[]) => void;
};

type Props = ModalRenderProps & DashboardWidgetLibraryModalOptions;

function DashboardWidgetLibraryModal({
  Header,
  Body,
  Footer,
  dashboard,
  organization,
  customWidget,
  initialSelectedWidgets,
  closeModal,
  onAddWidget,
}: Props) {
  const [selectedWidgets, setSelectedWidgets] = useState<WidgetTemplate[]>(
    initialSelectedWidgets ? initialSelectedWidgets : []
  );
  const [errored, setErrored] = useState(false);

  function handleSubmit() {
    onAddWidget([...dashboard.widgets, ...selectedWidgets]);
    closeModal();
  }

  const overLimit = dashboard.widgets.length + selectedWidgets.length > MAX_WIDGETS;

  return (
    <React.Fragment>
      <Header closeButton>
        <h4>{t('Add Widget(s)')}</h4>
      </Header>
      <Body>
        <TabsButtonBar
          activeTab={TAB.Library}
          organization={organization}
          dashboard={dashboard}
          selectedWidgets={selectedWidgets}
          customWidget={customWidget}
          onAddWidget={onAddWidget}
        />
        <DashboardWidgetLibraryTab
          selectedWidgets={selectedWidgets}
          errored={errored}
          setSelectedWidgets={setSelectedWidgets}
          setErrored={setErrored}
        />
      </Body>
      <Footer>
        <ButtonBar gap={1}>
          <Button
            external
            href="https://docs.sentry.io/product/dashboards/custom-dashboards/#widget-builder"
          >
            {t('Read the docs')}
          </Button>
          <Tooltip
            title={tct(
              'Exceeds max widgets ([maxWidgets]) per dashboard. Plese unselect [unselectWidgets] widget(s).',
              {
                maxWidgets: MAX_WIDGETS,
                unselectWidgets:
                  dashboard.widgets.length + selectedWidgets.length - MAX_WIDGETS,
              }
            )}
            disabled={!!!overLimit}
          >
            <Button
              data-test-id="confirm-widgets"
              priority="primary"
              disabled={overLimit}
              type="button"
              onClick={() => {
                if (!!!selectedWidgets.length) {
                  setErrored(true);
                  return;
                }
                trackAdvancedAnalyticsEvent('dashboards_views.widget_library.add', {
                  organization,
                  num_widgets: selectedWidgets.length,
                });
                selectedWidgets.forEach(selectedWidget => {
                  trackAdvancedAnalyticsEvent(
                    'dashboards_views.widget_library.add_widget',
                    {
                      organization,
                      title: selectedWidget.title,
                    }
                  );
                });
                handleSubmit();
              }}
            >
              {t('Save')}
            </Button>
          </Tooltip>
        </ButtonBar>
      </Footer>
    </React.Fragment>
  );
}

export const modalCss = css`
  width: 100%;
  max-width: 700px;
  margin: 70px auto;
`;

export default DashboardWidgetLibraryModal;
