import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis"; //useWeb3ExecuteFunction
import { ChainHelper } from "helpers/ChainHelper";
import { PersonaHelper } from "helpers/PersonaHelper";
import { Form, Input, Select } from "antd";
import { Popconfirm, Spin, Col, Button, message, Skeleton } from "antd";
// import { Link } from "react-router-dom";
import { IPFS } from "helpers/IPFS";
// const formFields = require('schema/PersonaData.json');
const formFields = {
  // "role":{
  //     "label": "Role",
  //     "name": "role",
  //     "placeholder": "Persona, developer, hacker, designer, writer, or maybe a community manager?",
  //     "rules": [{ "required": true, "message": "What is your main use of this persona" }]
  // },
  name: {
    label: "Title",
    name: "name",
    placeholder: "What are you offering?",
    rules: [
      { required: true, message: "Seems you forgot to fill in the title" },
    ],
  },
  price: {
    label: "Price",
    name: "price",
    placeholder: "How much?",
    rules: [
      { required: true, message: "Seems you forgot to fill in your price" },
    ],
  },
};

/**
 * Offer(s) Page
 *
 */
function OfferMake(props) {
  // const { persona, contract } = props;
  const { persona, isLoading, setIsEditMode, form, reloadmetadata, canEdit } =
    props;
  // const tokenId = persona.get('token_id');
  const [isSaving, setIsSaving] = useState(false);
  const [stage, setStage] = useState(null);
  // const [ formSocial, setFormSocial ] = useState({});
  const [metadata, setMetadata] = useState(props.metadata); //From Parent
  // const { mint, update } = usePersona();
  // const { Moralis, setUserData, user, isAuthenticated } = useMoralis();
  const { Moralis, user, isAuthenticated, chainId } = useMoralis();
  // const contractProcessor = useWeb3ExecuteFunction();

  //Contract Data
  // const contractPersona = Persona.getContractData();
  // const [form] = Form.useForm();   //Now on Parent for Parental Control

  // useEffect(() => {
  //     console.log("OfferMake() Stage:"+stage);
  // }, [stage]);

  //Listen to Props Metadata Update
  useEffect(() => {
    //Refresh Metadata on Every Load! (After Updating Chain, This Component's metadata doesn't match the updated parent)
    console.log("OfferMake() Reloading Metadata", props.metadata);
    setMetadata(props.metadata);
    // setImageUrl(props.metadata?.image);
  }, [props.metadata]);

  /**
   * Sanitize Metadata Before Save
   */
  const metadataSanitize = (metadata) => {
    for (let i = metadata.accounts.length - 1; i >= 0; i--) {
      // console.warn("[TEST] metadataSanitize() Action:'"+action+"' Account:"+i, {accounts:metadata.accounts, account:metadata.accounts[i], i});
      if (!metadata.accounts[i].address || !metadata.accounts[i].chain) {
        //Log
        console.warn("[TEST] metadataSanitize() Removing Invalid Account ", {
          account: metadata.accounts[i],
        });
        metadata.accounts.splice(i, 1);
        break;
      }
    }
    //Trimming any whitespace?
    for (let key of ["role", "name", "description", "purpose"])
      if (metadata[key]) metadata[key] = metadata[key].trim();
    //Return
    return metadata;
  }; //metadataSanitize

  /**
   *
   */
  function savePersona(metadata) {
    //Sanitize
    metadata = metadataSanitize(metadata);
    //Add generator tag to metadata
    metadata.generator = "nftbonfire.space";
    //Update Metadata
    // setMetadata({...metadata, ...values});
    setMetadata(metadata);
    //Update Persona (local)
    persona.set("metadata", metadata);

    //Log
    console.warn(
      "[DEBUG] OfferMake.saveMetadata() Updated Values to Metadata",
      { persona, metadata },
    );

    setIsSaving(true);
    setStage("SavingToIPFS");
    //Save Metadata to IPFS
    // saveJSONToIPFS(metadata).then(uri => {
    IPFS.saveJSONToIPFS(Moralis, metadata)
      .then(async (uri) => {
        try {
          //Log
          console.warn("OfferMake.saveMetadata() Saving Persona to Contract:", {
            metadata,
            uri,
          });
          /*
                if(persona.get('token_id')){
                    setStage('UpdateToken');
                    //Update Contract
                    let res = await update(persona, uri);   //Promise
                    //Log
                    console.warn("[TEST] OfferMake.saveMetadata() After Update:", {res, metadata, uri});
                }else{
                    setStage('MintToken')
                    //Mint New NFT
                    let res = await mint(persona, uri);
                    //Log
                    console.warn("[TEST] OfferMake.saveMetadata() After Mint:", {res, metadata, uri});
                }
                */
          //Done Saving
          // setIsSaving(false);
          setStage("SUCCESS");
          //Done Editing
          setIsEditMode(false);
        } catch (error) {
          //Log
          console.error(
            "OfferMake.saveMetadata() Error Saving Persona to Contract:",
            { error, metadata, uri, persona },
          );
          //Done Saving
          // setIsSaving(false);
          setStage("FAILED");
        }
      })
      .catch(function (error) {
        message.error("Failed to save file to IPFS. " + error);
        console.error("[CAUGHT] OfferMake.saveMetadata() IPFS Call Failed:", {
          error,
          metadata,
          isAuthenticated,
          user,
          persona,
        });
        //Done Saving
        // setIsSaving(false);
        setStage("FAILED");
      });
    //Done Saving
    setIsSaving(false);
  } //saveMetadata()

  /**
   * Save Procedure (Form Submit Function)
   * @var object values       Additional Metadata Values
   * @ret void
   */
  const onFinish = async (values) => {
    // console.warn("[TEST] OfferMake.onFinish() Updated Values ", {chainId, persona});

    //Validate Chain
    if (persona?.get("chain") && persona.get("chain") !== chainId) {
      //User Error
      message.error(
        "Current Chain () is not yet supported. Please change to:" +
          ChainHelper.get(persona?.get("chain"), "name") +
          " chain",
        60,
      );
      throw new Error("[TEST] OfferMake.onFinish() Validate Chain");
    }

    //Update Metadata
    let newMetadata = { ...metadata, ...values };
    //Save Persona (to Contract)
    savePersona(newMetadata);

    //TODO: Redirect to new Persona URL
    // history.push('/room/'+newPost.id);
  }; //onFinish()

  /**
   * Reset Metadata Form
   */
  function formReset() {
    setMetadata(props?.metadata);
    //Log
    console.log("(i) OfferMake() Metadata Form Reset", props?.metadata);
    //Reset Form
    form.resetFields();
  }

  let size = 200; //Avater Circumference

  return (
    <div className="framed offer">
      <h1>Make an Offer</h1>

      <Col className="personaEdit">
        {/* <Col xs={24} lg={{ span: 20, offset: 2 }} className="personaEdit"> */}
        <Skeleton active loading={isLoading}>
          <Form
            name="personaForm"
            id="personaEditForm"
            onFinish={onFinish}
            onFinishFailed={console.error}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={metadata}
            // initialValues={{ remember: true, }}
            // initialValues={{name: "name",}}  //V
            autoComplete="off"
            form={form}
          >
            {Object.values(formFields).map((field) => {
              if (field.element) return field.element;
              else {
                //Extract Placeholder
                let placeholder = Array.isArray(field.placeholder)
                  ? field.placeholder[
                      Math.floor(Math.random() * field.placeholder.length)
                    ]
                  : field.placeholder;
                if (field.name === "social") {
                  /* Handled Elsewhere */
                } else if (field.name === "links") {
                  return null; //MOVED
                  /* MOVED
                        return( 
                        <div className="links_wrapper">
                            <h2><i className="bi bi-link"></i> Links</h2>
                            <div key="items" className="items">
                            <Row>
                                {metadata?.links?.map((link, index) => {
                                    // E.G. {type: 'blog', title: 'BayonEI', url: 'http://bayonei.com'}
                                    // console.log("[DEV] link to:"+link.type+" Title:'"+link.title+"'", link.url);
                                    return (
                                    <Col xs={24} lg={12} key={link.title+index}>
                                        <Input.Group compact className="item" style={{display: 'flex', width:'100%', paddingRight:'10px'}} >
                                            <Input name="URL" defaultValue={link.url} placeholder="URL" 
                                                addonBefore={<Select defaultValue={link.type} style={{minWidth:'99px'}} className="select-before">
                                                    <Select.Option value="website">Website</Select.Option>
                                                    <Select.Option value="blog">Blog</Select.Option>
                                                </Select>}
                                            />
                                            <Input name="name" placeholder="Title" defaultValue={link.title} style={{flexShrink:'2'}}/>
                                            <Button type="danger" shape="circle" icon={<DeleteOutlined />} onClick={() => {
                                                // let links = metadata.links;
                                                let links = [...metadata.links];    //Clone
                                                // console.warn("[TEST] Remove Link:"+index, {links:[...links], res:links.splice(index, 1)});
                                                links.splice(index, 1);
                                                setMetadata({...metadata, links});
                                            }}/>
                                        </Input.Group>
                                    </Col>
                                    );
                                })//Each Link
                                }
                                <div key="clear1" className="clearfloat"></div>
                                <Button type="primary" shape="circle" icon={<PlusCircleOutlined />} onClick={() => {
                                    let links = [...metadata.links];    //Clone
                                    // links.splice(index, 1);
                                    links.push({type:'', title:'', url:''});
                                    setMetadata({...metadata, links});
                                }}/>
                            </Row>
                            </div>
                        </div>
                        );
                        */
                } //Links
                else if (field.type === "object") {
                  console.log(
                    "[UNHANDLED] OfferMake() object field:" + field.name,
                    { field, fieldData: metadata?.[field.name] },
                  );
                } //object
                else if (field.type === "items") {
                  //Log
                  if (field.name !== "accounts")
                    console.log("[UNHANDLED] OfferMake() items field:", {
                      field,
                      fieldData: metadata?.[field.name],
                    });
                } //Object Array
                else if (field.type === "array") {
                  //Tags
                  console.log("[TEST] OfferMake() array field:" + field.name, {
                    type: field.type,
                    field,
                    metadata,
                    fieldData: metadata[field.name],
                  });
                  return (
                    <Select
                      key={field.name}
                      mode="tags"
                      style={{ width: "100%" }}
                      label={field.label}
                      name={field.name}
                      placeholder={placeholder}
                    >
                      {metadata[field.name] &&
                        metadata[field.name].map((item, index) => {
                          return (
                            <Select.Option key={index}>{item}</Select.Option>
                          );
                        })}
                    </Select>
                  );
                } //Array (Tags)
                else if (field.type === "textarea") {
                  //Long Text
                  return (
                    <Form.Item
                      key={field.name}
                      name={field.name}
                      label={field.label}
                      rules={field.rules}
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        placeholder={placeholder}
                        onChange={(evt) => {
                          // console.log("Changed", field.name, evt.target.value, metadata);
                          setMetadata({
                            ...metadata,
                            [field.name]: evt.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  );
                } //Textarea (Long Text)
                else {
                  //Default (Single String Input)
                  return (
                    <Form.Item
                      key={field.name}
                      name={field.name}
                      label={field.label}
                      rules={field.rules}
                    >
                      <Input
                        placeholder={placeholder}
                        onChange={(evt) => {
                          // console.log("Changed", field.name, evt.target.value, metadata);
                          setMetadata({
                            ...metadata,
                            [field.name]: evt.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  );
                }
                return null; //if all else missed
              } //Each Field
            })}

            <div className="buttons">
              {stage === "SavingToIPFS" && (
                <div className="saving">
                  <span>Please wait while saving the metadata to IPFS</span>
                  <br />
                  <Spin style={{ display: "block" }} />
                </div>
              )}
              {stage === "MintToken" && (
                <div className="saving">
                  <span>
                    Please confirm minting request on your web3 wallet
                  </span>
                  <br />
                  <Spin style={{ display: "block" }} />
                </div>
              )}
              {stage === "UpdateToken" && (
                <div className="saving">
                  <span>
                    Please confirm the update request on your web3 wallet
                  </span>
                  <br />
                  <Spin style={{ display: "block" }} />
                </div>
              )}
              {(stage === null || stage === "FAILED") && (
                <Form.Item
                  wrapperCol={{ offset: 6 }}
                  // wrapperCol={{ offset: 1, span: 10 }}
                >
                  {PersonaHelper.isNew(persona) ? (
                    <Popconfirm
                      title={
                        <div className="tooltip">
                          <ul>
                            <li>
                              When saving data on the blockchain you will be
                              charged a network fee (gas).
                            </li>
                            <li>
                              You own your data and you can take it with you to
                              other websites, if you wish.
                            </li>
                            <li>
                              Keep in mind that everything you save on the
                              blockchain will always be accessible in some way.
                            </li>
                          </ul>
                        </div>
                      }
                      // onConfirm={() => onFinish({}) }
                      onConfirm={() => form.submit()}
                      icon=""
                      //   onVisibleChange={() => console.log('visible change')}
                    >
                      <Button type="primary">Mint New Persona</Button>
                    </Popconfirm>
                  ) : (
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={!canEdit()}
                    >
                      Save
                    </Button>
                  )}
                  {/* <Button onClick={formReset} style={{marginLeft:'20px' }}>Reset</Button> REMOVED */}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      reloadmetadata();
                      setIsEditMode(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Form.Item>
              )}
            </div>
          </Form>
        </Skeleton>
      </Col>
    </div>
  );
} //OfferMake()

export default OfferMake;
