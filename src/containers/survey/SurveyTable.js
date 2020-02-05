// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map, Set, List, fromJS } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Table,
  StyleUtils
} from 'lattice-ui-kit';

import TABLE_HEADERS from './utils/TableHeaders';
import TableRow from './components/TableRow';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID } = PROPERTY_TYPE_FQNS;
const { media } = StyleUtils;

const SubmitButtonWrapper = styled.div`
  margin-top: 20px;
  text-align: end;
`;

const StyledCard = styled(Card)`
  ${media.phone`
    padding: 10px;
  `}
`;

const StyledCardSegment = styled(CardSegment)`
  ${media.phone`
    margin: 0 10px 0 10px;
  `}
`;

const NoAppsFound = styled.h4`
  font-weight: 400;
  font-size: 15px;
  text-align: center;
`;

type Props = {
  data :Map;
}

const SurveyTable = ({ data } :Props) => {

  const [userApps, setUserApps] = useState(data);
  const handleOnSubmit = () => {
    // to do
  };

  const handleOnChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { neighborId, usertypeId } = dataset;

    const updatedApps = userApps.updateIn(
      [neighborId, 'associationDetails', PERSON_ID.toString()],
      Set(),
      (users) => {
        if (users.has(usertypeId)) {
          return users.delete(usertypeId);
        }
        return users.add(usertypeId);
      }
    );

    setUserApps(updatedApps);
  };

  const components = {
    Row: ({ data: rowData } :any) => (
      <TableRow data={rowData} handleOnChange={handleOnChange} />
    )
  };

  // console.log(userApps.valueSeq().toJS());

  return (
    <StyledCard>
      <StyledCardSegment vertical noBleed>
        {
          userApps.length === 0
            ? (
              <NoAppsFound>
                No apps found. Please try refreshing the page.
              </NoAppsFound>
            )
            : (
              <>
                <Table
                    data={userApps.valueSeq().toJS()}
                    components={components}
                    headers={TABLE_HEADERS} />

                <SubmitButtonWrapper>
                  <Button
                      mode="primary"
                      onClick={handleOnSubmit}>
                      Submit Survey
                  </Button>
                </SubmitButtonWrapper>
              </>
            )
        }

      </StyledCardSegment>
    </StyledCard>
  );
};

export default SurveyTable;
