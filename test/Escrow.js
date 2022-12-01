const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Escrow", () => {
   let buyer, seller, inspector, lender
   let realEstate, escrow

   beforeEach(async () => {
      ;[buyer, seller, inspector, lender] = await ethers.getSigners()

      const RealEstate = await ethers.getContractFactory("RealEstate")
      realEstate = await RealEstate.deploy()

      let transaction = await realEstate
         .connect(seller)
         .mint(
            "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
         )
      await transaction.wait()

      const Escrow = await ethers.getContractFactory("Escrow")
      escrow = await Escrow.deploy(
         realEstate.address,
         seller.address,
         inspector.address,
         lender.address
      )

      // Approver property
      transaction = await realEstate.connect(seller).approve(escrow.address, 1)
      await transaction.wait()

      // List property
      transaction = await escrow
         .connect(seller)
         .list(1, buyer.address, tokens(10), tokens(5))
      await transaction.wait()
   })

   describe("Deployment", () => {
      it("Returns NFT address", async () => {
         const result = await escrow.nftAddress()
         expect(result).equal(realEstate.address)
      })

      it("Returns seller", async () => {
         const result = await escrow.seller()
         expect(result).equal(seller.address)
      })

      it("Returns inspector", async () => {
         const result = await escrow.inspector()
         expect(result).equal(inspector.address)
      })

      it("Returns lender", async () => {
         const result = await escrow.lender()
         expect(result).equal(lender.address)
      })
   })

   describe("Listing", () => {
      it("Updates as listed", async () => {
         const result = await escrow.isListed(1)
         expect(result).equal(true)
      })

      it("Updates the ownership", async () => {
         expect(await realEstate.ownerOf(1)).equal(escrow.address)
      })

      it("Returns buyer", async () => {
         const result = await escrow.buyer(1)
         expect(result).equal(buyer.address)
      })

      it("Returns the purchase price", async () => {
         const result = await escrow.purchasePrice(1)
         expect(result).equal(tokens(10))
      })

      it("Returns escrow amount", async () => {
         const result = await escrow.escrowAmount(1)
         expect(result).equal(tokens(5))
      })
   })

   describe("Deposits", () => {
      it("Updates contract balance", async () => {
         const transaction = await escrow.connect(buyer).depositEarnest(1, {
            value: tokens(5)
         })
         await transaction.wait()
         const result = await escrow.getBalance()
         expect(result).equal(5)
      })
   })
})
