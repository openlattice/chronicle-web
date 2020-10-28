// @flow

import React from 'react';
import styled from 'styled-components';
import { Typography } from 'lattice-ui-kit';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr 100px;
  grid-gap: 30px;
  margin-bottom: 10px;
`;

// TODO: Add additional button to download summarized

const SummaryHeader = () => (
  <Wrapper>
    <Typography variant="overline" display="block" gutterBottom>
      Date
    </Typography>

    <Typography variant="overline" display="block" gutterBottom>
      Number of Submissions
    </Typography>
    <div />
    <Typography variant="overline" display="block" gutterBottom>
      Download
    </Typography>
  </Wrapper>
);

export default SummaryHeader;
