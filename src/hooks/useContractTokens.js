import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import { useIPFS } from "hooks/useIPFS";

/**
 * Fetch Contract's Tokens (All)
 */
export const useContractTokens = (props) => {
    // const { Moralis, chainId } = useMoralis();
    const { Moralis, isInitialized } = useMoralis();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState();
    const [tokens, setTokens] = useState([]);
    const { resolveLink } = useIPFS();
    const { verifyMetadata } = useVerifyMetadata();

    useEffect(() => {
        //Log
        console.warn("[TEST] useContractTokens() Run on Prop change", props);
        //Load Tokens
        if (isInitialized && props.address && props.chain) getContractTokens(props.address, props.chain);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props?.address, props?.chain, isInitialized]);

    /**
     * Set Procedure
     */
    const setNFTs = (NFTs) => {
        for (let NFT of NFTs) {
            if (NFT?.metadata) {
                //Parse JSON
                if (typeof NFT.metadata == 'string') NFT.metadata = JSON.parse(NFT.metadata);
                // metadata is a string type
                NFT.image = resolveLink(NFT.metadata?.image);
            }
            //Verify Metadata
            else NFT = verifyMetadata(NFT);
        }
        setTokens(NFTs);
    };

    /**
     * Fetch all Contract's Tokens via Moralis NFT SDK
     */
    async function getContractTokens(address, chain) {
        //Before - Clear Error
        setError();
        setIsLoading(true);
        const options = { address, chain };
        try {
            const response = await Moralis.Web3API.token.getAllTokenIds(options);
            // console.warn("[TEST] getContractTokens() Moralis.Web3API.token.getAllTokenIds() ", response);    //V
            //Set NFTs
            response?.result ? setNFTs(response.result) : setNFTs([]);
        }
        catch (error) {
            console.error("getContractTokens() Error:", { options, error });
            setError(error);
        }
        //Done Loading
        setIsLoading(false);
    };

    //Return
    return { tokens, isLoading, error };

}//useContractTokens()
