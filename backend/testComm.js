require('dotenv').config({path: 'c:/Users/pasca/Desktop/TukWeb/backend/.env'});
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const match = await prisma.processedMatch.findFirst();
    if (!match) {
        console.log("No processed match found");
        return;
    }
    const matchId = match.matchId;
    console.log("Match ID:", matchId);
    
    const comm = await axios.get(`https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/comm`, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST
      }
    });
    
    console.log(JSON.stringify(comm.data).slice(0, 3000));
  } catch(e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
