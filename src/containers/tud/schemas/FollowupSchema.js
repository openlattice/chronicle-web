// @flow

import TranslationKeys from '../constants/TranslationKeys';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const {
  PRIMARY_BOOK_TITLE,
  PRIMARY_BOOK_TYPE,
  PRIMARY_MEDIA_ACTIVITY,
  PRIMARY_MEDIA_AGE,
  PRIMARY_MEDIA_NAME,
} = PROPERTY_CONSTS;

const createSchema = (selectedActivity :string, trans :(string, ?Object) => Object) => {

  const primaryActivities :Object = trans(TranslationKeys.PRIMARY_ACTIVITIES, { returnObjects: true });
  // translate to find which activity this is
  switch (selectedActivity) {
    case primaryActivities.reading: {
      return {
        properties: {
          [PRIMARY_BOOK_TYPE]: {
            type: 'array',
            title: trans(TranslationKeys.BOOK_TYPE),
            description: trans(TranslationKeys.CHOOSE_APPLICABLE),
            items: {
              type: 'string',
              enum: trans(TranslationKeys.BOOK_TYPE_OPTIONS, { returnObjects: true })
            },
            uniqueItems: true,
            minItems: 1
          },
          [PRIMARY_BOOK_TITLE]: {
            type: 'string',
            title: trans(TranslationKeys.BOOK_TITLE)
          }
        },
        required: [PRIMARY_BOOK_TYPE]
      };
    }
    case primaryActivities.media_use:
      return {
        properties: {
          [PRIMARY_MEDIA_ACTIVITY]: {
            title: trans(TranslationKeys.MEDIA_ACTIVITY),
            type: 'array',
            description: trans(TranslationKeys.CHOOSE_APPLICABLE),
            items: {
              enum: trans(TranslationKeys.MEDIA_ACTIVITY_OPTIONS, { returnObjects: true }),
              type: 'string'
            },
            uniqueItems: true,
            minItems: 1
          },
          [PRIMARY_MEDIA_AGE]: {
            title: trans(TranslationKeys.MEDIA_AGE),
            type: 'string',
            enum: trans(TranslationKeys.MEDIA_AGE_OPTIONS, { returnObjects: true })
          },
          [PRIMARY_MEDIA_NAME]: {
            title: trans(TranslationKeys.MEDIA_NAME),
            type: 'string'
          }
        },
        required: [PRIMARY_MEDIA_ACTIVITY, PRIMARY_MEDIA_AGE]
      };
    default: {
      return {
        properties: {},
        required: []
      };
    }
  }
};

const createUiSchema = (trans :(string, ?Object) => Object) => ({
  [PRIMARY_MEDIA_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withOther: true,
      otherText: trans(TranslationKeys.OTHER)
    }
  },
  [PRIMARY_BOOK_TYPE]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withOther: true,
      otherText: trans(TranslationKeys.OTHER)
    }
  },
  [PRIMARY_BOOK_TITLE]: {
    classNames: 'column-span-12',
  },
  [PRIMARY_MEDIA_AGE]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  [PRIMARY_MEDIA_NAME]: {
    classNames: 'column-span-12'
  }
});

export {
  createSchema,
  createUiSchema
};
