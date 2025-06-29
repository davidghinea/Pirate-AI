import * as readline from "node:readline/promises";
import { stdin as input, stdout as output, stdout } from "node:process";
import Gemini from "gemini-ai";
import dotenv from "dotenv";
import chalk from "chalk";
import * as fs from "node:fs"; // Import the file system module
import * as path from "node:path"; // Import path module for robust file paths
// Import necessary modules for ES Module path resolution
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

dotenv.config();

function showPirate(message: string) {
  stdout.write(
    `\n     ` +
      chalk.bold(chalk.redBright(`Dread Pirate Roberts`)) +
      `: ${message}`
  );
}

function showUser() {
  return `                      ` + chalk.bold(`You`) + `: `;
}

function showError(message: string) {
  console.error(`\n     ${message}\n`);
}

function formatTextWrap(text: string, maxWidth: number = 50): string {
  const words = text.split(" ");
  let lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine === "") {
      currentLine = word;
    } else if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine); // Add the last line

  // Indentation for subsequent lines to align under the first line's text
  const subsequentIndent = "                           "; // Match showUser indent
  return lines.join("\n" + subsequentIndent);
}

// made functions for each output, so that it's simpler to reuse, and keep indentation consistent
// using stdout which makes more sense to distinguish input from output

async function getUserInput(
  rl: readline.Interface,
  prompt: string
): Promise<string> {
  return await rl.question(prompt);
}

async function main() {
  console.clear();

  try {
    // Get the directory name in ES Modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Construct the path to the art file relative to the current script
    const artPath = path.join(__dirname, "../pirate-ship.txt"); // Now __dirname is correctly defined
    // Read the art file synchronously
    const pirateShipArt = fs.readFileSync(artPath, "utf8");

    // Print the art in bright red
    console.log(chalk.redBright(pirateShipArt));

    console.log(
      chalk.red(
        "                           ----------------------------------\n"
      )
    );

    console.log(
      `                           ` +
        chalk.whiteBright(
          chalk.bold(
            ` ` + chalk.underline(`github.com/davidghinea/pirate-ai\n`) + ` `
          )
        )
    );

    console.log(
      chalk.red(
        "                           ----------------------------------\n\n"
      )
    );
  } catch (err) {
    console.error(
      chalk.yellow(
        "Warning: Could not load pirate ship art. Setting sail without it!"
      ),
      err
    );
    // Continue without the art if loading fails
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    showError(
      "Avast! No GEMINI_API_KEY found in yer .env file! Fix it, or walk the plank!"
    );
    process.exit(1);
  }

  const gemini = new Gemini(apiKey);
  const rl = readline.createInterface({ input, output });

  let userMessage = "";

  try {
    showPirate(
      formatTextWrap(
        "Arrr, welcome aboard Pirate-AI, ye scallywag! What be yer first question, matey? (Type 'abandonship' to quit) \n"
      )
    );
    stdout.write("\n");

    userMessage = await getUserInput(rl, showUser());

    if (userMessage.toLowerCase() === "abandonship") {
      rl.close();
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
          // Format the error message too, if desired
          pirateResponse = formatTextWrap(
            "Arr! I'll not be answerin' that, ye bilge rat! Ask somethin' proper!"
          );
        } else {
          throw error;
        }
      }

      // Format the pirate's response before showing it
      const formattedResponse = formatTextWrap(pirateResponse);
      showPirate(formattedResponse); // Show the formatted response
      stdout.write("\n");
      userMessage = await getUserInput(rl, showUser());

      if (userMessage.toLowerCase() === "abandonship") {
        break;
      }
    }
  } catch (error) {
    showError("You annoyed the pirate and he sailed away.");
  } finally {
    showPirate("Off with ye then!");
    stdout.write("\n");
    rl.close();
  }
}

main();
