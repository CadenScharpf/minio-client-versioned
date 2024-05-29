const path = require('path');
const os = require('os');
const {fsUtil} = require('./util');

const mcvDir = path.join(os.homedir(), '.mcv');
const aliasFile = path.join(mcvDir, 'alias.json');

class AliasManager {
    static #instance;
    #aliases;

    constructor() {
        if (AliasManager.#instance) {
            throw new Error('Error: Instantiation failed: Use AliasManager.getInstance() instead of new.');
        }
        this.#aliases = this.#init();
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new AliasManager();
        }
        return this.#instance;
    }

    getAliases() {
        return this.#aliases;
    }

    addAlias(name, cfg) {
        if(this.#aliases[name]) {
            throw new Error(`Alias ${name} already exists`);
        }
        this.#aliases[name] = cfg;
        this.save();
    }

    removeAlias(aliasName) {
        if(!this.#aliases[aliasName]) {
            throw new Error(`Alias ${aliasName} does not exist`);
        }
        delete this.#aliases[aliasName];
        this.save();
    }

    listAliases() {
        return this.#aliases;
    }

    save() {
        fsUtil.writeJsonFile(aliasFile, this.#aliases);
    }

    #init() {
        fsUtil.ensureDirectory(mcvDir);
        fsUtil.ensureFile(aliasFile);
        return fsUtil.readJsonFile(aliasFile);
      }


}

exports.AliasManager = AliasManager;