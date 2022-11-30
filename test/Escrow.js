const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Escrow", () => {
   it("saves the addresses", async ()=>{
      const [deployer, ] = await ethers.getSigners()

      const RealEstate = await ethers.getContractFactory("RealEstate")
      const realEstate = await RealEstate.deploy()
      
      let transaction = await realEstate.mint("")
   })
})
