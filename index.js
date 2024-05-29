
const Minio = require("minio");
const chalk = require('chalk');
const {MCV} = require('./src/mcv');
const {AliasManager} = require('./src/alias-manager');
//const {alias} = require('./alias');
const commandLineArgs = require('command-line-args')

const commands = {
  mirror: [],
  alias: [ "add", "remove", "list" ],
};

const optionDefinitions = [
  { name: 'command', type: String, multiple: true, defaultOption: true },
  
  { name: 'bucket', alias: 'b', type: String, multiple: true, defaultOption: false },
  { name: 'source', alias: 's', type: String },
  { name: 'target', alias: 't', type: String },
  
  { name: 'name', alias: 'n', type: String },
  { name: 'endpoint', alias: 'e', type: String },
  { name: 'port', alias: 'p', type: Number },
  { name: 'use-ssl', type: Boolean },
  { name: 'access-key', type: String },
  { name: 'secret-key', type: String },
  
  { name: 'clean', alias: 'c', type: Boolean },
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'help', alias: 'h', type: Boolean },
  { name : 'concurrency', alias: 'C', type: Number }
]

const options = commandLineArgs(optionDefinitions);
const aliasManager = AliasManager.getInstance();
validateCommands();
main();

async function main() {
  const command = options.command[0];
  switch(command) {
    case "mirror":
      mirror();
      break;
    case "alias":
      aliasCmd();
      break;
  }
}

function aliasCmd() {
  if(options.help) { aliasHelpText(null) }
  if(options.command.length === 1) {
    throw new Error("Subcommand is required");
  }
  const subcommand = options.command[1];
  switch(subcommand) {
    case "add":
      aliasHelpText("add");
      const {name, cfg} = parseAlias();
      aliasManager.addAlias(name, cfg);
      console.log(`Alias ${name} added`, aliasManager.listAliases());
      break;
    case "remove":
      aliasHelpText("remove");
      if(!options.name) { throw new Error("Alias name is required"); }
      aliasManager.removeAlias(options.name);
      break;
    case "list":
      aliasHelpText("list");
      aliasManager.listAlias();
      break;
  }
}

function aliasHelpText(subcommand)
{
  if(!subcommand) {
    console.log("Usage: mcv alias [add|remove|list] [options]");
    return;
  }
  switch(subcommand) {
    case "add":
      console.log("Usage: mcv alias add [options]");
      console.log("Options:");
      console.log("  -n, --name       Alias name");
      console.log("  -e, --endpoint   Endpoint");
      console.log("  -p, --port       Port");
      console.log("  --use-ssl        Use SSL");
      console.log("  --access-key     Access key");
      console.log("  --secret-key     Secret key");
      break;
    case "remove":
      console.log("Usage: mcv alias remove [options]");
      console.log("Options:");
      console.log("  -n, --name       Alias name");
      break;
    case "list":
      console.log("Usage: mcv alias list");
      break;
  }

}

async function mirror() {
  if(options.help) {
    console.log("Usage: mcv mirror [options]");
    console.log("Options:");
    console.log("  -b, --bucket [bucket]  Bucket to mirror");
    console.log("  -s, --source [source]  Source client");
    console.log("  -t, --target [target]  Target client");
    console.log("  -c, --clean            Clean objects in target bucket that are not in source bucket");
    console.log("  -v, --verbose          Verbose output");
    console.log("  -C, --concurrency      No. of concurrent object streams (default 100)");
    process.exit(0);
  }
  const mcv = initMCV(options);
  if(!options.bucket || options.bucket.length === 0) {
    throw new Error("Bucket is required");
  }
  for(let bucketName of options.bucket){
    console.log(chalk.blue(`Bucket: ${bucketName}`));
    await mcv.mirror(bucketName);
  }
}

function validateCommands() {
  if(!options.command || options.command.length === 0) {
    if(options.help) {
      console.log("Usage: mcv [command] [subcommand]? [options]");
      console.log("Commands:");
      console.log("  mirror [bucket] [source] [target]  Mirror bucket from source to target");
      console.log("  alias [add|remove|list] [options]    Manage aliases");
      process.exit(0);
    } else {
      throw new Error("Command is required");
    }
  }
  const command = options.command[0];
  if(!Object.keys(commands).includes(command)) {
    throw new Error(`Invalid command ${command}`);
  }
  if(options.command.length !== (commands[command].length === 0? 1 : 2)) {
    throw new Error(`Invalid number of arguments for command ${command}`);
  }
  if(options.command.length === 2 && !commands[command].includes(options.command[1])) {
    throw new Error(`Invalid subcommand ${options.command[1]}`);
  } 
}

function initMCV() {
  const alias = aliasManager.getAliases();
  if(!options.source || !options.target) {
    throw new Error("Source and target clients are required");
  }
  if(!alias[options.source]) {
    throw new Error(`Source client ${options.source} not found in alias`);
  }
  if(!alias[options.target]) {
    throw new Error(`Target client ${options.target} not found in alias`);
  }
  const sourceClient = new Minio.Client(alias[options.source]);
  const targetClient = new Minio.Client(alias[options.target]);  
  return new MCV(sourceClient, targetClient, options.clean, options.verbose, options.concurrency || 100);
}

function parseAlias() {
  if(!options.name || !options.endpoint || !options["access-key"] || !options["secret-key"]) {
    throw new Error("Alias name, endpoint, port, access-key, and secret-key are required");
  }
  return {
    name: options.name,
    cfg: {
      endPoint: options.endpoint,
      port: options.port,
      useSSL: options["use-ssl"] || false,
      accessKey: options["access-key"],
      secretKey: options["secret-key"],
    }
  }
}







