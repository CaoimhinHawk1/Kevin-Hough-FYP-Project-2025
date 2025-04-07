import express from "express"
import {PrismaClient} from "@prisma/client"
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const prisma = new PrismaClient();

const router = require("./routes");

require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);
app.use(cors());

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use(express.json());
app.use(cookieParser());

app.listen(PORT, () =>{
    console.log(`Server is running on http://${HOST}:${PORT}`);
})

async function main() {


    const allUsers = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
        }
    });
    console.log("All users:");
    console.dir(allUsers, {depth: null})

}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async err => {
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    })



