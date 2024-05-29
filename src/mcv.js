const chalk = require('chalk'); 
const {printProgress} = require('./util');
const async = require('async');

class MCV {

  constructor(sourceClient, targetClient, clean=false, verbose=false) {
    this.sourceClient = sourceClient;
    this.targetClient = targetClient;
    this.clean = clean || false;
    this.verbose = verbose || false;
  }

  #getObjectsToCopy(source, target) {
    const result = {};
    //console.log(chalk.blue("Comparing buckets..."));
    for (const obj of Object.keys(source)) {
      if (target[obj] === undefined || !this.#versionArraysAreEqual(source[obj], target[obj])) {
        result[obj] = source[obj];
      }
    }
    console.log("objects to copy: ", Object.keys(result).length);
    return result;
  }

  #versionArraysAreEqual(sourceVersions, targetVersions) {
    if (sourceVersions.length !== targetVersions.length) { return false; }
    return true;
  }

  async statBucketsForCompare(bucketName) {
    //console.log("Listing objects...");
    try {
      var versionArrayMap = {}, //source
          targetVersionArrayMap = {}; //target
      await Promise.all([
        this.#statBucket(this.sourceClient.listObjects(bucketName, "", true, {IncludeVersion: true}), versionArrayMap),
        this.#statBucket(this.targetClient.listObjects(bucketName, "", true, {IncludeVersion: true}), targetVersionArrayMap),
      ]);
      //console.log(chalk.green("Generated version array maps successfully!"));
      console.log("source: ", Object.keys(versionArrayMap).length + " objects");
      console.log("target: ", Object.keys(targetVersionArrayMap).length + " objects");
      return { source: versionArrayMap, target: targetVersionArrayMap };
    } catch (err) {
      throw err;
    }
  }

  async #statBucket(stream, _versionArrayMap) {
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (!_versionArrayMap[obj.name]) {
          _versionArrayMap[obj.name] = [];
        }
        let array = _versionArrayMap[obj.name];
        let index = array.findIndex(el => el.lastModified > obj.lastModified);
        if (index === -1) {
          array.push(obj);
        } else {
          array.splice(index, 0, obj);
        }
      });
      stream.on('end', () => resolve(_versionArrayMap));
      stream.on('error', reject);
    });
  }

  async #mirrorObject(bucketName, versionList) { 
    try {
      for (let version of versionList) {
        await this.targetClient.putObject(
          bucketName,
          version.name,
          await this.sourceClient.getObject(bucketName, version.name, {versionId: version.versionId}),
          version.size,
          { lastModified: version.lastModified }
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async mirror(bucketName){
    const { source, target } = await this.statBucketsForCompare(bucketName),
    objects = this.#getObjectsToCopy(source, target),
    total = Object.keys(objects).length,
    started = new Date();
  
    let errors = [],
        numSkip = 0,
        numSuccess = 0;
  
    await new Promise( (resolve, reject)=>{
    async.eachLimit(
      Object.keys(objects),
      100,
      async  (objName) => {
        await this.#deleteTargetObjVersions(bucketName, target[objName]);
        if(source[objName]) {
          try {
            await this.#mirrorObject(bucketName, source[objName]);
            numSuccess++;
          } catch (err) {
            errors.push(err);
            numSkip++;
          }
          printProgress(
            `${bucketName}: ${
              numSkip + numSuccess
            }/${total} (skipped: ${numSkip}) @ ${Math.floor(
              (numSkip + numSuccess) / ((new Date() - started) / (1000 * 60))
            )} objs/min ${Math.round(((numSkip + numSuccess) / total) * 100)}% `
          ); 
        } else { numSkip++;}
      },
      function (err) {
        if (err) {
          console.error("A file failed to process", err);
          reject(err)
        } else {
          console.log(chalk.green("All files have been processed successfully"));
          resolve();
        }
      }
    );
    });
  };

  async #deleteTargetObjVersions(bucketName, objVersions) {
    try {
      if (!objVersions || ! Array.isArray(objVersions)) {
        return;
      }
      for (const obj of objVersions) {
        await new Promise((resolve, reject) => {
          this.targetClient.removeObject(bucketName, obj.name, { versionId: obj.versionId }, function (err) {
            if (err) {
              console.error("An error occurred while deleting object version from target:", err);
              reject(err);
              return;
            }
            console.log("Deleted from target:", obj.name, obj.versionId);
            resolve();
          });
        });
      }
    } catch (error) {
      console.error("An error occurred in deleteTargetObjVersions:", error);
      throw error;
    }
  }
}

exports.MCV = MCV;
