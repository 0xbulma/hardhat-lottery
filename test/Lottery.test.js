const { expect } = require('chai');
const hre = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { utils } = require('ethers');

const ABOVE_AMOUNT = '0.02';
const NEG_ABOVE_AMOUNT = '-' + ABOVE_AMOUNT;
const BELOW_AMOUNT = '0.009';

const weiValue = hre.ethers.utils.parseEther(ABOVE_AMOUNT);
const negWeiValue = hre.ethers.utils.parseEther(NEG_ABOVE_AMOUNT);
const weiBelowValue = hre.ethers.utils.parseEther(BELOW_AMOUNT);

describe('Lottery Contract', function () {
  async function deployLotteryFixture() {
    const Lottery = await hre.ethers.getContractFactory('Lottery');
    const accounts = await hre.ethers.getSigners();

    const hardhatLottery = await Lottery.connect(accounts[0]).deploy();
    await hardhatLottery.deployed();

    return { Lottery, hardhatLottery, accounts };
  }

  describe('Deployment', () => {
    it('deploys a contract', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );
      expect(hardhatLottery.address).to.be.ok;
      expect(await hardhatLottery.signer.address).to.equal(accounts[0].address);
    });
    it('is Manager set', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );
      expect(await hardhatLottery.manager()).to.equal(accounts[0].address);
    });
    it('is players Array empty', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );
      expect(await hardhatLottery.getPlayers()).to.be.empty;
    });
  });

  describe('Interactions', () => {
    it('allows one account to enter', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );

      const prizePool = await hardhatLottery.prizePool();

      await expect(
        hardhatLottery.connect(accounts[0]).enter({ value: weiValue })
      ).to.changeEtherBalances(
        [accounts[0], hardhatLottery],
        [negWeiValue, weiValue]
      );

      expect(await hardhatLottery.prizePool()).to.equal(prizePool.add(weiValue));

      const players = await hardhatLottery.getPlayers();
      expect(players.length).to.be.equal(1);
      expect(players[0]).to.be.equal(accounts[0].address);
  
    });

    it('multiple accounts to enter', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );

      const NUM_ACCOUNTS = 5;
      for (let i = 0; i < NUM_ACCOUNTS; i++) {
        const prizePool = await hardhatLottery.prizePool();
        await expect(
          hardhatLottery.connect(accounts[i]).enter({ value: weiValue })
        ).to.changeEtherBalances(
          [accounts[i], hardhatLottery],
          [negWeiValue, weiValue]
        );
        expect(await hardhatLottery.prizePool()).to.equal(prizePool.add(weiValue));
        expect(await hardhatLottery.players(i)).to.be.equal(
          accounts[i].address
        );
      }
      const players = await hardhatLottery.getPlayers();
      expect(players.length).to.be.equal(NUM_ACCOUNTS);
    });

    it('deny account to enter below minimum', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );
      await expect(
        hardhatLottery.connect(accounts[0]).enter({ value: weiBelowValue })
      ).to.be.revertedWith('Please enter with 0.01 Ether at minimum');
    });

    it('deny account to enter multiple times', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );

      await expect(
        hardhatLottery.connect(accounts[0]).enter({ value: weiValue })
      ).to.changeEtherBalances(
        [accounts[0], hardhatLottery],
        [negWeiValue, weiValue]
      );

      await expect(
        hardhatLottery.connect(accounts[0]).enter({ value: weiValue })
      ).to.be.revertedWith(
        '409: the player has already registered to the lottery.'
      );
    });

    it('deny pick winner for other than manager', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );
      await expect(
        hardhatLottery.connect(accounts[1]).pickWinner()
      ).to.be.revertedWith('You are not the manager');
    });

    it('denies pick winner while there are no players', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );

      await expect(
        hardhatLottery.connect(accounts[0]).pickWinner()
      ).to.be.revertedWith('No players');
    });

    
    it('picks winner, send money and reset players array', async () => {
      const { hardhatLottery, accounts } = await loadFixture(
        deployLotteryFixture
      );

      const players = [accounts[1], accounts[2]];

      for(const player of players) {
        await hardhatLottery.connect(player).enter({ value: weiValue });
      }

      const initialBalance = await hre.ethers.provider.getBalance(hardhatLottery.address);

      await hardhatLottery.connect(accounts[0]).pickWinner();

      const transferEvent = await hardhatLottery.queryFilter('moneySent');
      const winner = transferEvent[0].args[1];
      const amount = transferEvent[0].args[2];
      
      // check transfer event
      expect(amount).to.equal(weiValue.mul(players.length));
      expect(initialBalance).to.equal(weiValue.mul(players.length));
      expect(players.map(player => player.address)).to.include(winner);

      // reset pool
      expect(await hardhatLottery.getPlayers()).to.be.empty;
      expect(await hardhatLottery.prizePool()).to.equal(0);
      expect(await hre.ethers.provider.getBalance(hardhatLottery.address)).to.equal(0);
    });
  });
});
