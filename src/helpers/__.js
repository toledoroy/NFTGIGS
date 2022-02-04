//Export General Helper
export const __ = {
  sanitize: (str) => {
    try {
      return typeof str === "string" ? str.toString().replace(/_/g, " ") : str;
    } catch (err) {
      console.error("__.sanitize() Error sanitizing metadata field:", {
        str,
        err,
      });
      return str;
    }
  }, //sanitize()

  nl2br: (str) => {
    return !str ? str : str.replace(/(?:\r\n|\r|\n)/g, "<br/>");
  },

  stripHTML: (str) => {
    return !str ? str : str.replace(/<[^>]*>?/gm, "");
  },

  stackContainerStyle: (length) => {
    let style = {};
    if (length && length > 1) {
      let len = length < 4 ? length : 4; //Max of 4 in a stack
      style.transform = "rotate(-" + 5 * (len - 1) + "deg)";
    }
    return style;
  },

  matchAddr: (a1, a2) => String(a1).toLowerCase() === String(a2).toLowerCase(),

  /**
   * Match URI Function
   * Try to ignore similar IPFS URLs
   * @param string uri1
   * @param string uri2
   * @returns
   */
  matchURI: (uri1, uri2) => {
    if (String(uri1).toLowerCase().includes("ipfs")) {
      //Try to ignore this if URLs have the same IPFS ID
      let uri1Adjusted = uri1
        .replace("https://ipfs.moralis.io:2053/ipfs/", "")
        .replace("ipfs://", "");
      let uri2Adjusted = uri2
        .replace("https://ipfs.moralis.io:2053/ipfs/", "")
        .replace("ipfs://", "");

      // if(uri1Adjusted !== uri2Adjusted) console.warn("[TEST] Different IPFS IDs", {uri1, uri2, uri1Adjusted, uri2Adjusted});   //V

      return uri1Adjusted === uri2Adjusted;
    }
    return uri1 === uri2;
  },

  /**
   * Chop string to size & Add '...' at the end
   * @param {string} str
   * @param {number} n    Max number of chars
   * @returns {string}
   */
  ellipsis: (str, n = 6) => {
    return str.length > n ? `${str.trim().slice(0, n)}...` : str;
  },
};

export default __;
