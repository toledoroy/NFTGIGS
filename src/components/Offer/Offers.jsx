/* eslint-disable prettier/prettier */

// import { Result, Button } from 'antd';
// import { Link } from "react-router-dom";
// import { useOffers } from "hooks/useOffers";

import React, { useState, useEffect } from "react";
import { useMoralis, useNFTBalances } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Skeleton } from "antd";
import { FileSearchOutlined, SendOutlined, ShoppingCartOutlined, } from "@ant-design/icons";
// import { getExplorer } from "helpers/networks";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import { useIPFS } from "hooks/useIPFS";
// import AddressInput from "components/AddressInput";
import NFTDisplaySingle from "components/NFT/NFTDisplaySingle";

const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

/**
 * Offer(s) Page
 *
 * TODO:
 *
 * Create an Offer
 * Buy an Offer
 * Request Offer
 * Deliver Offer
 * Approve Offer
 *
 */
function Offers(props) {
  // const { tokens, isLoading, error } = useOffers();
  const { resolveLink } = useIPFS();
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState();

  const { verifyMetadata } = useVerifyMetadata();

  useEffect(() => {
    //Before
    setIsLoading(true);
    setError();
    // console.warn("(i) Offers() Loading Offers...");  

    //Offers v.0.1.3 on Mumbai
    // const contract = {
    //   chain: "mumbai",
    //   hash: "0x46e5BAbAd693DBb352002652f660508c65515969", 
    // };
    //TEST CONTRACT
    const contract = {
      //Something on Polygon
      chain: "polygon",
      hash: "0xe93a85fc751513b99feead66a9d29a83a8704c71",
    };

    /* Moralis NFT API */
    offersGetMoralis(contract.hash, contract.chain);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [props]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },
    [],
  );

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
              "[TEST] Offers.offersGetMoralis() Moralis API Response:",
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
              "Offers.offersGetMoralis() Moralis API Error:",
              err,
            );
            //Done Loading
            setIsLoading(false);
            //Has Error
            setError(err);
          });
      } else
        console.error("Offers.offersGetMoralis() Missing Parameters", { hash, chain, });
    } else
      console.error("Offers.offersGetMoralis() Can't Run. API Key Missing in ENV");
  } //offersGetMoralis()

  /**
   * Set Procedure
   */
  const setNFTs = (NFTs) => {
    console.warn("[TEST] Offers.offersGetMoralis() Setting NFTs", NFTs);
    for (let NFT of NFTs) {
      if (NFT?.metadata) {
        NFT.metadata = JSON.parse(NFT.metadata);
        // metadata is a string type
        NFT.image = resolveLink(NFT.metadata?.image);
      }
    }
    setTokens(NFTs);
  };

  async function transfer(nft, amount, receiver) {
    console.log(nft, amount, receiver);
    const options = {
      type: nft?.contract_type?.toLowerCase(),
      tokenId: nft?.token_id,
      receiver,
      contractAddress: nft?.token_address,
    };

    if (options.type === "erc1155") {
      options.amount = amount ?? nft.amount;
    }

    setIsPending(true);

    try {
      const tx = await Moralis.transfer(options);
      console.log(tx);
      setIsPending(false);
    } catch (e) {
      alert(e.message);
      setIsPending(false);
    }
  }

  const handleTransferClick = (nft) => {
    // setNftToSend(nft);
    setVisibility(true);
  };

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  console.warn("[TEST] Offers() Rendering Tokens:", tokens);
  return (
    <div className="framed offer">
      <h1>Offers</h1>
      <div style={styles.NFTs}>
        <Skeleton loading={isLoading}>
          {tokens.map((nft, index) => {
            {
              console.warn("[TEST] NFT", nft);
            }
            //Verify Metadata
            nft = verifyMetadata(nft);
            return <NFTDisplaySingle key={index} nft={nft} />;
          })}
        </Skeleton>
      </div>
      {/* 
      <Modal
        title={`Transfer ${nftToSend?.name || "NFT"}`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => transfer(nftToSend, amountToSend, receiverToSend)}
        confirmLoading={isPending}
        okText="Send"
      >
        <AddressInput autoFocus placeholder="Receiver" onChange={setReceiver} />
        {nftToSend && nftToSend.contract_type === "erc1155" && (
          <Input
            placeholder="amount to send"
            onChange={(e) => handleChange(e)}
          />
        )}
      </Modal>
       */}
    </div>
  );
} //Offers()

export default Offers;
