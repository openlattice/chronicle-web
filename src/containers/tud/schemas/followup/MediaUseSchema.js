// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import {
  CAREGIVERS,
  CHILD_BEHAVIOR_CATEGORIES,
  MEDIA_ACTIVITY_CATEGORIES,
  MEDIA_DEVICE_TYPES,
  MEDIA_USE_CONSTS
} from '../../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;

const {
  ADULT_MEDIA,
  ADULT_MEDIA_PROPORTION,
  ADULT_MEDIA_PURPOSE,
  BEHAVIOR_AFTER,
  BEHAVIOR_BEFORE,
  CAREGIVER,
  DEVICE,
  LOCATION,
  MEDIA_ACTIVITY,
  MEDIA_NAME,
  OTHER_MEDIA,
  PROGRAM_AGE,
} = MEDIA_USE_CONSTS;

// console.log(MEDIA_ACTIVITY_TYPES.slice(0, 4));
// console.log(MEDIA_ACTIVITY_TYPES.slice())

const otherMediaSchema = {
  [OTHER_MEDIA]: {
    type: 'string',
    title: `Was any other media being used at the same time as this activity,
    such as television, movies, video or computer games, books, magazines,
    radio or CDs, cell phone/smart phone, laptop or a tablet? `,
    enum: ['Yes', 'No', "Don't Know"]
  },
  [BEHAVIOR_BEFORE]: {
    type: 'string',
    title: 'How was your child behaving just before this activity began?',
    enum: CHILD_BEHAVIOR_CATEGORIES
  },
  [BEHAVIOR_AFTER]: {
    type: 'string',
    title: 'How was your child behaving just after this activity ended?',
    enum: CHILD_BEHAVIOR_CATEGORIES
  }
};

const subSchema = {
  properties: {
    [CAREGIVER]: {
      type: 'array',
      title: 'Who was with your child when he/she was doing this? Please choose all that apply.',
      items: {
        type: 'string',
        enum: CAREGIVERS
      },
      uniqueItems: true,
      minItems: 1
    },
    [LOCATION]: {
      type: 'string',
      title: 'Where was your child when he/she was doing this activity?',
      enum: ['Room where child sleeps', 'In some other room in the house (e.g. kitchen, family room)',
        'Outdoors (e.g. park or yard)', 'At school or daycare', 'While travelling (e.g. car, train, or school bus)',
        'Restaurant, grocery store, or shopping center',
        'Multiple locations', 'Other (e.g. another person\'s house, church)']
    },
    [ADULT_MEDIA]: {
      type: 'string',
      title: `Was an adult using a tablet, laptop, cell phone/smart phone
        at any point while your child did this activity?`,
      enum: ['Yes', 'No', "Don't Know"]
    },
  },
  dependencies: {
    [ADULT_MEDIA]: {
      oneOf: [
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['Yes']
            },
            [ADULT_MEDIA_PURPOSE]: {
              type: 'array',
              title: 'What was the tablet/laptop/cell phone/smart phone used for? Please choose all that apply',
              items: {
                type: 'string',
                enum: ['Work call', 'Work email', 'Review of documents for work',
                  'Social call', 'Entertainment', 'Social media']
              },
              uniqueItems: true,
              minItems: 1
            },
            [ADULT_MEDIA_PROPORTION]: {
              type: 'number',
              title: `Approximately what percentage of the time for this activity were you using your device?
              For example, if your child was using media for 2 hours and you used your device for 1 hour,
               enter 50; if you used your device the entire time, enter 100.`,
            },
            ...otherMediaSchema
          }
        },
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['No', "Don't Know"]
            },
            ...otherMediaSchema
          }
        }
      ]
    }
  },
};

const createSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    title: '',
    type: 'object',
    properties: {
      [DEVICE]: {
        type: 'array',
        title: 'Specifically, what device(s) was your child using? Select all applicable.',
        items: {
          type: 'string',
          enum: MEDIA_DEVICE_TYPES
        },
        uniqueItems: true,
        minItems: 1
      },
      [MEDIA_ACTIVITY]: {
        type: 'string',
        title: 'Specifically, what primary media activity was your child engaged in?',
        // items: {
        //   type: 'string',
        //
        // },
        enum: MEDIA_ACTIVITY_CATEGORIES,
        uniqueItems: true
      }
    },
    dependencies: {
      [MEDIA_ACTIVITY]: {
        oneOf: [
          {
            properties: {
              [MEDIA_ACTIVITY]: {
                enum: MEDIA_ACTIVITY_CATEGORIES.slice(0, 4)
              },
              [PROGRAM_AGE]: {
                type: 'string',
                title: `Was the program (e.g., show, app, movie, book, etc.) for your child's age,
                  for older children, for younger children, or for adults?`,
                enum: ["Child's age", 'Older children', 'Younger children', 'Adults', "Don't know/other"]
              },
              [MEDIA_NAME]: {
                type: 'string',
                title: `What was the name of the media used? (e.g. name of show, book, movie).
                 If you are unsure of exact name, either describe (e.g., a drawing app, a movie about unicorns)
                 or leave blank`
              },
              ...subSchema.properties
            },
            dependencies: {
              ...subSchema.dependencies
            }
          },
          {
            properties: {
              [MEDIA_ACTIVITY]: {
                enum: MEDIA_ACTIVITY_CATEGORIES.slice(4)
              },
              ...subSchema.properties
            },
            dependencies: {
              ...subSchema.dependencies
            }
          }
        ]
      }
    }

  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    classNames: 'column-span-12 grid-container',
    [DEVICE]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withOther: true
      }
    },
    [MEDIA_ACTIVITY]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio',
      'ui:options': {
        withOther: true
      }
    },
    [PROGRAM_AGE]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [MEDIA_NAME]: {
      classNames: 'column-span-12'
    },
    [CAREGIVER]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        noneText: 'No one'
      }
    },
    [ADULT_MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [LOCATION]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [ADULT_MEDIA_PURPOSE]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withNone: true,
        noneText: "Don't know"
      }
    },
    [OTHER_MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BEHAVIOR_BEFORE]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BEHAVIOR_AFTER]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [ADULT_MEDIA_PROPORTION]: {
      classNames: 'column-span-12'
    }
  }
});

export {
  createSchema,
  createUiSchema
};
