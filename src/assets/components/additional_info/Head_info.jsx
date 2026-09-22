import { createPortal } from "react-dom";

function LinkPreview({ link, title, description, image }) {
    if (!link || !title || !description) {
        console.warn("Missing required props for LinkPreview component.");
        return null;
    }
    if (image){
        return createPortal(
            <>
                <meta name="description" content={description}/>

                <meta property="og:url" content={link}/>
                <meta property="og:type" content="website"/>
                <meta property="og:title" content={title}/>
                <meta property="og:description" content={description}/>
                <meta property="og:image" content={image}/>
                <meta property="og:image:type" content="image/jpeg"/>
                <meta property="og:image:width" content="1920"/>
                <meta property="og:image:height" content="1080"/>

                <meta name="twitter:card" content="summary_large_image"/>
                <meta property="twitter:url" content={link}/>
                <meta name="twitter:title" content={title}/>
                <meta name="twitter:description" content={description}/>
                <meta name="twitter:image" content={image}/>
            </>,
            document.head
        );
    } else {
        return createPortal(
            <>
                <meta name="description" content={description}/>

                <meta property="og:url" content={link}/>
                <meta property="og:type" content="website"/>
                <meta property="og:title" content={title}/>
                <meta property="og:description" content={description}/>

                <meta name="twitter:card" content="summary_large_image"/>
                <meta property="twitter:url" content={link}/>
                <meta name="twitter:title" content={title}/>
                <meta name="twitter:description" content={description}/>
            </>,
            document.head
        );
    }
}

function TitleHead({title}){
    if (!title) {
        console.warn("Missing required prop 'title' for TitleHead component.");
        return null;
    }
    return createPortal(
        <>
            <title>{title}</title>
        </>,
        document.head
    );
}

export { LinkPreview, TitleHead };