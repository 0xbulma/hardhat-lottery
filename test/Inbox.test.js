const { expect } = require('chai');
const hre = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

// const INITIAL_MESSAGE = 'hello';
// const NEW_MESSAGE = 'Hello new';

// describe('Inbox contract', function () {
//   async function deployInboxFixture() {
//     const Inbox = await hre.ethers.getContractFactory('Inbox');
//     const accounts = await hre.ethers.getSigners();

//     const hardhatInbox = await Inbox.connect(accounts[0]).deploy(
//       INITIAL_MESSAGE
//     );
//     await hardhatInbox.deployed();

//     return { Inbox, hardhatInbox, accounts };
//   }

//   // You can nest describe calls to create subsections.
//   describe('Deployment', () => {
//     it('deploys a contract', async () => {
//       const { hardhatInbox, accounts } = await loadFixture(deployInboxFixture);
//       expect(hardhatInbox.address).to.be.ok;
//       expect(await hardhatInbox.signer.address).to.equal(accounts[0].address);
//     });

//     it('it has a default message', async () => {
//       const { hardhatInbox } = await loadFixture(deployInboxFixture);
//       expect(await hardhatInbox.message()).to.equal(INITIAL_MESSAGE);
//     });

//     it('it sets a message', async () => {
//       const { hardhatInbox, accounts } = await loadFixture(deployInboxFixture);
//       await hardhatInbox.connect(accounts[0]).setMessage(NEW_MESSAGE);
//       expect(await hardhatInbox.message()).to.equal(NEW_MESSAGE);
//     });
//   });
// });

