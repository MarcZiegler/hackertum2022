const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    await prisma.ticker.create({
        data: {
            name: 'Amazon',
            ticker: "AMZN"
        }
    });
    await prisma.ticker.create({
        data: {
            name: 'Apple',
            ticker: "AAPL"
        }
    });
    await prisma.ticker.create({
        data: {
            name: 'Google',
            ticker: "GOOGL"
        }
    });
    await prisma.ticker.create({
        data: {
            name: 'Microsoft',
            ticker: "MSFT"
        }
    });

    await prisma.ticker.create({
        data: {
            name: 'Gamestop',
            ticker: "GME"
        }
    });
    await prisma.ticker.create({
        data: {
            name: 'Morgan Stanley',
            ticker: "MS"
        }
    });

}

main().then(() => console.log("Done"))