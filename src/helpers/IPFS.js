//Export IPFS Helper
export const IPFS = {
  //IPFS Gateway Servers
  gateway: {
    moralis: "https://ipfs.moralis.io:2053/ipfs/",
    cloudflare: "https://cloudflare-ipfs.com/ipfs/",
  },

  // resolveLink(url){ return (!url || !url.includes("ipfs://")) ? url : url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/"); },
  // resolveLink(url){ return (!url || !url.includes("ipfs://")) ? url : url.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/"); },
  resolveLink(url) {
    return !url || !url.includes("ipfs://")
      ? url
      : url.replace("ipfs://", "https://ipfs.moralis.io:2053/ipfs/");
  }, //Use Moralis on Client
  resolveLinkCloudflare(url) {
    return !url || !url.includes("ipfs://")
      ? url
      : url.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
  },

  /** ...Needs Moralis...
   * Save JSON File to IPFS
   */
  saveJSONToIPFS: async (Moralis, jsonObject, fileName = "file.json") => {
    //Save Metadata to IPFS
    const file = new Moralis.File(fileName, {
      base64: btoa(JSON.stringify(jsonObject)),
    });
    return file.saveIPFS().then((result) => {
      console.log("[DEV] IPFS.saveJSONToIPFS() IPFS Hash for Metadata:", {
        // result,
        hash: result.hash(),
        hash2: file.hash(),
        // jsonObject,
      });
      //Return IPFS URL
      // return result.ipfs();    //Moralis URL
      return "ipfs://" + result.hash(); //General IPFS Conventional URL
    });
    // .catch(function(error) { console.error("[CAUGHT] IPFS.saveJSONToIPFS() IPFS Call Failed:", {error, user:Moralis.User.current() }); });
  }, //saveJSONToIPFS()

  /**
   * Save Image file to IPFS
   * @var object image
   * @ret string imageFile
   * @ret String URL
   */
  saveImageToIPFS: async (Moralis, image, fileName = "image.png") => {
    // const data = fileInput.files[0]
    // const file = new Moralis.File(data.name, data)
    const file = new Moralis.File(fileName, image);

    //Save File to Object
    // const jobApplication = new Moralis.Object('Applications')
    // jobApplication.set('resume', file)

    //Save Image to IPFS & Return Parse File
    // return await file.saveIPFS();
    await file.saveIPFS();
    let url = "ipfs://" + file.hash(); //General IPFS Conventional URL
    return url;
  }, //saveImageToIPFS()

  /**
   * Fetch File From IPFS by Hash (Works with JSON Filed)
   * @param string ipfsHash
   * @returns object
   */
  fetchJSONFromIPFS: async (ipfsHash) => {
    const url = `https://ipfs.moralis.io:2053/ipfs/${ipfsHash}`; //Force Moralis Gateway
    const response = await fetch(url);
    return await response.json();
  },
};

export default IPFS;
