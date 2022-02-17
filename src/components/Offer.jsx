/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from "react";
import { useMoralis, useNFTBalances } from "react-moralis";
import { Form, Input, InputNumber, Result, Button, Skeleton, Spin, message } from "antd";
import { Link } from "react-router-dom";
// import { rules } from "eslint-config-prettier";
import UploadImage from "components/Form/UploadImage";
import { useOffer } from "hooks/useOffer";
var _ = require("lodash");

/**
 * Offer Controller
 *
 * TODO:
 * V All Offers
 * V Single Offer
 * V Create an Offer
 * V Buy an Offer
 * V Order an Offer
 * - Order View
 * - Deliver Offer
 * - Approve & Review 
 */
function Offer(props) {
    const { isWeb3Enabled, isInitialized } = useMoralis();
    // const [metadata, setMetadata] = useState({});
    const [isSaving, setisSaving] = useState(false);
    const [files, setFiles] = useState({});
    const {
        sell, saveJSONToIPFS,
    } = useOffer();
    const curPage = props?.match?.params?.action;

    const [form] = Form.useForm(); //Form Handle
    useEffect(() => {
        console.log("Offers Controller -- Loaded Page: " + curPage);
    });

    /**
     * Describe all Offer Stages
     * @todo Validate Positive Numbers
     */
    const pages = {
        sell: {
            title: "Mint a new GIG",
            formFields: {
                //Offer Sell Form Structure
                image: {
                    type: "image",
                    label: "image",
                    // name: "image",
                    //Custom validation
                    rules: {
                        required: true,
                        message: "Make sure you add some kind of an Image for this gig",
                    },

                    isMetadata: true,
                },
                name: {
                    label: "Title",
                    // name: "name",
                    placeholder: "What are you offering?",
                    rules: [
                        {
                            required: true,
                            message: "Seems you forgot to fill in the title of your gig",
                        },
                    ],
                    isMetadata: true,
                },
                description: {
                    type: "textarea",
                    label: "Description",
                    // name: "description",
                    placeholder: "The fine print",
                    rules: [
                        {
                            required: true,
                            message: "You need to give some extra information about your gig",
                        },
                    ],
                    isMetadata: true,
                },
                token_price: {
                    type: "number",
                    label: "Price",
                    // name: "token_price",
                    placeholder: "How much?",
                    rules: [{ required: true, message: "If your product is free, type 0" }],
                    // addonAfter: "MATIC",
                    addonAfter: "WEI",
                },
                max_supply: {
                    type: "number",
                    label: "Supply",
                    // name: "max_supply",
                    placeholder: "How many?",
                    rules: [
                        { required: true, message: "What's your max capacity for this gig?" },
                    ],
                    addonAfter: "Orders",
                },
            },
            submit: async (data) => {

                // try {
                let uri = await saveJSONToIPFS(data.metadata);

                //TODO: Adjust Price (Using WEI on Test)
                // let price = data.token_price * 10 ** 18;
                let price = data.token_price;
                // console.warn("[TEST] Offer() Submitted Sell Func.", { data, uri, price });
                //Call Sell Function
                let result = await sell(price, data.max_supply, uri);
                // console.warn("[TEST] Offer() Sell Func. Completed", { data, uri, result });
                return result;
                // } catch (error) {
                //     console.error("[CAUGHT] Offer.sell() IPFS or Contract Call Failed:", { error, data });
                // }
            },
        },
        // buy: { },    //Modal
        order: {
            title: "Make an Order",
            formFields: {
                //Offer Order Form Structure
                details: {
                    type: "textarea",
                    label: "Details",
                    name: "details",
                    placeholder: "What do you need?",
                    isMetadata: true,
                },
            },
        },
        deliver: {},
        approve: {},
    };
    //Expected Current Page's Fields
    const formFields = pages[curPage].formFields;

    /**
     * Save Procedure (Form Submit Function)
     * @var object values       Additional Metadata Values
     * @ret void
     */
    const onFinish = async (values) => {
        // console.warn("[TEST] Offer.onFinish() Values ", { values }); //V

        //Request Data
        let data = {};
        // _.each(formFields)
        for (let key in formFields) {
            if (key === "image" || key === "file") {
                values[key] = files[key];

                //Log
                // console.warn("[TEST] Offer.onFinish() Fetch Image:", { key, value: values[key], files, });  //V
                // values[key] = "IMAGE PLACEHOLDER";

                //Custom Validation
                if (formFields[key].rules.required) {
                    if (!values[key]) {
                        message.error(formFields[key].rules.message);
                        console.error(`Offer.onFinish() Field ${key} is required`);
                        // throw new Error(`Field ${key} is required`);
                        return false;
                    }
                }
            } //File Support

            if (formFields[key].isMetadata) {
                //Init Metadata
                if (!data.metadata) data.metadata = {};
                //Append to Metadata  (Treat as Optinal Values)
                if (values[key]) data.metadata[key] = values[key];
            } else data[key] = values[key];
        } //Each Expected Item

        // console.warn("[TEST] Offer.onFinish() Ready to Submit Data:", data);

        //Start Saving
        setisSaving(true);
        //Run Action
        let result = await pages[curPage]
            .submit(data)
            .then((result) => {
                console.warn("[TEST] Offer.onFinish() (IN) Result:", result);    //V
                return result;
            })
            .catch((error) => {
                console.error("Offer.onFinish() Error:", error);
                message.error("Ooops, Something went wrong", 20);
            });
        //Done Saving
        setisSaving(false);

        // console.warn("[TEST] Offer.onFinish() (OUT) Result:", result); //V
    }; //onFinish()

    //Validate Requested Page
    if (!pages[curPage]) {
        return (
            <Result
                status="404"
                title="404"
                subTitle={
                    <div>
                        <p>Oh no, you might be lost.</p>
                    </div>
                }
                extra={
                    <>
                        <p>When in doubt, </p>
                        <Link to={{ pathname: "/" }}>
                            <Button type="primary">Go Back Home</Button>
                        </Link>
                    </>
                }
            />
        );
    } //404

    //Content
    return (
        <div className="framed offer">
            <Skeleton loading={!isInitialized} active>
                <h1>{pages[curPage].title}</h1>
                <Form
                    name="offerForm"
                    id="offerForm"
                    onFinish={onFinish}
                    onFinishFailed={console.error}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    // initialValues={{name: "name",}}
                    autoComplete="off"
                    form={form}
                    className="block"
                >
                    {_.map(formFields, function (field, field_name) {
                        if (field.element) return field.element;
                        //Allow Custom
                        else {
                            //Extract Placeholder
                            let placeholder = field.placeholder;
                            if (field.type === "image") {
                                return (
                                    <UploadImage
                                        key={field_name}
                                        size={250}
                                        updateImageURL={(value) => {
                                            setFiles((prevState) => {
                                                return { ...prevState, [field_name]: value };
                                            });
                                        }}
                                        imageUrl={files?.[field_name]}
                                    />
                                );
                            } //Files
                            else if (field.type === "textarea") {
                                //Long Text
                                return (
                                    <Form.Item
                                        key={field_name}
                                        name={field_name}
                                        label={field.label}
                                        rules={field.rules}
                                    >
                                        <Input.TextArea
                                            placeholder={placeholder}
                                            autoSize={{ minRows: 6, maxRows: 6 }}
                                        />
                                    </Form.Item>
                                );
                            } //Textarea (Long Text)
                            else {
                                //Default (Single String Input)
                                return (
                                    <Form.Item
                                        key={field_name}
                                        name={field_name}
                                        label={field.label}
                                        rules={field.rules}
                                    >
                                        {field.type === "number" ? (
                                            <InputNumber
                                                addonBefore={field.addonBefore}
                                                addonAfter={field.addonAfter}
                                            />
                                        ) : (
                                            <Input
                                                placeholder={placeholder}
                                                addonBefore={field.addonBefore}
                                                addonAfter={field.addonAfter}
                                            />
                                        )}
                                    </Form.Item>
                                );
                            }
                            return null; //if all else missed
                        } //Each Field
                    })}

                    <div className="buttons">
                        {isSaving && (
                            <div className="saving">
                                <span>Please wait while saving request</span>
                                <br />
                                <Spin style={{ display: "block" }} />
                            </div>
                        )}
                        {!isSaving && (
                            <Form.Item wrapperCol={{ offset: 8 }}>
                                <Button type="primary" htmlType="submit">
                                    Send
                                </Button>
                            </Form.Item>
                        )}
                    </div>
                </Form>
            </Skeleton>
        </div>
    );
} //Offer()

export default Offer;
