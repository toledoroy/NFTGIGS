// import { Result, Button } from 'antd';
// import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { useMoralis } from "react-moralis";
// import { Card, Image, Tooltip, Modal, Input } from "antd";
import { Skeleton } from "antd";
// import { FileSearchOutlined, SendOutlined, ShoppingCartOutlined } from "@ant-design/icons";
// import { getExplorer } from "helpers/networks";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
// import { useIPFS } from "hooks/useIPFS";
import { useContractTokens } from "hooks/useContractTokens";
import OfferDisplaySingle from "components/Offer/OfferDisplaySingle";
import MessageWrongNetwork from "components/Messages/MessageWrongNetwork";
import { OfferContractContext } from "context/context";

const styles = {
  NFTs: {
    display: "flex",
    // flexWrap: "wrap",
    // WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
    flexWrap: 'wrap',
  },
};

/**
 * Offers (All) Page
 */
function Offers(props) {
  const { contractData } = useContext(OfferContractContext);
  const { verifyMetadata } = useVerifyMetadata();
  const { tokens, isLoading } = useContractTokens({ address: contractData.hash, chain: contractData.chain });
  const { chainId } = useMoralis();

  console.warn("[DEV] Offers.jsx: tokens", tokens);

  /**
   * Transfer
   * @param {*} nft 
   * @param {*} amount 
   * @param {*} receiver 
   */
  async function transfer(nft, amount, receiver) {
    console.log(nft, amount, receiver);
    const options = {
      type: nft?.contract_type?.toLowerCase(),
      tokenId: nft?.token_id,
      receiver,
      contractAddress: nft?.token_address,
    };

    if (options.type === "erc1155") { options.amount = amount ?? nft.amount; }

    setIsPending(true);

    try {
      const tx = await Moralis.transfer(options);
      console.log(tx);
      setIsPending(false);
    } catch (err) {
      alert(err.message);
      setIsPending(false);
    }
  }

  const handleTransferClick = (nft) => {
    // setNftToSend(nft);
    setVisibility(true);
  };

  return (
    <div className="framed offer">
      {chainId !== "0x13881" && <MessageWrongNetwork />}
      <h1>Offers</h1>
      <div style={styles.NFTs}>
        <Skeleton loading={isLoading}>
          {tokens.map((nft) => {
            //Verify Metadata
            nft = verifyMetadata(nft);
            return <OfferDisplaySingle key={nft.token_id} nft={nft} />;
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
            onChange={(e) => setAmount(e.target.value)}
          />
        )}
      </Modal>
       */}
    </div>
  );
} //Offers()

export default Offers;
