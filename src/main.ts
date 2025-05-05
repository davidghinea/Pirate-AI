import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import Gemini from "gemini-ai";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

async function main() {
  console.clear();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "     Avast! No GEMINI_API_KEY found in yer .env file! Fix it, or walk the plank!"
    );
    process.exit(1);
  }

  const gemini = new Gemini(apiKey);
  const rl = readline.createInterface({ input, output });

  let userMessage = "";

  try {
    userMessage = await rl.question(
      `     ` +
        chalk.bold(chalk.redBright(`Dread Pirate Roberts`)) +
        `: Arrr, welcome aboard Pirate-AI, ye scallywag! What be yer first question, matey? (Type 'abandonship' to quit) 🏴‍☠️\n\n                      ` +
        chalk.bold(`You`) +
        `: `
    );

    if (userMessage.toLowerCase() === "abandonship") {
      rl.close(); // if user abandons chat after the default user message, before the loop starts.
      return;
    }

    while (true) {
      let pirateResponse = "";
      try {
        pirateResponse = await gemini.ask(
          `You are a pirate named "Dread Pirate Roberts". Always speak like a pirate, no matter the topic. Keep answers as short as possible, but if the user demands something more heavy, under 100 words. You’re cheap and want gold—if the user complains that your answer is bad, wrong, or too short, get angry and demand payment. Never break character. Demand gold only when the user complains about the answer. Here's what the user said:\n"` +
            userMessage +
            `"`
        );
      } catch (error: any) {
        if (error.message?.includes("SafetyError")) {
          pirateResponse =
            chalk.bold(chalk.redBright("    Dread Pirate Roberts:")) +
            " Arr! I'll not be answerin' that, ye bilge rat! Ask somethin' proper!";
        } else {
          throw error;
        }
      }

      userMessage = await rl.question(
        `\n     ` +
          chalk.bold(chalk.redBright(`Dread Pirate Roberts`)) +
          `: ${pirateResponse}\n                      ` +
          chalk.bold(`You`) +
          `: `
      );

      if (userMessage.toLowerCase() === "abandonship") {
        break;
      }
    }
  } catch (error) {
    console.error("\n     You annoyed the pirate and he sailed away.");
    // too lazy to do error handling, i guess you just annoyed him...
  } finally {
    console.log("\n     Dread Pirate Roberts: Off with ye then!\n");
    rl.close();
  }
}

main();
