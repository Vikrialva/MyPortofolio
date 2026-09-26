'use strict';

const { ensureAdminUser } = require('./auth');
const { initialDocuments, seedProjects } = require('./content');

async function main() {
  await ensureAdminUser();
  initialDocuments();
  seedProjects();
  console.log('Seed completed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
