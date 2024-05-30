/*
 * Footer Messages
 *
 * This contains all the text for the HomePage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  disclaimer: {
    id: 'app.containers.Footer.disclaimer',
    defaultMessage: 'Every care has been taken to ensure the accuracy of this data and information. Please send any feedback to ',
  },
  disclaimer2: {
    id: 'app.containers.Footer.disclaimer2',
    defaultMessage: 'Every care has been taken to ensure the accuracy of this data and information. Please send any feedback to ',
  },
  contact: {
    email: {
      id: 'app.containers.Footer.contact.email',
      defaultMessage: 'contact@project.url',
    },
    anchor: {
      id: 'app.containers.Footer.contact.anchor',
      defaultMessage: 'contact@project.url',
    },
  },
  contactUs: {
    id: 'app.containers.Footer.contactUs',
    defaultMessage: 'Contact us',
  },
  contact2: {
    email: {
      id: 'app.containers.Footer.contact2.email',
      defaultMessage: 'contact@project.url',
    },
    anchor: {
      id: 'app.containers.Footer.contact2.anchor',
      defaultMessage: 'contact@project.url',
    },
  },
  responsible: {
    text: {
      id: 'app.containers.Footer.responsible.text',
      defaultMessage: 'Publisher\'s note, eg please visit our website to learn more about human rights',
    },
    textWithInternalLink: {
      id: 'app.containers.Footer.responsible.textWithInternalLink',
      defaultMessage: 'Publisher\'s note, eg please visit {internalLink} to learn more about human rights.',
    },
    url: {
      id: 'app.containers.Footer.responsible.url',
      defaultMessage: 'https://www.publisher.org/',
    },
    anchor: {
      id: 'app.containers.Footer.responsible.anchor',
      defaultMessage: 'www.publisher.org',
    },
  },
  project: {
    text: {
      id: 'app.containers.Footer.project.text',
      defaultMessage: '[Project] is powered by ',
    },
    url: {
      id: 'app.containers.Footer.project.url',
      defaultMessage: 'http://impactoss.org',
    },
    anchor: {
      id: 'app.containers.Footer.project.anchor',
      defaultMessage: 'IMPACT OSS',
    },
  },
  imageCredit: {
    footer_actions: {
      id: 'app.containers.Footer.imageCredit.footer_actions',
      defaultMessage: 'Photo by Nathan Anderson on Unsplash',
    },
    footer_actors: {
      id: 'app.containers.Footer.imageCredit.footer_actors',
      defaultMessage: 'Photo by Claudio Schwarz on Unsplash',
    },
    footer_facts: {
      id: 'app.containers.Footer.imageCredit.footer_facts',
      defaultMessage: 'Photo by Bernd Dittrich on Unsplash',
    },
  },
});
