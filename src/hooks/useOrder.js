import React, { useEffect, useState, useContext } from "react";
import { OfferContractContext } from "context/context";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useIPFS } from "hooks/useIPFS";


/**
 * Hook: Interface for Orders on the Offers Contract
 */
export const useOrder = (props = {}) => {
    const { token_id, order_id } = props;
    const { Moralis, isInitialized, account } = useMoralis();
    const contractProcessor = useWeb3ExecuteFunction();
    const { contractData } = useContext(OfferContractContext);
    const { resolveLink } = useIPFS();

    const [order, setOrder] = useState();
    const [isBuyer, setIsBuyer] = useState();
    const [status, setStatus] = useState();
    const [metadata, setMetadata] = useState();

    useEffect(() => {
        console.warn("[TEST] useOrder() Fetching Order's on-chain data");
        if (isInitialized && account && token_id && order_id) loadOrderData(token_id, order_id);
    }, [token_id, order_id, isInitialized, account]);
    const loadOrderData = async (token_id, order_id) => {
        //Order Data
        const query = new Moralis.Query("mumbaiOfferOrderd")
            .equalTo("token_id", token_id)
            .equalTo("order_id", order_id)
            .addDescending("updatedAt");    //TODO: Is this right?
        query.first().then(order => {
            setOrder(order);
            setIsBuyer(order.get('account') === account);
            if (order?.get('uri')) fetchMetadata(order.get('uri'));
        });
        //Order Status
        getStatus(token_id, order_id, true).then(res => setStatus(res));
    };
    const fetchMetadata = async (uri) => {
        //Get Metadata
        fetch(resolveLink(uri))
            .then((res) => res.json())
            .then((result) => {
                //Log
                if (!result) console.error("useOrder.fetchMetadata() Failed to Fetch Metadata URI:", { uri, result },);
                else console.warn("[FYI] useOrder.fetchMetadata() Metadata ", { uri, result },);
                setMetadata(result);
            })
            .catch((err) => {
                console.error("useOrder.fetchMetadata() Error Caught:", { err, uri });
            });
    };

    /**
     * Get Order's Status
     */
    async function getStatus(token_id, order_id, name = false) {
        const options = {
            contractAddress: contractData.hash,
            abi: contractData.abi,
            functionName: "status",
            params: { token_id, order_id },
        };
        return Moralis.executeFunction(options).then((response) => {
            const statuseNames = ['cancelled', 'requested', 'delivered', 'closed'];
            return name ? statuseNames[response] : response;
        });
    }

    return {
        getStatus,  //Exposed Functions
        order, status, isBuyer, metadata,    //Data
    };
};//useOrder()