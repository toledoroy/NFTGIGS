import React, { useState, useEffect, useContext } from 'react';
// import { Link } from "react-router-dom";
import { Button, Col, Row } from "antd";
// import { useIPFS } from "hooks/useIPFS";
// import { useMoralis } from "react-moralis";
import { useChain } from "react-moralis";


/** 
 * Component: Wrong Network Message
 */
function MessageWrongNetwork(props) {
    // const { chainId } = useMoralis();
    const { switchNetwork } = useChain();

    return (
        <Row className="welcom_message container" style={{ margin: '10px 0 30px 0' }}>
            <Col xs={24} className="framed">
                <div className="inner">
                    <p className="" style={{ padding: '10px 0', fontSize: '1.3rem', fontWeight: '500', lineHeight: '2rem', color: 'var(--color)' }}>
                        Hi!  🙋
                        <br />
                        This is dApp is an early version for test purposes.
                        <br />
                        For this dApp to work, please make sure you're connected to the
                        <Button type="link" title="Mumbai Testnet" onClick={() => switchNetwork('0x13881')} style={{ fontSize: '1.1em', color: 'cornsilk', fontWeight: '400' }}>
                            Mumbai Testnet
                        </Button>
                    </p>
                </div>
            </Col>
        </Row >
    );
};//MessageWrongNetwork()

export default MessageWrongNetwork;