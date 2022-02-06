import React, { useState, useEffect, useContext } from 'react';
// import { Table } from 'antd';
// import { Link } from "react-router-dom";
// import { Input } from "antd";
// import { OfferContractContext } from "context/context";
import { useOffer } from "hooks/useOffer";
// import { useIPFS } from "hooks/useIPFS";
import { useMoralis, useMoralisQuery } from "react-moralis";


/**
 * My Orders Page
 */
function OrderSingle(props) {
    const { token_id, order_id } = props.match.params;
    const { Moralis, account } = useMoralis();


    return (
        <div className="framed order">
            <h1>Order {'G' + token_id + 'G' + order_id}</h1>
        </div>
    );
} //OrderSingle()

export default OrderSingle;
