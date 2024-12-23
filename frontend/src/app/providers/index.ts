import compose from 'compose-function';
import { withRouter } from './router/ui/withRouter';

export const withProviders = compose(
  withRouter,
);

export * from './router';
