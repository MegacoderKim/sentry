type SearchEventBase = {
  query: string;
  search_type: string;
  search_source?: string;
};

type OpenEvent = {};
type SelectEvent = {result_type: string; source_type: string; query?: string};
type QueryEvent = {query: string};

export type SearchEventParameters = {
  'search.searched': SearchEventBase & {search_source?: string};
  'search.operator_autocompleted': SearchEventBase & {search_operator: string};
  'organization_saved_search.selected': {
    search_type: string;
    id: number;
  };
  'settings_search.open': OpenEvent;
  'command_palette.open': OpenEvent;
  'sidebar_help.open': OpenEvent;
  'settings_search.select': SelectEvent;
  'command_palette.select': SelectEvent;
  'sidebar_help.select': SelectEvent;
  'settings_search.query': QueryEvent;
  'command_palette.query': QueryEvent;
  'sidebar_help.query': QueryEvent;
};

export type SearchEventKey = keyof SearchEventParameters;

export const searchEventMap: Record<SearchEventKey, string | null> = {
  'search.searched': 'Search: Performed search',
  'search.operator_autocompleted': 'Search: Operator Autocompleted',
  'organization_saved_search.selected':
    'Organization Saved Search: Selected saved search',
  'settings_search.open': 'settings_search Open',
  'command_palette.open': 'command_palette Open',
  'sidebar_help.open': 'sidebar_help Open',
  'settings_search.select': 'settings_search Select',
  'command_palette.select': 'command_palette Select',
  'sidebar_help.select': 'sidebar_help Select',
  'settings_search.query': 'settings_search Query',
  'command_palette.query': 'command_palette Query',
  'sidebar_help.query': 'sidebar_help Query',
};
