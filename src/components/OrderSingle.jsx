import React, { useState, useEffect, useContext } from 'react';
// import { Link } from "react-router-dom";
import { Button, Input, InputNumber, Form, Radio } from "antd";
// import { OfferContractContext } from "context/context";
import { useOffer } from "hooks/useOffer";
import { useOrder } from "hooks/useOrder";
// import { useIPFS } from "hooks/useIPFS";
import { useMoralis } from "react-moralis";


/**
 * Single Order Page
 */
function OrderSingle(props) {
    const { token_id, order_id } = props.match.params;
    const { Moralis, account, isInitialized, isWeb3Enabled } = useMoralis();
    // const { resolveLink } = useIPFS();
    const {
        saveJSONToIPFS,
        deliver, //approve,
        price, isSeller, //stock, credit, creator
    } = useOffer({ token_id });
    const { order, status, isBuyer, metadata } = useOrder({ token_id, order_id });

    const [metadataNew, setMetadataNew] = useState();

    /**
     * Submit Approval Form
     * @param {*} values 
     */
    const onFinishReview = async (values) => {

    }
    return (
        <div className="framed offer order">
            <h3>Status: {status}</h3>

            {order &&
                <div className="order-info">
                    <div> Buyer: {order?.get('account')}</div>
                    <div> Price: {price}</div>
                    <div> URI: {order?.get('uri')}</div>
                </div>
            }

            {(status === 'requested') && <>
                {isSeller
                    ? <div className='block'>
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
                    </div>
                    : <div className='block'>Awaiting Delivery</div>}
            </>}

            {(status === 'delivered') && <>
                {isBuyer
                    ? <div className='block'>
                        <h2>Approval Stage</h2>
                        <div className='order-delivery'>
                            <h3>Review</h3>
                            <Form
                                name="reviewForm"
                                id="reviewForm"
                                onFinish={onFinishReview}
                                onFinishFailed={console.error}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                                labelWrap={false}
                                // initialValues={{name: "name",}}
                                autoComplete="off"
                            >
                                <Form.Item
                                    key={"review"}
                                    name={"review"}
                                    label={"Review"}
                                // rules={field.rules}
                                >
                                    <Input.TextArea
                                        placeholder={"Tell others about your experience"}
                                        autoSize={{ minRows: 4, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    key={"rating"}
                                    name={"rating"}
                                    label={"Rate"}
                                    style={{ display: 'flex' }}
                                // rules={field.rules}
                                >
                                    <Radio.Group buttonStyle="solid" size={'small'}>
                                        <Radio.Button value="1">1</Radio.Button>
                                        <Radio.Button value="2">2</Radio.Button>
                                        <Radio.Button value="3">3</Radio.Button>
                                        <Radio.Button value="4">4</Radio.Button>
                                        <Radio.Button value="5">5</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Form>

                        </div>
                    </div>
                    : <div className='block'>Awaiting Approval</div>}
            </>}
        </div>
    );

} //OrderSingle()

export default OrderSingle;
