import { useEffect, useState } from "react";
import {
  useMoralis,
  useMoralisWeb3Api,
  useMoralisWeb3ApiCall,
} from "react-moralis";
import { useIPFS } from "./useIPFS";
// const axios = require("axios").default;

/**
 * DEPRECATED
 *
 *
 * @param {*} props
 * @returns
 */
export const useOffers = (props) => {
  const { account } = useMoralisWeb3Api();
  // const { walletAddress } = useMoralis();
  const { resolveLink } = useIPFS();
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState();

  // const {
  //   // fetch: getTokens,
  //   fetch,
  //   data,
  //   error,
  //   isLoading,
  // } = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, ...options });
  // const dataTest = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, ...options });

  // console.log("dataTest for Chain:" + chainId, dataTest, { chain: chainId, ...options });

  useEffect(
    () => async () => {
      //Before
      setIsLoading(true);
      setError();
      console.warn("(i) Fetching OFfers");
      //Offers Contract
      //  const contractHash = "0x46e5BAbAd693DBb352002652f660508c65515969";  //Offers v.0.1.3 on Mumbai
      //  const chain = 'mumbai';
      // const chain = '80001';
      //TEST CONTRACT
      const contractHash = "0xe93a85fc751513b99feead66a9d29a83a8704c71"; //Something on Polygon
      const chain = "polygon";
      // const chain = '137';

      /* Moralis NFT API */
      return offersGetMoralis(contractHash, chain);

      /* WORKS FINE
    let guestOptions = {chain: chainId, address: '0x9e87f6bd0964300d2bde778b0a6444217d09f3c1'};
    account.getNFTs(guestOptions).then((data) => {
      console.warn("Guest NFTs Raw result", data);
    });
    */

      // account.getNFTs(options).then((data) => {
      //   console.warn("NFTs Raw result", data);
      // });

      // eslint-disable-next-line react-hooks/exhaustive-deps
      // }, [props]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [],
  );

  /**
   * Fetch NFTs via COVALENT NFT API
   *    - No Support for Mumbai...
   */
  async function offersGetNFTPort() {
    const contractHash = "0xe93a85fc751513b99feead66a9d29a83a8704c71"; //Something on Polygon
    //Polygon Offers
    fetch(
      "https://api.nftport.xyz/v0/nfts/" +
        contractHash +
        "?chain=polygon&include=metadata",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "6d4b6109-76f0-4253-b095-a98f441a7359", //Test Key
        },
      },
    )
      .then((response) => {
        console.warn("[TEST] Contract's NFTs:", response);
        response?.nfts ? setNFTs(response.nfts) : setNFTs([]);
        //Done Loading
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        //Done Loading
        setIsLoading(false);
        //Has Error
        setError(err);
      });
  }
  /**
   * Fetch NFTs viaCOVALENT NFT API
   * https://www.covalenthq.com/docs/api/#/0/Class-A/Get-changes-in-token-holders-between-two-block-heights/lng=en
   */
  async function offersGetCov(contractHash) {
    // const chain = '137'; //Polygon
    // const chain = '80001'; //Mumbai
    // let res = await
    fetch(
      `https://api.covalenthq.com/v1/137/tokens/${contractHash}/nft_token_ids/?key=ckey_3cf63e4335e74f97a35b9f16bb1`,
      // `https://api.covalenthq.com/v1/80001/tokens/${contractHash}/nft_token_ids/?key=ckey_3cf63e4335e74f97a35b9f16bb1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
      .then((response) => response.json())
      .then((response) => {
        console.warn(
          "[TEST] covalenthq Contract's NFTs:",
          response?.data?.items,
        );
        response?.data?.items ? setNFTs(response?.data?.items) : setNFTs([]);
        //Done Loading
        setIsLoading(false);
        return response;
      })
      .catch((err) => {
        console.error(err);
        //Done Loading
        setIsLoading(false);
        //Has Error
        setError(err);
      });
    // console.warn("[TEST] covalenthq Contract's NFTs:", res);
  }

  /**
   * Trigger Moralis Metadata Update When Needed
   */
  async function offersGetMoralis(hash, chain = "mumbai") {
    let apiKey = process?.env?.REACT_APP_MORALIS_API_KEY;
    if (apiKey) {
      if (hash && chain) {
        let uri = `https://deep-index.moralis.io/api/v2/nft/${hash}?chain=${chain}&format=decimal`;
        let headers = {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        };
        fetch(uri, { headers })
          .then((response) => response.json())
          .then((response) => {
            console.warn(
              "[TEST] useOffers.offersGetMoralis() Moralis API Response:",
              response,
            );

            if (!response?.result)
              throw new Error(
                "Moralis NFT For Contract Request Returned Invalid Data: " +
                  Json.stringify(response),
              );

            //Set NFTs
            response?.result ? setNFTs(response.result) : setNFTs([]);
            //Done Loading
            setIsLoading(false);
          })
          .catch((err) => {
            console.error(
              "useOffers.offersGetMoralis() Moralis API Error:",
              err,
            );
            //Done Loading
            setIsLoading(false);
            //Has Error
            setError(err);
          });
      } else
        console.error("useOffers.offersGetMoralis() Missing Parameters", {
          hash,
          chain,
        });
    } else
      console.error(
        "useOffers.offersGetMoralis() Can't Run. API Key Missing in ENV",
      );
  } //offersGetMoralis()

  /**
   * Set Procedure
   */
  const setNFTs = (NFTs) => {
    console.warn("[TEST] useOffers() Setting NFTs", NFTs);
    for (let NFT of NFTs) {
      if (NFT?.metadata) {
        NFT.metadata = JSON.parse(NFT.metadata);
        // metadata is a string type
        NFT.image = resolveLink(NFT.metadata?.image);
      }
    }
    setTokens(NFTs);
  };

  return { tokens, error, isLoading };
};
