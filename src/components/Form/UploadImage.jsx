/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { Upload, message, Image } from "antd";
import {
    LoadingOutlined,
    CameraFilled,
    UploadOutlined,
} from "@ant-design/icons";
import { IPFS } from "helpers/IPFS";

/**
 * Component: Image Upload Component
 */
function UploadImage(props) {
    const { Moralis } = useMoralis();
    const [imageLoading, setImageLoading] = useState(false);
    const { updateImageURL, imageUrl } = props;

    let { size } = props;
    //Defaults
    if (size === undefined) size = 250;

    /**
     * File Upload Validation
     */
    function beforeUpload(file) {
        //Validations
        const isJpgOrPng =
            file.type === "image/jpeg" ||
            file.type === "image/png" ||
            file.type === "image/gif" ||
            file.type === "image/webp" ||
            file.type === "image/svg+xml";
        if (!isJpgOrPng) message.error("Sorry, only JPG/PNG/GIF files are currently supported");
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) message.error("Image must smaller than 2MB!");
        // return isJpgOrPng && isLt2M;

        //TODO: Fail the upload on error

        //Set Loading
        if (isJpgOrPng && isLt2M) setImageLoading(true);
        //Always False - Manual Upload Via handleChangeFile()
        return false;
    }

    /**
     * File Upload
     */
    const handleChangeFile = (info) => {
        console.log(
            "[TEST] UploadImage.handleChangeFile() File Upload - Status:" +
            info?.file?.status,
            { info },
        );
        try {
            if (info.file.status === undefined) {
                // saveImageToIPFS(info.file).then(result => {
                // IPFS.saveImageToIPFS(Moralis, info.file).then(result => {
                IPFS.saveImageToIPFS(Moralis, info.file).then((url) => {
                    console.log("[TEST] File Upload handleChangeFile() IPFS Hash:", url);
                    //Update Image
                    updateImageURL(url);
                    //Done Loading
                    setImageLoading(false);
                });
            } //Manual Upload
            else if (info.file.status === "error") {
                console.error(
                    "handleChangeFile() File Upload Error:",
                    info.file.error,
                    info,
                );
            } else
                console.error(
                    "handleChangeFile() File Upload Error -- Unhandled Status:" +
                    info.file.status,
                    info,
                );
        } catch (error) {
            //log
            console.error(
                "[CAUGHT] handleChangeFile() File Upload Error:",
                error,
                info,
            );
        }
    }; //handleChangeFile()

    return (
        <div
            className="upload_container"
            style={{
                textAlign: "center",
                margin: "auto",
                maxHeight: size,
                maxWidth: size,
                minHeight: '80px',
                cursor: "pointer",
            }}
        >
            <Upload
                name="image"
                className="image-uploader"
                showUploadList={false}
                multiple={false}
                beforeUpload={beforeUpload}
                onChange={handleChangeFile}
            >
                {imageLoading ? (
                    <div style={{ textAlign: "center" }}>
                        <LoadingOutlined />
                        <br />
                        <div className="explanation">Uploading Image to IPFS</div>
                    </div>
                ) : imageUrl ? (
                    <img width={size} src={IPFS.resolveLink(imageUrl)} />
                ) : (
                    ""
                )}
                <div className="upload_icons" style={{ fontSize: "2em" }}>
                    <CameraFilled /> Upload Image
                    {/* <UploadOutlined /> */}
                </div>
            </Upload>
        </div>
    );
} //UploadImage()

export default UploadImage;
