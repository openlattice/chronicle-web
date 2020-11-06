// @flow
import React from 'react';

export default function useForceUpdate() {
  const [, forceUpdate] = React.useState();

  return React.useCallback(() => {
    forceUpdate(s => !s);
  }, []);
}
