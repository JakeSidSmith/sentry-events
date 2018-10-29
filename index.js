#! /usr/bin/env node

const axios = require('axios');
const parseLinkHeader = require('parse-link-header');

const HOST = 'https://sentry.io';
const MATCHES_ORGANIZATION_PROJECT = /[\w\d-_]+\/[\w\d-_]+/;

const [_node, _path, organizationProject] = [...process.argv];
const { SENTRY_TOKEN } = process.env;

if (!SENTRY_TOKEN) {
  console.error('No SENTRY_TOKEN defined in environment');
  return process.exit(1);
}

if (typeof organizationProject !== 'string') {
  console.error('No organization/project supplied');
  return process.exit(1);
}

if (!MATCHES_ORGANIZATION_PROJECT.test(organizationProject)) {
  console.error(`Invalid organization/project - should match the pattern "organization/project"`);
  return process.exit(1);
}

const pathname = `/api/0/projects/${organizationProject}/events/`;

async function getEvents (url) {
  return await axios({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${SENTRY_TOKEN}`
    }
  })
    .then(async (response) => {
      const pagination = parseLinkHeader(response.headers.link);

      if (pagination.next && pagination.next.results && pagination.next.results === 'true') {
        const nextEvents = await getEvents(pagination.next.url);
        return [...response.data, ...nextEvents];
      }

      return response.data;
    })
    .catch((error) => {
      console.error(error && error.message ? error.message : error);

      if (error.response) {
        console.error(error.response.data);
      }

      return process.exit(1);
    });
}

async function getAllEvents () {
  const allEvents = await getEvents(`${HOST}${pathname}`);

  process.stdout.write(JSON.stringify({events: allEvents}, undefined, 2));
}

getAllEvents();
