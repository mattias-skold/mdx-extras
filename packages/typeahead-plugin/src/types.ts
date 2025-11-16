import type { JSX } from "react";

/**
 * Configuration for a single typeahead type (e.g., mentions, hashtags)
 */
export interface TypeaheadConfig {
  /**
   * Unique identifier for this typeahead type. It's used for the text directive name (e.g., :mention[...], :hashtag[...])
   *
   * MUST be unique across all configs in the plugin.
   *
   * Examples: 'mention', 'hashtag', 'emoji', 'issue'
   */
  type: string;

  /**
   * Trigger character(s) - e.g., '@', '#', ':'
   */
  trigger: string;

  /**
   * Async function to resolve search results
   * @param query - User's search string
   * @returns Promise resolving to array of matching items
   */
  searchCallback: (query: string) => Promise<string[]>;

  /**
   * Render function for menu items
   * @param item - The data item to render
   * @returns React element to display in menu
   */
  renderMenuItem: (item: string) => JSX.Element;

  /**
   * Optional: Custom CSS class for this typeahead type
   */
  className?: string;

  /**
   * Optional: Max results to show
   * @default 5
   */
  maxResults?: number;
}

/**
 * Plugin parameters
 */
export interface TypeaheadPluginParams {
  /**
   * Array of typeahead configurations.
   * Each config.type must be unique.
   */
  configs: TypeaheadConfig[];
}
