/*
 * @flow
 */

import React, { Component } from 'react';

import { Form } from 'lattice-fabricate';

const dataSchema = {
  properties: {
    name: {
      title: 'Study Name',
      type: 'string'
    },
    description: {
      title: 'Description',
      type: 'string'
    },
    group: {
      title: 'Study Group',
      type: 'string'
    },
    version: {
      title: 'Study Version',
      type: 'string'
    },
    email: {
      title: 'Contact Email',
      type: 'string'
    }
  },
  type: 'object',
  title: ''
};

const uiSchema = {
  description: {
    classNames: 'column-span-12'
  },
  email: {
    classNames: 'column-span-12'
  },
  group: {
    classNames: 'column-span-12'
  },
  name: {
    classNames: 'column-span-12'
  },
  version: {
    classNames: 'column-span-12'
  }

};

type Props = {
  formData :Object;
  handleOnChange :Function;
  isSubmitting :boolean;
}

class CreateStudyForm extends Component<Props> {
  componentDidMount() {

  }

  render() {
    const {
      formData,
      handleOnChange,
      isSubmitting,
    } = this.props;

    return (
      <Form
          formData={formData}
          hideSubmit
          isSubmitting={isSubmitting}
          onChange={handleOnChange}
          schema={dataSchema}
          uiSchema={uiSchema} />
    );
  }
}
export default CreateStudyForm;
