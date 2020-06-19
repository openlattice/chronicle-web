// @flow

import * as React from 'react';

import styled from 'styled-components';

const Error = styled.div`
  margin-top: 60px;
  text-align: center;
`;

type Props = {
  children ?:React.Node;
  message ?:string;
};
const BasicErrorComponent = ({ children, message } :Props) => (
  <Error>
    {children || (
      <span>
        {message}
      </span>
    )}
  </Error>
);

BasicErrorComponent.defaultProps = {
  children: undefined,
  message: 'Sorry, something went wrong. Please try refreshing the page, or contact support.'
};

export default BasicErrorComponent;
