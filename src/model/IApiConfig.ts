/**
 * API configuration object.
 *
 * @property name A name for the API. MUST be the same for exposeApi() and createProxy() methods
 * @property props A list of methods that we want to expose from the API. MUST match methods that exist on the API.
 */
export interface IApiConfig {
  name: string;
  props: string[];
}
