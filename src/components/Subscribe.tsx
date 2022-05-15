import { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import "../css/App.css";
import { daiABI, web3Provider } from "../config/config";
import { UpgradeDAI } from "./UpgradeDAI";
import { Flex, Text, Box, Heading, Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import { DowngradeDAI } from "./DowngradeDAI";
import { CreateFlow } from "./CreateFlow";
import { DeleteFlow } from "./DeleteFlow";

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {},
});

function Subscribe() {
  const [provider, setProvider] = useState<any>();
  const [account, setAccount] = useState<string>();
  const [error, setError] = useState<string>("");
  const [DAIBalance, setDAIBalance] = useState("");
  const [DAIxBalance, setDAIxBalance] = useState("");

  const connectWallet = async () => {
    try {
      const { provider, accounts } = await web3Provider();
      setProvider(provider);
      setAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      setError("something went wrong!");
    }
  };

  const refreshState = () => {
    setAccount("");
  };

  const disconnect = () => {
    web3Modal.clearCachedProvider();
    refreshState();
  };

  const getBalances = async () => {
    const { provider, sf, accounts } = await web3Provider();

    const signer = sf.createSigner({ web3Provider: provider });

    //fDAI on mumbai
    const DAI = new ethers.Contract(
      "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7",
      daiABI,
      signer
    );

    const DAIx = await sf.loadWrapperSuperToken(
      "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
    );

    setDAIBalance(ethers.utils.formatEther(await DAI.balanceOf(accounts[0])));
    setDAIxBalance(
      ethers.utils.formatEther(
        await DAIx.balanceOf({ account: accounts[0], providerOrSigner: signer })
      )
    );
  };

  useEffect(() => {
    getBalances();
  }, [DAIBalance, DAIxBalance]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  return (
    <div className="App">
      <header className="App-header">
        <Heading as="h1" size="4xl" isTruncated>
          Subscriptions with Superfluid
        </Heading>
        {!account ? (
          <Button my={5} onClick={connectWallet}>
            Connect Wallet
          </Button>
        ) : (
          <Box>
            <Heading as="h5" mt={3} size="sm">{`Account: ${account}`}</Heading>
            <Flex justify={"space-around"} mt={1}>
              <Text fontSize="xl">DAI balance: {DAIBalance}</Text>
              <Text fontSize="xl">DAIx balance: {DAIxBalance}</Text>
            </Flex>
            <Box>
              <UpgradeDAI />
              <DowngradeDAI />
              <CreateFlow />
              <DeleteFlow />
            </Box>
          </Box>
        )}
      </header>
    </div>
  );
}

export default Subscribe;
