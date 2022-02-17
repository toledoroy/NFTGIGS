import React, { useState, useEffect, useContext } from 'react';
// import { Link } from "react-router-dom";
import { Button, Input, InputNumber } from "antd";
// import { OfferContractContext } from "context/context";
import { useOffer } from "hooks/useOffer";
import { useOrder } from "hooks/useOrder";
// import { useIPFS } from "hooks/useIPFS";
import { useMoralis, useMoralisQuery } from "react-moralis";


/** ... NOT SURE ABOUT THIS...
 * Order Review Page
 */
function OrderReview(props) {
    const { token_id, order_id } = props.match.params;
    const { Moralis, account, isInitialized, isWeb3Enabled } = useMoralis();
    const {
        saveJSONToIPFS,
        deliver,
        // getStatus,
        isSeller, //price, stock, credit, creator, 
    } = useOffer({ token_id });
    const { order, status, isBuyer, metadata } = useOrder({ token_id, order_id });

    const [metadataNew, setMetadataNew] = useState();

    return (
        <div className="framed order">
            <h1>Order {'G' + token_id + 'G' + order_id}</h1>
            <h3>Status: {status}</h3>
            {isSeller && <div className='block'>
                <h2>Deliver</h2>
                <div className='order-delivery'>
                    <Input.TextArea
                        placeholder={"Delivery Note"}
                        autoSize={{ minRows: 6, maxRows: 6 }}
                        onChange={(evt) => setMetadataNew(evt.target.value)}
                    />
                    <div>[Potential Image/File Upload]</div>
                    <Button default onClick={async () => {
                        //Save to IPFS & Register Delivery URI to the Contract
                        let delivery_uri = await saveJSONToIPFS(metadataNew);
                        deliver(token_id, order_id, delivery_uri);
                    }} disabled={!isSeller}>Deliver</Button>
                </div>
            </div>}
        </div>
    );
} //OrderReview()

export default OrderReview;
