// @Flow

import { useRef, useEffect } from 'react';

// ref: https://reactjs.org/docs/hooks-faq.html
const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default usePrevious;
