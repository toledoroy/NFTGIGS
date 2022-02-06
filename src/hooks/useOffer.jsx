/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext } from "react";
import { OfferContractContext } from "context/context";
import {
  useMoralis,
  useMoralisWeb3Api,
  useMoralisWeb3ApiCall,
  useWeb3ExecuteFunction,
} from "react-moralis";
// import { IPFS } from "helpers/IPFS";
// import { useIPFS } from "./useIPFS";
// const axios = require("axios").default;

export const useOffer = (props) => {
  const { Moralis, chainId } = useMoralis();
  const contractProcessor = useWeb3ExecuteFunction();
  const { contractData } = useContext(OfferContractContext);

  /**
   * Save JSON File to IPFS
   */
  async function saveJSONToIPFS(jsonObject, fileName = "file.json") {
    //Save to IPFS
    const file = new Moralis.File(fileName, { base64: btoa(JSON.stringify(jsonObject)) });
    return file.saveIPFS().then(result => {
      //Return Conventional IPFS URI
      return "ipfs://" + result.hash();
    });
  };

  async function contractCall(options) {
    //Call Function
    // return await Moralis.executeFunction(options)
    //   .catch((error) => {
    //     if (error.code === 4001) console.warn("useOffer.sell() Failed -- User Rejection", { error, options });
    //       else console.error("useOffer.sell() Failed", { error, options });
    //       throw new Error("useOffer.sell() Failed  " + error);
    //   });

    return await contractProcessor.fetch({
      params: options,
      onSuccess: (result) => {
        //Log
        console.log("contractCall() Success", { options, result });
        //Return Transaction result
        return result;
      },
      onError: (error) => {
        if (error.code === 4001) console.warn("contractCall() Failed -- User Rejection", { error, options });
        else console.error("contractCall() Failed", { error, options });
        throw new Error("contractCall() Failed  " + error);
      },
    });
  }

  /**
   * Sell (Make a New Offer)
   */
  async function sell(token_price, max_supply, token_uri) {
    //Validate
    if (!contractData) throw new Error("useOffer.sell() Contract Data Missing", { contractData });
    if (!token_price || !max_supply || !token_uri) throw new Error("useOffer.sell() Missing Parameters", { token_price, max_supply, token_uri });
    const options = {
      contractAddress: contractData.hash,
      abi: contractData.abi,
      functionName: "sell",
      params: { token_price, max_supply, token_uri },
    };
    //Run Contract Call
    return contractCall(options);
  } //sell()

  /**
   * buy
   * @param num quantity
   * @param num token_id
   * @param num totalPrice    Payment Amount
   */
  async function buy(token_id, quantity, totalPrice) {
    //Validate
    if (!contractData) throw new Error("useOffer.buy() Contract Data Missing", { contractData });
    if (!quantity || !token_id) throw new Error("useOffer.buy() Missing Parameters", { quantity, token_id });
    const options = {
      contractAddress: contractData.hash,
      abi: contractData.abi,
      functionName: "buy",
      params: { quantity, token_id },
      msgValue: totalPrice,
    };
    //Run Contract Call
    return contractCall(options).catch((error) => {
      if (error.message === "execution reverted: PAYMENT_MISMATCH") {
        console.warn("useOffer.buy() Failed -- Payment Mismatch", { error, options });
      }
      else throw new Error(error);  //Pass Onwards
    });
  } //buy()


  /**
   * order
   * @param num token_id
   */
  async function order(token_id, request_uri) {
    //Validate
    if (!contractData) throw new Error("useOffer.order() Contract Data Missing", { contractData });
    if (!request_uri || !token_id) throw new Error("useOffer.order() Missing Parameters", { request_uri, token_id });
    const options = {
      contractAddress: contractData.hash,
      abi: contractData.abi,
      functionName: "order",
      params: { token_id, request_uri },
    };
    //Run Contract Call
    return contractCall(options).catch((error) => {
      if (error.message === "execution reverted: PAYMENT_MISMATCH") { //TODO: NOT HERE - CHANGE THIS .. NO CREDIT OR SOMETHING
        console.warn("useOffer.order() Failed -- Payment Mismatch", { error, options });
      }
      else throw new Error(error);  //Pass Onwards
    });
  } //order()


  //-- Reads 

  /**
   * Get Token Price
   */
  async function getPrice(token_id) {
    const options = {
      contractAddress: contractData.hash,
      abi: contractData.abi,
      functionName: "price",
      params: { token_id },
    };
    return Moralis.executeFunction(options).then((response) => {
      return Number(response?.['_hex']);
    });
  }

  async function getSupply(token_id) {
    const options = {
      contractAddress: contractData.hash,
      abi: contractData.abi,
      functionName: "tokenSupplyAvailable",
      params: { token_id },
    };
    return Moralis.executeFunction(options).then((response) => {
      return Number(response?.['_hex']);
    });
  }

  /**
   * Get User's Credit
   */
  async function getCredit(account, token_id) {
    const options = {
      contractAddress: contractData.hash,
      abi: contractData.abi,
      functionName: "creditOf",
      params: { account, token_id },
    };
    return Moralis.executeFunction(options).then((response) => {
      // console.warn("[TEST] getCredit() Success", { options, response, Num: Number(response?.['_hex']) });
      return Number(response?.['_hex']);
    });
  }

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
    sell, buy, order,
    saveJSONToIPFS,
    getPrice, getSupply, getCredit, getStatus,
  };
};
