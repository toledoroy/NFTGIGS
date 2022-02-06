/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {

    DollarCircleOutlined, SelectOutlined,

    FileSearchOutlined, SendOutlined, FireTwoTone, ShoppingCartOutlined
} from "@ant-design/icons"; //
import { Card, Image, Tooltip, Modal, Input, message } from "antd";
import { useMoralis } from "react-moralis";
import { getExplorer } from "helpers/networks";
import AddressInput from "components/AddressInput";
// import NFTDisplayMetadata from "components/NFTCollections/NFTDisplayMetadata";
// import { IPFS } from "helpers/IPFS";
import { useOffer } from "hooks/useOffer";

const { Meta } = Card;

/**
 * Component: Display a Single NFT
 */
function OfferDisplaySingle({ nft }) {
    const { Moralis, account } = useMoralis();
    const [nftToSend, setNftToSend] = useState(null);
    const [receiverToSend, setReceiver] = useState(null);
    const [amountToSend, setAmount] = useState(null);
    const [visible, setVisibility] = useState(false);
    const [buyVisible, setBuyVisible] = useState(false);
    const [isPending, setIsPending] = useState(false);
    // const [image, setImage] = useState(nft.image);
    const { buy, getPrice, getSupply, getCredit } = useOffer();

    const [price, setPrice] = useState();
    const [stock, setStock] = useState();
    const [credit, setCredit] = useState();
    useEffect(() => {
        loadOnChainData()
    }, []);
    const loadOnChainData = async () => {
        //Fetch onChain Data
        let price = await getPrice(nft.token_id);
        setPrice(price);
        // console.warn("[TEST] OfferDisplaySingle() Getting Price For Token:" + nft.token_id, { nft, price });
        let supply = await getSupply(nft.token_id);
        setStock(supply);
        // console.warn("[TEST] OfferDisplaySingle() Getting supply For Token:" + nft.token_id, { nft, supply });   //TODO: Test This
        let credit = await getCredit(account, nft.token_id);
        setCredit(credit);
        // console.warn("[TEST] OfferDisplaySingle() Getting credit For Token:" + nft.token_id + " is: " + credit, { account });
    };


    // if(nft.contract_type == 'ERC1155') console.warn("[DEV] OfferDisplaySingle() "+nft.contract_type, {nft});

    const handleTransferClick = (nft) => {
        setNftToSend(nft);
        setVisibility(true);
    };
    const handleBuyClick = (nft) => {
        setNftToSend(nft);
        setBuyVisible(true);
    };
    const handleChange = (e) => {
        setAmount(e.target.value);
    };

    /**
     * Transfer NFT
     */
    async function transfer(nft, amount, receiver) {
        const options = {
            type: nft.contract_type,
            tokenId: nft.token_id,
            receiver: receiver,
            contractAddress: nft.token_address,
        };

        if (options.type?.toLowerCase() === "erc1155") options.amount = amount;

        setIsPending(true);
        await Moralis.transfer(options)
            .then((tx) => {
                console.log("transfer() Success", tx);
                setIsPending(false);
            })
            .catch((error) => {
                console.error("[CAUGHT] transfer() Error on Transfer", error);
                alert(error.message);
                setIsPending(false);
            });
    }

    return (
        <>
            <Card
                size="small"
                className="item NFT lightUp"
                hoverable
                key={nft.token_id}
                style={{
                    width: "var(--cardWidth)",
                    border: "2px solid #e7eaf3",
                    overflow: "hidden",
                }}
                cover={
                    <div className="card" style={{ width: '200px' }}>
                        <div className="inner flex" style={{ flexDirection: 'column' }}>
                            <Image
                                preview={false}
                                src={nft.image || "error"}
                                // src={image || "error"}
                                fallback="data:image/png;base64,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"
                                alt=""
                            // style={{ height: "var(--cardHeight)", width: "var(--cardWidth)" }}
                            />
                            <Meta
                                style={{ padding: '10px' }}
                                title={nft?.metadata?.name}
                                description={<>
                                    <div> Offer #{nft.token_id}</div>
                                    <div> Credit: {credit}</div>
                                    <div> Price: {price}</div>
                                    <div> Qty: {stock}</div>
                                </>}

                            />
                            {/* <Meta title={nft?.metadata?.name} /> */}
                        </div>
                    </div>
                }
                actions={
                    [
                        <Tooltip title="Buy Tokens">
                            <DollarCircleOutlined
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleBuyClick(nft);
                                }}
                            />
                        </Tooltip>,
                        <Tooltip title="Send Credits">
                            <SendOutlined
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleTransferClick(nft);
                                }}
                            />
                        </Tooltip>,
                        <Tooltip title="Offer Details">
                            {/* <ShoppingCartOutlined onClick={(event) => { event.preventDefault(); alert("OPENSEA INTEGRATION COMING!"); }} /> */}
                            <Link to={{ pathname: "/offer/" + nft.token_id }}>
                                <SelectOutlined />
                            </Link>
                        </Tooltip>,
                    ]}
            ></Card >

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
                    <Input placeholder="amount to send" onChange={(evt) => handleChange(evt)} />
                )}
            </Modal>

            <Modal
                title={`Buy ${nftToSend?.name || "NFT"}`}
                visible={buyVisible}
                onCancel={() => setBuyVisible(false)}
                onOk={(values) => {
                    let totalPrice = price * amountToSend;

                    // let bigInt = Moralis.Units.Token(totalPrice, "18");
                    // console.warn("!! [TEST] Buy " + amountToSend + " Units of Token:" + nftToSend.token_id, { nftToSend, bigInt, totalPrice });

                    buy(nftToSend.token_id, amountToSend, totalPrice)
                        .catch(error => {
                            message.error("Sorry, Purchase failed.", 10);
                            console.error("[TEST] Error buying Token:" + nftToSend.token_id, { amountToSend, totalPrice, error });
                        });
                }}
                confirmLoading={isPending}
                okText="Buy"
            >
                <Input placeholder="amount to buy" onChange={(evt) => handleChange(evt)} />
            </Modal>

        </>
    );
} //OfferDisplaySingle()

export default OfferDisplaySingle;
