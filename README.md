# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm install
```
 ### run
   uncomment the generator code in simpleChain.js
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

   run command: node simpleChain.js

   to test the chain validity
     uncomment the validation code
     // let myBlockChain = new Blockchain();
     //
     // myBlockChain.validateChain()

# private-blockchain-generator
