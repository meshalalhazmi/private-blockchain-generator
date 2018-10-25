/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/




class Blockchain{

    constructor(){
        console.log("constructor")
        this.db = new LevelDB();;

        // this.addGenesisBlock();

    }

  addGenesisBlock(){

      return this.getBlockHeight().then(( height )=>{
          console.log("block chain full height",height)
            if(height <= 0){
                let genesisBlock= new Block("First block in the chain - Genesis block");
                genesisBlock.time = new Date().getTime().toString().slice(0,-3);
                genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();

                return this.db.addLevelDBData(genesisBlock.height, JSON.stringify(genesisBlock).toString()).then(block => {
                    console.log(" Genesis Block Created and Added to the chain")
                    return block
                })
            }


      })
  }


    addBlock(newBlock){
    // Block height
        return new Promise( (resolve, reject) => {
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            this.getBlockHeight().then((height) => {
                 if (height < 1) {
                    console.log("addGenesisBlock" )

                    this.addGenesisBlock().then((block) => {
                        block = JSON.parse(block)

                        newBlock.height = height + 1;

                            newBlock.previousBlockHash = block.hash
                            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                             this.db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString()).then((block) => {
                                resolve (block)
                            });


                    })
                } else {
                    console.log("not GenesisBlock ")

                    this.getBlock(height).then((block) => {
                         block = JSON.parse(block)
                        newBlock.height = height + 1 ;
                        newBlock.previousBlockHash = block.hash
                        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                         this.db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString()).then((block) => {
                            resolve (block)
                        });
                    });
                }


            })
        })
  }

  // Get block height
      getBlockHeight(){

     return this.db.getBlocksCount().then((count) => {
         return new Promise( (resolve) => {
             count  < 1 ?  resolve(0):resolve(count - 1)

         });
     })
    }

    // get block
    getBlock(key){
        return this.db.getLevelDBData(key)

    }

    // validate block
    validateBlock(blockHeight){
        return new Promise( (resolve, reject) => {
          // get block object
           this.getBlock(blockHeight).then(( block) => {
               // get block hash
               block = JSON.parse(block)
               let blockHash = block.hash;
               // remove block hash to test block integrity
               block.hash = '';
               // generate block hash
               let validBlockHash = SHA256(JSON.stringify(block)).toString();
               if (blockHash===validBlockHash) {
                   console.log('Block #'+blockHeight+' is valid');

                   resolve(true);
               } else {
                   console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
                   resolve(false);
               }
           })

        })
    }

   // Validate blockchain
    compareTwoBlocks(firstBlock,secondBlock){
        return new Promise( (resolve, reject) => {
             Promise.all([this.getBlock(firstBlock),this.getBlock(secondBlock)]).then((results) => {
                let firstBlock = JSON.parse(results[0])
                let secondBlock = JSON.parse(results[1])

                 if (firstBlock.hash !== secondBlock.previousBlockHash) {
                    console.log(`Block ${firstBlock.height} hash: ` ,firstBlock.hash , ` does not match Block ${secondBlock.height} hash: `,secondBlock.hash)
                     resolve(false);
                }
                resolve(true);




            });

        })

        }
    validateChain(){
         let validateBlocks = []
        let validateBlockChains = []
         this.getBlockHeight().then((height) => {
            console.log("block chain full height",height)


            for (let i = 0; i <= height ; i++) {
                // validate individual blocks
                validateBlocks.push(this.validateBlock(i))
                // com
                // pare two blocks hashes ,, since we start with n , n+1 , we don't need to check the last block
                if(i <  height){
                    // since compareTwoBlocks return promise , we can add the promise to validateBlocks and invoke all in Promise.all later
                    validateBlockChains.push(this.compareTwoBlocks(i,i+1))

                }


            }
             Promise.all(validateBlocks).then((results) => {
                 let errorLog = []
                 results.forEach((result,index )=> {
                     if (!result) errorLog.push(index);
                 })
                 if (errorLog.length>0) {
                     console.log('Block errors = ' + errorLog.length);
                     console.log('Blocks: '+errorLog);
                 } else {
                     console.log('No errors detected');
                 }
             });

             Promise.all(validateBlockChains).then((results) => {
                 let errorLog = []
                 results.forEach((result,index )=> {


                     if (!result) {
                         errorLog.push(index);

                     }else{
                         console.log(`Block ${index} hash matches Block ${index+1} hash: `)

                     }
                 })
                 if (errorLog.length>0) {
                     console.log('block chain is not valid');

                 } else {
                     console.log('block chain is  valid');
                 }
             });



         });

    }


 }

class LevelDB{
    constructor(){
        this.db = db
    }
    addLevelDBData(key, value) {

        return new Promise( (resolve, reject) => {
            this.db.put(key, value, function (err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                console.log('key ', key, ' and value', value, ' has been added successfully');
                resolve(value);
            });
        });
    }
    addDataToLevelDB(value) {
        let i = 0;
        return new Promise( (resolve, reject) => {
            this.db.createReadStream()
                .on('error',  (err) => {
                    console.log('Unable to read data stream!', err);
                    resolve(err);
                })
                .on('data',  (data) => {

                    i++;
                })
                .on('close',  () => {
                    console.log('Block #' + i);
                    console.log('Block # value:' + value);
                    resolve(this.addLevelDBData(i, value)) ;
                })

        });


    }
    getBlocksCount() {
        let i = 0;
        return new Promise( (resolve, reject) => {
            db.createReadStream()
                .on('data', function (data) {

                    i++;
                })
                .on('error', function (err) {
                    console.log('Oh my!', err)
                    reject(err);
                })
                .on('close', function () {

                    resolve(i);
                })




        })


    }
    getLevelDBData(key) {

        return new Promise( (resolve, reject) => {
            db.get(key, function (err, value) {

                if (err) {
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    } else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                } else {
                     resolve(value);
                }
            })
        });
    }



}
// add blocks to the chain


// GENERATE BLOCKS
// (function theLoop (i) {
//     let myBlockChain = new Blockchain();
//     setTimeout( () => {
//         let blockTest = new Block("Test Block - " + (i + 1));
//          myBlockChain.addBlock(blockTest).then(result => {
//              console.log("result",result);
//              i++;
//              if (i < 3) theLoop(i);
//          })
//
//
//     }, 1000);
//
// })(0);

let myBlockChain = new Blockchain();

// test block validity

myBlockChain.validateChain()
// myBlockChain.addGenesisBlock()


// // invalidate a block
// myBlockChain.getBlock(5).then((block) => {    //grab a block
//     block = JSON.parse(block);   // parse string to  JSON object
//     block.body = "error";  // modify body
//     block.hash = "error";  // modify body
//     myBlockChain.db.addLevelDBData(5, JSON.stringify(block));  // reinsert in the same position
// })
